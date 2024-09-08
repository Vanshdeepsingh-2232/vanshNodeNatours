//importing the modules
const express = require('express');

//importing the controller functions from the tourControllres.js
const tourcontrollers = require('./../controllers/tourControllers');
//importing the Auth controllers for auth functionality
const authcontroller = require('./../controllers/authControllers');

//importing the External Routers
const reviewRouter = require('./../routes/reviewRoutes');

//creating a small router application named router
const router = express.Router();

//using The external Routers
//which is basically again mounting the Routing middleware on this route
router.use('/:tourId/reviews', reviewRouter);

//Another middleware to check valid ID
// router.param('id',tourcontrollers.checkID);

//Route all the controller functions to the specific request
//if using the RESTfull Arch.
//also all the functions having same routes can be chained by different methods from the http module

router
  .route('/tours-within/:distances/center/:latLng/unit/:unit')
  .get(tourcontrollers.getToursWithin);

router.route('/distances/:latLng/unit/:unit').get(tourcontrollers.getDistances);

router.route('/tour-stats').get(tourcontrollers.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrollers.getMonthlyPlan
  );
router
  .route('/top-5-cheap')
  .get(tourcontrollers.aliasedQuery, tourcontrollers.getalltours);

router
  .route('/')
  .get(tourcontrollers.getalltours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrollers.addnewtour
  );
router
  .route('/:id')
  .get(tourcontrollers.getTourbyId)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrollers.uploadTourImages,
    tourcontrollers.resizeTourImages,
    tourcontrollers.updateTour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrollers.deleteTour
  );

//export the router to the app.js
module.exports = router;
