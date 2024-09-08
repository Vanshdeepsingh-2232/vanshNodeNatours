//create a function that takes in a funcction returns a new function
//basically these functions returns Controllers
const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    const Doc = await Model.findByIdAndDelete(req.params.id);
    if (!Doc) {
      return next(new AppError(`No Document found from that Id`), 404);
    }
    res.status(200).json({
      Status: 'SUCCESS',
      Data: Doc,
    });
  });

//using this update function all Save middleware Is not Run
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      Status: 'SUCCESS',
      Data: updatedDoc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    console.log(newDoc);
    res.status(200).json({
      Status: 'SUCCESS',
      Data: newDoc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(mongoose.Types.ObjectId(req.params.id));

    //populate function will create new query every time its called thus it affects apps performance
    if (populateOptions) query = query.populate(populateOptions);
    const DocById = await query;

    if (!DocById) {
      return next(new AppError('No Doc found from that Id'), 404);
    } else {
      console.log(DocById);
      res.status(200).json({
        Status: 'SUCCESS',
        Data: DocById,
      });
    }
  });

exports.GetAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //allow for nested get Reviews on Docs
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: mongoose.Types.ObjectId(req.params.tourId) };
    }
    // Log the original query for debugging
    console.log('Original query:', req.query);

    // Execute query
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sorting()
      .field_limits()
      .pagination();
    const Docs = await features.query;

    // Send response
    res.status(200).json({
      status: 'SUCCESS',
      results: Docs.length,
      data: Docs,
    });
  });
