//import model SCHEMAS
const { query } = require('express');
const Tour = require('./../models/tourModel');

//Error Handling Mechanism
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

//handler Factory
const Factory = require('./../controllers/handlerFactory');
const { parse } = require('dotenv');

//importing the Image Proccesing Libraries
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, calbc) => {
  if (file.mimetype.startsWith('image')) {
    calbc(null, false);
  } else {
    calbc(
      new AppError('Not an Image !!! Please Upload Images Only.', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

// upload.single('image');
// upload.array('images', 5);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.body);
  if (!req.file.imageCover || !req.files.images) return next();
  console.log('hi');
  console.log(req.file);
  console.log(req.files);

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.file.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`public/img/users/${imageCoverFilename}`);

  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`public/img/users/${filename}`);

      req.body.images.push(filename);
    })
  );

  console.log(req.body);
  next();
});

//MIDDLEWARE functions
exports.aliasedQuery = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage';
  next();
};
//there exists the implementation for the function which will full fill the requests
//Controllers

//--------------------------------------------------------------------------
//Standard controller functions

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // {
    //   $match: { ratingsAverage: { $gte: 2.0 } },
    // },

    {
      $group: {
        _id: '$difficulty',
        avgratings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgPrice: 1 },
    },

    // {
    //   $match: { _id: { $ne: 'easy' } },
    // },
  ]);
  res.status(200).json({
    status: 'SUCCESS',
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // Ensuring it's an integer

  // Log the year and the date range being used for matching
  console.log(`Year: ${year}`);
  console.log(
    `Date range: ${new Date(`${year}-01-01`)} to ${new Date(`${year}-12-31`)}`
  );

  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates', // Deconstruct array field to output one document per array element
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // Match startDates within the given year
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // Group by month
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // Add a month field
    },
    {
      $project: {
        _id: 0, // Remove the default _id field
      },
    },
    {
      $sort: { numTourStarts: -1 }, // Sort by number of tour starts in descending order
    },
  ]);

  // Log the results of the aggregation
  console.log('Aggregation results:', plans);

  res.status(200).json({
    status: 'SUCCESS',
    results: plans.length,
    data: { plans },
  });
});

//-------------------------------------------------------------------------
//Factory Controllers

exports.getTourbyId = Factory.getOne(Tour, { path: 'reviews' });

exports.getalltours = Factory.GetAll(Tour);

exports.updateTour = Factory.updateOne(Tour);

exports.addnewtour = Factory.createOne(Tour);

exports.deleteTour = Factory.deleteOne(Tour);

//all controllers are exported

exports.getToursWithin = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const { distances, latLng, unit } = req.params;
  const [lat, lon] = latLng.split(',');
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  console.log(latitude, longitude);
  const radius = unit === 'mi' ? distances / 3963.2 : distances / 6378.1;

  if (!latitude || !longitude) {
    next(new AppError('Please Provide Data In The Specified form', 400));
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius],
      },
    },
  });
  // 33.9691864,-118.4884986
  res.status(200).json({
    status: 'Success',
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latLng, unit } = req.params;
  const [lat, lon] = latLng.split(',');
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!latitude || !longitude) {
    next(new AppError('Please Provide Data In The Specified form', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },

        //created Field where all the calculated Distances Are Stored
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
