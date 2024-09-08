//const mongoose = require('mongoose');

const Review = require('./../models/reviewModel');
//const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');

//handler Factory Function
const Factory = require('./../controllers/handlerFactory');

exports.getReviewById = Factory.getOne(Review);

exports.setTourUserIds = (req, res, next) => {
  //allow nested routes

  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = Factory.GetAll(Review);

exports.deleteReview = Factory.deleteOne(Review);

exports.updateReview = Factory.updateOne(Review);

exports.createReview = Factory.createOne(Review);
