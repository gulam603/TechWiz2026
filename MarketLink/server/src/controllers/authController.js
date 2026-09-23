import crypto from 'node:crypto';
import { User, Farmer } from '../models/index.js';
import { mailMode, sendMail } from '../services/mailer.js';
import AppError from '../utils/AppError.js';
import { ROLES, USER_STATUS } from '../utils/constants.js';
import { pick, requireFields, toBool } from '../utils/helpers.js';
import { readFarmDetails } from './helpers/farmDetails.js';
import { uniqueSlug } from '../utils/slug.js';
import { isoWeekKey } from '../utils/dates.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../middleware/auth.js';
import { notifyMany } from '../services/notify.js';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

function checkPassword(password) {
  if (!PASSWORD_RULE.test(String(password || ''))) {
    throw new AppError('Password must be at least 8 characters and contain letters and numbers', 400);
  }
}

async function buildSession(user) {
  const data = { user: user.toSafeJSON() };
  if (user.role === ROLES.FARMER) {
    data.farmer = await Farmer.findOne({ user: user._id }).select('stallName slug logo').lean();
  }
  return data;
}

async function startSession(req, res, user) {
  user.lastLoginAt = new Date();
  await user.save();
  setAuthCookie(req, res, signToken(user));
  return buildSession(user);
}

// POST /api/auth/register  (customer sign up)
export async function registerCustomer(req, res) {
  requireFields(req.body, ['name', 'email', 'password', 'phone', 'address']);
  checkPassword(req.body.password);
  const user = await User.create({
    ...pick(req.body, ['name', 'email', 'password', 'phone', 'address', 'city']),
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
  });
  res.status(201).json(await startSession(req, res, user));
}

// POST /api/auth/register-farmer  (farmer / stall sign up, needs admin approval)
export async function registerFarmer(req, res) {
  requireFields(req.body, ['stallName', 'contactPerson', 'phone', 'email', 'address', 'password']);
  checkPassword(req.body.password);
  if (req.body.acceptTerms !== undefined && !toBool(req.body.acceptTerms)) {
    throw new AppError('Please confirm that your details are correct and accept the market guidelines', 400);
  }
  const { stallName, contactPerson, phone, email, address, city, password } = req.body;
  // Optional details: bio, practices, what they grow, markets and map pin (validated before creating anything)
  const details = await readFarmDetails(req.body);

  const user = await User.create({
    name: contactPerson,
    email,
    password,
    phone,
    address,
    city,
    role: ROLES.FARMER,
    status: USER_STATUS.PENDING,
  });
  try {
    await Farmer.create({
      user: user._id,
      stallName,
      slug: await uniqueSlug(Farmer, stallName),
      contactPerson,
      phone,
      email: user.email,
      address,
      city,
      ...details,
      templateLastAppliedWeek: isoWeekKey(), // automatic weekly refresh starts next week
    });
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // keep data consistent if the profile fails validation
    throw err;
  }

  const admins = await User.find({ role: ROLES.ADMIN }).select('_id').lean();
  await notifyMany(
    admins.map((a) => a._id),
    {
      type: 'account',
      title: 'New farmer registration',
      message: `${stallName} (${contactPerson}) registered and is waiting for approval.`,
      link: '/admin/farmers?status=pending',
    }
  );

  res.status(201).json(await startSession(req, res, user));
}

async function verifyCredentials(email, password) {
  requireFields({ email, password }, ['email', 'password']);
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new AppError('Incorrect e-mail or password', 401);
  }
  if (user.status === USER_STATUS.SUSPENDED) throw new AppError('Your account has been suspended. Please contact support', 403);
  if (user.status === USER_STATUS.INACTIVE) throw new AppError('Your account has been deactivated. Please contact support', 403);
  return user;
}

// POST /api/auth/login  (customers and farmers)
export async function login(req, res) {
  const user = await verifyCredentials(req.body.email, req.body.password);
  if (user.role === ROLES.ADMIN) throw new AppError('Administrators must use the admin login page', 403);
  res.json(await startSession(req, res, user));
}

// POST /api/auth/admin/login  (separate admin portal)
export async function adminLogin(req, res) {
  const user = await verifyCredentials(req.body.email, req.body.password);
  if (user.role !== ROLES.ADMIN) throw new AppError('This login is for administrators only', 403);
  res.json(await startSession(req, res, user));
}

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(req, res);
  res.json({ message: 'Logged out' });
}

// GET /api/auth/me  -> { user: null } for visitors who are not logged in
export async function me(req, res) {
  if (!req.user) return res.json({ user: null });
  res.json(await buildSession(req.user));
}

// PUT /api/auth/me
export async function updateMe(req, res) {
  const allowed = pick(req.body, ['name', 'phone', 'address', 'city']);
  for (const key of ['name', 'phone', 'address']) {
    if (key in allowed && !String(allowed[key]).trim()) throw new AppError(`${key} cannot be empty`, 400);
  }
  Object.assign(req.user, allowed);
  await req.user.save();
  res.json(await buildSession(req.user));
}

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

// POST /api/auth/forgot-password  { email }
// Always answers the same way so nobody can find out which e-mails are registered.
export async function forgotPassword(req, res) {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!email) throw new AppError('Please enter your e-mail address', 400);
  const user = await User.findOne({ email });
  if (user && ![USER_STATUS.SUSPENDED, USER_STATUS.INACTIVE].includes(user.status)) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordHash = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 minutes
    await user.save();
    const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      message: `Hi ${user.name},\nWe received a request to reset your MarketLink password. Open this link within 30 minutes to choose a new one:\n${origin}/reset-password/${token}\nIf you did not ask for this, you can ignore this e-mail.`,
    });
  }
  res.json({ message: 'If an account exists for this e-mail, a password reset link has been sent.', emailMode: mailMode() });
}

// POST /api/auth/reset-password  { token, password }
export async function resetPassword(req, res) {
  requireFields(req.body, ['token', 'password']);
  checkPassword(req.body.password);
  const user = await User.findOne({ resetPasswordHash: hashToken(req.body.token), resetPasswordExpires: { $gt: new Date() } }).select(
    '+resetPasswordHash +resetPasswordExpires'
  );
  if (!user) throw new AppError('This reset link is invalid or has expired. Please request a new one', 400);
  user.password = req.body.password;
  user.resetPasswordHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Your password has been changed. You can now log in.' });
}

// PUT /api/auth/password
export async function changePassword(req, res) {
  requireFields(req.body, ['currentPassword', 'newPassword']);
  checkPassword(req.body.newPassword);
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(String(req.body.currentPassword)))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
}
