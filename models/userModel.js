const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
require("dotenv").config();

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
    // resetPasswordToken: String,
    // resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) {
    next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(user.password, salt);
    user.password = hash_password;
  } catch (error) {
    next(error);
  }
});

//compare the password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//jsonwebtoken
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

const User = model("user", userSchema);
module.exports = {
  User,
};

