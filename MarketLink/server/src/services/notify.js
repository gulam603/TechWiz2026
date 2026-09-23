import { Notification, User } from '../models/index.js';
import { sendMail } from './mailer.js';

/**
 * Creates an in-app notification and (optionally) sends the same message by e-mail.
 * @param {object} user  User document or id
 */
export async function notify(user, { type = 'system', title, message, link }, { email = false } = {}) {
  const userDoc = user?.email ? user : await User.findById(user).select('email name');
  if (!userDoc) return;
  await Notification.create({ user: userDoc._id, type, title, message, link });
  if (email) await sendMail({ to: userDoc.email, subject: title, message });
}

/** Sends the same in-app notification to many users at once. */
export async function notifyMany(userIds, { type = 'system', title, message, link }) {
  const unique = [...new Set(userIds.map(String))];
  if (!unique.length) return 0;
  await Notification.insertMany(unique.map((user) => ({ user, type, title, message, link })));
  return unique.length;
}
