const express = require('express');

const bookingcontroller = require('../controllers/bookingControllers');
const authcontroller = require('../controllers/authControllers');

const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authcontroller.protect,
  bookingcontroller.getCheckoutSession
);

router.use(
  authcontroller.protect,
  authcontroller.restrictTo('admin', 'lead-guide')
);

router
  .route('/')
  .get(bookingcontroller.getAllBookings)
  .post(bookingcontroller.createBooking);

router
  .route(':/id')
  .get(bookingcontroller.getBooking)
  .patch(bookingcontroller.updateBooking)
  .delete(bookingcontroller.deleteBooking);

module.exports = router;
