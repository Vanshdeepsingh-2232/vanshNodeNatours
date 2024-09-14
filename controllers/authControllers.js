const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

//const { send } = require('process');

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
    token,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log({ email, password });
  //check if email password exist
  if (!email || !password) {
    return next(new AppError('Please Provide a Email Password!', 400));
  } else {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect Email or Password', 401));
    }

    createSendToken(user, 201, res);
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  //1 - getting the token and check if it exists

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // console.log(token);

  if (!token) {
    return next(new AppError('You are not logged in! Please log In', 401));
  }

  //2 - Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3 - check if the user still exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'User to which this token belongs Does Not Exists Anymore !! ',
        401
      )
    );
  }

  //4 - check if user changed passwords
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password . LOGIN Again !!!')
    );
  }

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','lead-guide'] .role='user'

    //the protect middleware already put all the information about current user onto the req stream thus we can acces
    //the user roles by req.user.role

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have the permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There doesnt exists User with this Email.', 404));
  }
  //2 Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password Submit your PATCH request ${resetURL}`;

  try {
    //3 Send it to users Email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      data: 'Token sent',
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('there was an err sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(hashedToken);
  // console.log('OBJ DATE', new Date());
  // console.log(Date.now());
  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  console.log('User found:', user);

  // If no user is found, return an error
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  //Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //log the user in send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 Get the user from the collection

  //we have the Id of the user because this part of middleware get called only when a user is logged in
  const user = await User.findById(req.user.id).select('+password');

  //2 Check if the posted current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current Password Is wrong,', 401));
  }

  //3 if so update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  //4 Log the user in Send JWT token
  createSendToken(user, 201, res);
});

//only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      console.log(decoded);

      //3 - check if the user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //4 - check if user changed passwords
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //there is a logged in user
      res.locals.user = freshUser;

      return next();
    } catch (error) {
      return next();
    }
  }

  next();
};

exports.logout = async (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'Success' });
};
