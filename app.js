const morgan = require('morgan');
const path = require('path');
const express = require('express');
const { execArgv } = require('process');
const exp = require('constants');
//security Packages
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
//import the routes

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const { mongo } = require('mongoose');
const Review = require('./models/reviewModel');

//Creating express app
const app = express();

//this is a Static File Parser Middleware
app.use(express.static(path.join(__dirname, 'public')));
//templating Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARE : this will modify the request according to us devs.Middleware stands between request and response.
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitization Against NoSql injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//limits the number of request from an IP address
//security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'ws://127.0.0.1:*',
        'https://unpkg.com',
        'https://api.maptiler.com',
      ],
      scriptSrc: ["'self'", 'https://js.stripe.com', 'https://unpkg.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      styleSrc: ["'self'", 'https://unpkg.com', 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:'],
      workerSrc: ["'self'", 'blob:'],
    },
  })
);

app.use(compression());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests form this IP Try Later!!!',
});

app.use('/api', limiter);

//3rd party-Middleware
app.use(morgan('dev'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  //JWT tokens are best to send with http headers

  console.log(req.cookies);
  next();
});

//wRouter Middleware : Mounts a specific router on the specific route from the requests
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant get your request ${req}.`, 404));
});

//error handling middleware
app.use(globalErrorHandler);

//Exports the app to the server.js
module.exports = app;
