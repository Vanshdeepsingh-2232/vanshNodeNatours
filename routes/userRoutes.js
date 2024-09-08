const express = require('express');

//import the controller functions
const usercontrollers = require('./../controllers/userControllers');

//create router application
const router = express.Router();

//import the user Auth Controllers
const authcontrollers = require('./../controllers/authControllers');

//map the controllres of this route

//this will user the Auth Protect Middleware For All The controllers thus no need to protect individualy

router.post('/signup', authcontrollers.signUp);
router.post('/login', authcontrollers.login);
router.get('/logout', authcontrollers.logout);
router.post('/forgotPassword', authcontrollers.forgotPassword);
router.patch('/resetPassword/:token', authcontrollers.resetPassword);

//Protect All routes after this middleware
router.use(authcontrollers.protect);

router.patch('/updatePassword', authcontrollers.updatePassword);
router.get('/me', usercontrollers.getMe, usercontrollers.getUserbyId);

//photo is the feild in the form which is going to save the image
router.patch(
  '/updateMe',
  usercontrollers.uploadUserPhoto,
  usercontrollers.resizeUserPhoto,
  usercontrollers.updateMe
);
router.delete('/deleteMe', usercontrollers.deleteMe);

//Restrict the routes below
router.use(authcontrollers.restrictTo('admin'));

router.route('/').get(usercontrollers.getAllUsers);
router.route('/:id').get(usercontrollers.getUserbyId);

//export the router
module.exports = router;
