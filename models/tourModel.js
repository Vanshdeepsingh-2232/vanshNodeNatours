const { MongoDecompressionError } = require('mongodb');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    //id,name,duration,difficulty,price
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have 40 chars'],
      minlength: [10, 'A tour must have 10 chars'],
      //validate: [validator.isAlpha, 'Data should contain only alphabets'],
    },

    slug: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'Must know the Group size'],
    },

    difficulty: {
      type: String,
      default: 'moderate',
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy ,medium , hard',
      },
    },

    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be > 1'],
      max: [5, 'Rating must be <=5'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 400,
      required: true,
    },

    priceDiscount: {
      type: Number,
      //these validator functions wont work in case of update()query
      //this only points to current document being created
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'The discount(VALUE) should be less then Price',
      },
    },

    summary: {
      type: String,
      //trim removes all the whhite spaces
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      required: [true, 'Must have a description'],
    },

    imageCover: {
      type: String,
      required: [true, 'Must have a Cover img'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },

        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  }, //Schema options

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Indices
//1 is acending -1 is decending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({startLocation : '2dsphere'})
//cannot use virtual property in a Query
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual Populate

//localField ===> This field should contain name of the field which is being referenced in another Model
//foreignField ===> this Contains the name of the field which is the reference to this model
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document Middleware = This middleware
// will be triggred Before .save() and .create() But not for .insertMany()
tourSchema.pre('save', function (next) {
  //(this) have our document which we are going to save into DB
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

// //Post document Middleware
// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })

//Query Middleware

// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = new Date().getMilliseconds();
//   next();
// });

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(doc);
//   console.log(`Query took ${Date.now() - this.start} Milliseconds  `);
//   next();
// });

//Aggregation MiddleWare

// tourSchema.pre('aggregate', function (next) {
//   console.log(this.pipeline());
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//there are 4 Types of middleware in Mongoose

// 1-Document
// 2-Query = runs functions before or after a Query is executed
// 3-Aggregate
// 4-Model
