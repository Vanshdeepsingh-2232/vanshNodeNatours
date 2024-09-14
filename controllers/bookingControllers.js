const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');

//Error Handling Mechanism
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

//handler Factory
const factory = require('./../controllers/handlerFactory');

//booking function
const createBookingforDB = async (userId, tour, price) => {
  try {
    const booking = await Booking.create({
      user: userId,
      tour: tour,
      price: price,
      bookedAt: Date.now(),
    });
    console.log('Booking successfully created:', booking);
  } catch (err) {
    console.error('Error creating booking:', err);
  }
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1)get currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  //2) create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        price_data: {
          currency: 'cad',
          unit_amount: tour.price * 1000,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://www.natours.dev/img/tours/${tour.imageCover}.jpg`,
            ],
          },
        },
        quantity: 1,
      },
    ],

    mode: 'payment',
  });

  // console.log(session.success_url);

  //3) create session as response

  res.status(200).json({
    status: 'success',
    session,
  });

  console.log(req);
  await createBookingforDB(req.user._id, tour, tour.price);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.GetAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
