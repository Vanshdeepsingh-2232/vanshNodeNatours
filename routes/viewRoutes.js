const express = require('express');
const viewcontrollers = require('./../controllers/viewsController');
const router = express.Router();
const authcontroller = require('./../controllers/authControllers');
const bookingcontroller = require('./../controllers/bookingControllers');

router.get('/', authcontroller.isLoggedIn, viewcontrollers.getOverview);

router.get('/tour/:slug', authcontroller.isLoggedIn, viewcontrollers.getTour);

router.get('/login', authcontroller.isLoggedIn, viewcontrollers.getLoginForm);

router.get('/me', authcontroller.protect, viewcontrollers.getAccount);

router.get('/my-tours', authcontroller.protect, viewcontrollers.getMyTours);

router.get('/aboutus', viewcontrollers.getAboutUs);

module.exports = router;
