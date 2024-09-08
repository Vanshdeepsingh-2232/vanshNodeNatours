const express = require('express');

const reviewcontroller = require('../controllers/reviewControllers');
const authcontroller = require('../controllers/authControllers');
const router = express.Router({ mergeParams: true });
router.use(authcontroller.protect);

router
  .route('/')
  .get(reviewcontroller.getAllReviews)
  .post(
    authcontroller.restrictTo('user'),
    reviewcontroller.setTourUserIds,
    reviewcontroller.createReview
  );

router
  .route('/:id')
  .delete(
    authcontroller.restrictTo('admin', 'user'),
    reviewcontroller.deleteReview
  )
  .patch(
    authcontroller.restrictTo('admin', 'user'),
    reviewcontroller.updateReview
  );

module.exports = router;
