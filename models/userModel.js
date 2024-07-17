const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
require("dotenv").config();
// const Blog  = require("./blogModels");
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    blogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, salt);
    user.password = hash_password;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare the password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = async function () {
  try {
    const token = JWT.sign(
      {
        userId: this._id.toString(),
        email: this.email,
      },
      process.env.JWT_SECRET
    );

    return token;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Token generation failed");
  }
};

const User = model("User", userSchema);
module.exports =  User ;
