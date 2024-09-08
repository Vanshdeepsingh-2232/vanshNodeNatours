const crypto = require('crypto');
const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt = require('bcryptjs');
const { resetPassword } = require('../controllers/authControllers');
const { deflate } = require('zlib');

//name email photo password passwordconfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Must have a name'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Must have an Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email'],
  },

  photo: {
    type: String,
    default: 'default.jpeg',
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please Provide a Password'],
    minlength: 8,
    //password will not be visible in output
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Confirm your Password'],
    validate: {
      validator: function (ele) {
        //this only works for --> SAVE and CREATE <--
        return ele === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Document middleware
//function to encrypt the password before saving it

userSchema.pre('save', async function (next) {
  if (!this.isModified(`password`)) {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

// Instance method to compare the passwords of user loging in and password we have of that user
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//find if password changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt, JWTTimestamp);

    //this returns true if password changed
    return JWTTimestamp < changedTimeStamp;
  }
  //false means no change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to current query

  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
