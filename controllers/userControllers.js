const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//   destination: (req, file, calbc) => {
//     calbc(null, 'public/img/users');
//   },
//   filename: (req, file, calbc) => {
//     //user-objectId-timestamp.fileExtension
//     //file=req.file
//     const ext = file.mimetype.split('/')[1];
//     calbc(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, calbc) => {
  if (file.mimetype.startsWith('image')) {
    calbc(null, true);
  } else {
    calbc(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

//multer upload configure
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//Factory Controllers
const Factory = require('./../controllers/handlerFactory');

//Helper functions
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((ele) => {
    if (allowedFields.includes(ele)) {
      newObj[ele] = obj[ele];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for data updates Use Patch Request', 400)
    );
  }

  //filter out unwanted field names that we dont wanted to update
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//-----------------------------------------------------------------

exports.getAllUsers = Factory.GetAll(User);

exports.deleteMe = Factory.deleteOne(User);

exports.updatedUser = Factory.updateOne(User);

exports.getUserbyId = Factory.getOne(User);
