import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authorize, loadFarmer, optionalAuth, protect, requireApprovedFarmer } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { ROLES } from '../utils/constants.js';

import * as auth from '../controllers/authController.js';
import * as pub from '../controllers/publicController.js';
import * as markets from '../controllers/marketController.js';
import * as farmers from '../controllers/farmerController.js';
import * as products from '../controllers/productController.js';
import * as reviews from '../controllers/reviewController.js';
import * as orders from '../controllers/orderController.js';
import * as customer from '../controllers/customerController.js';
import * as notifications from '../controllers/notificationController.js';
import * as farm from '../controllers/farmerPortalController.js';
import * as admin from '../controllers/adminController.js';
import * as assistant from '../controllers/assistantController.js';

const router = Router();

// Brute-force protection: only failed logins count, so normal use is never blocked
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many failed attempts. Please try again in a few minutes.' },
});
// Spam protection for sign-up and contact forms
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests. Please try again later.' } });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, message: { message: 'You are sending messages too quickly.' } });

const productImage = imageUpload('products');
const farmerImages = imageUpload('farmers');
const marketImage = imageUpload('markets');
const categoryIcon = imageUpload('categories');

// ---------- Auth ----------
router.post('/auth/register', formLimiter, auth.registerCustomer);
router.post('/auth/register-farmer', formLimiter, auth.registerFarmer);
router.post('/auth/login', authLimiter, auth.login);
router.post('/auth/admin/login', authLimiter, auth.adminLogin);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', protect, auth.me);
router.put('/auth/me', protect, auth.updateMe);
router.put('/auth/password', protect, auth.changePassword);

// ---------- Public catalogue (optionalAuth adds favourite flags when logged in) ----------
router.get('/stats', pub.publicStats);
router.get('/categories', pub.listCategories);
router.get('/search', pub.globalSearch);
router.get('/map', pub.mapData);
router.get('/testimonials', pub.testimonials);
router.get('/announcements/active', optionalAuth, pub.activeAnnouncements);
router.post('/contact', formLimiter, pub.submitContact);

router.get('/markets', markets.listMarkets);
router.get('/markets/:idOrSlug', optionalAuth, markets.getMarket);

router.get('/farmers', farmers.listFarmers);
router.get('/farmers/:idOrSlug', optionalAuth, farmers.getFarmer);
router.get('/farmers/:idOrSlug/availability', farmers.getFarmerAvailability);

router.get('/products', products.listProducts);
router.get('/products/price-range', products.priceRange);
router.get('/products/:id', optionalAuth, products.getProduct);

router.get('/reviews', reviews.listReviews);
router.post('/assistant', chatLimiter, optionalAuth, assistant.chat);

// ---------- Notifications (any logged-in user) ----------
router.get('/notifications', protect, notifications.listNotifications);
router.get('/notifications/unread-count', protect, notifications.unreadCount);
router.post('/notifications/read-all', protect, notifications.markAllRead);
router.post('/notifications/:id/read', protect, notifications.markRead);
router.delete('/notifications/:id', protect, notifications.deleteNotification);

// ---------- Customer ----------
const customerOnly = [protect, authorize(ROLES.CUSTOMER)];
router.get('/customer/dashboard', ...customerOnly, customer.customerDashboard);
router.get('/customer/favorites', ...customerOnly, customer.getFavorites);
router.post('/customer/favorites/:type/:id', ...customerOnly, customer.toggleFavorite);
router.get('/customer/family', ...customerOnly, customer.getFamily);
router.post('/customer/family', ...customerOnly, customer.addFamilyMember);
router.delete('/customer/family/:memberId', ...customerOnly, customer.removeFamilyMember);

router.post('/orders', ...customerOnly, orders.placeOrders);
router.get('/orders/my', ...customerOnly, orders.myOrders);
router.get('/orders/family', ...customerOnly, orders.familyOrders);
router.get('/orders/:id', protect, orders.getOrder);
router.put('/orders/:id', ...customerOnly, orders.modifyOrder);
router.post('/orders/:id/cancel', ...customerOnly, orders.cancelOrder);
router.get('/orders/:id/reorder', ...customerOnly, orders.reorderItems);
router.post('/reviews', ...customerOnly, reviews.createReview);

// ---------- Farmer ----------
const farmerOnly = [protect, authorize(ROLES.FARMER), loadFarmer];
const approvedFarmer = [...farmerOnly, requireApprovedFarmer];
router.get('/farmer/me', ...farmerOnly, farm.getMyFarm);
router.put('/farmer/profile', ...farmerOnly, farmerImages.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), farm.updateFarmProfile);
router.put('/farmer/pickup', ...farmerOnly, farm.updatePickupSettings);
router.get('/farmer/insights', ...farmerOnly, farm.farmerInsights);

router.get('/farmer/products', ...farmerOnly, farm.myProducts);
router.post('/farmer/products', ...approvedFarmer, productImage.single('image'), farm.createProduct);
router.put('/farmer/products/:id', ...approvedFarmer, productImage.single('image'), farm.updateProduct);
router.patch('/farmer/products/:id/status', ...approvedFarmer, farm.setProductStatus);
router.delete('/farmer/products/:id', ...approvedFarmer, farm.deleteProduct);
router.put('/farmer/template', ...approvedFarmer, farm.updateTemplate);
router.post('/farmer/template/apply', ...approvedFarmer, farm.applyTemplateNow);

router.get('/farmer/orders', ...farmerOnly, farm.farmerOrders);
router.post('/farmer/orders/:id/:action', ...approvedFarmer, farm.updateOrderStatus);
router.get('/farmer/reviews', ...farmerOnly, farm.farmerReviews);
router.post('/farmer/reviews/:id/respond', ...farmerOnly, farm.respondToReview);

// ---------- Admin ----------
const adminOnly = [protect, authorize(ROLES.ADMIN)];
router.get('/admin/dashboard', ...adminOnly, admin.adminDashboard);
router.get('/admin/farmers', ...adminOnly, admin.adminFarmers);
router.patch('/admin/farmers/:id/status', ...adminOnly, admin.setFarmerStatus);
router.get('/admin/customers', ...adminOnly, admin.adminCustomers);
router.patch('/admin/customers/:id/status', ...adminOnly, admin.setCustomerStatus);

router.get('/admin/markets', ...adminOnly, admin.adminMarkets);
router.post('/admin/markets', ...adminOnly, marketImage.single('image'), admin.createMarket);
router.put('/admin/markets/:id', ...adminOnly, marketImage.single('image'), admin.updateMarket);
router.delete('/admin/markets/:id', ...adminOnly, admin.deleteMarket);

router.get('/admin/products', ...adminOnly, admin.adminProducts);
router.patch('/admin/products/:id/moderate', ...adminOnly, admin.moderateProduct);
router.get('/admin/reviews', ...adminOnly, admin.adminReviews);
router.patch('/admin/reviews/:id/moderate', ...adminOnly, admin.moderateReview);

router.get('/admin/categories', ...adminOnly, admin.adminCategories);
router.post('/admin/categories', ...adminOnly, categoryIcon.single('icon'), admin.createCategory);
router.put('/admin/categories/:id', ...adminOnly, categoryIcon.single('icon'), admin.updateCategory);
router.delete('/admin/categories/:id', ...adminOnly, admin.deleteCategory);

router.get('/admin/announcements', ...adminOnly, admin.adminAnnouncements);
router.post('/admin/announcements', ...adminOnly, admin.createAnnouncement);
router.put('/admin/announcements/:id', ...adminOnly, admin.updateAnnouncement);
router.delete('/admin/announcements/:id', ...adminOnly, admin.deleteAnnouncement);

router.get('/admin/reports', ...adminOnly, admin.listReports);
router.post('/admin/reports', ...adminOnly, admin.generateReport);
router.get('/admin/reports/:id', ...adminOnly, admin.getReport);
router.delete('/admin/reports/:id', ...adminOnly, admin.deleteReport);

router.get('/admin/orders', ...adminOnly, admin.adminOrders);
router.get('/admin/messages', ...adminOnly, admin.adminMessages);
router.patch('/admin/messages/:id', ...adminOnly, admin.updateMessage);
router.delete('/admin/messages/:id', ...adminOnly, admin.deleteMessage);

export default router;
