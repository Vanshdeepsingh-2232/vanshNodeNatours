const Tour = require('./../models/tourModel');
const Bookings = require('./../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');
//const slugify = require('slugify');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  //1 get tours data from the DB
  const tours = await Tour.find();

  //3 Render that Template using Tour Data from

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //get Data of the requested Tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    field: 'review rating user',
  });
  //Build template

  if (!tour) {
    return next(new AppError('There is no Tour With that name.', 404));
  }
  console.log(tour);
  //render template using the data from the 1
  res.status(200).render('tour', {
    title: 'tours',
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'login to your Account',
  });
});

exports.getsignUpForm = catchAsync(async (req, res) => {
  res.status(200).render('signup', {
    title: 'SignUp to your Account',
  });
});


exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings for the user
  const bookings = await Bookings.find({ user: req.user.id });

  // Extract the tour IDs from the bookings
  const tourIds = bookings.map((el) => el.tour);

  // Find all tours corresponding to the extracted tour IDs
  const tours = await Tour.find({
    _id: {
      $in: tourIds,
    },
  });

  // Render the 'booked' template with the found tours
  res.status(200).render('booked', {
    title: 'My Tours',
    tours, // make sure to pass the awaited tours
  });
});

exports.getAboutUs = (req, res, next) => {
  res.status(200).render('aboutus', {
    title: 'About Us',
  });
};
