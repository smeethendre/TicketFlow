import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  avatar: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  role: {
    type: String,
    enum: ["User", "Admin", "Super Admin"],
    default: "User",
  },

  password: {
    type: String,
    required: true,
  },

  refreshToken: {
    type: String,
    default: null,
  },

  phoneNumber: {
    type: Number,
    required: false,
  },

  mfaSecret: {
    type: String,
    default: null,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(mongooseAggregatePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  } // if password is not modified then proceed
  //to next middleware

  this.password = await bcrypt.hash(this.password, 10); //if modified or new, hash it.
  next();
});

userSchema.methods.isPasswordCorrect = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXP,
    },
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXP,
    },
  );
};

export const User = mongoose.model("User", userSchema);
