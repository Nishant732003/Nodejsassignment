const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;


    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }



    const userCreated = await User.create({
      userName,
      email,
      password, 
    });
    const token = await userCreated.generateToken();
    res.status(201).json({
      message: {
        userName,
            email,
        password,
      },
      token,
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });

    if (!userExist)
      return res.status(400).json({ message: "Invalid Credentials" });


    const user = await userExist.comparePassword(password);
    console.log(userExist);
    if (user) {
      res.status(200).json({
        message: "Login Successfully",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
       
      });
    } else {
      res.status(401).json({ message: "Invalid email or Password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




 const forgetPassword = async (req, res) => {
   try {
     const user = await User.findOne({ email: req.body.email });

     console.log("from forget password", user);
     if (!user) {
       return res.status(404).send({ message: "User not found" });
     }

     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
       expiresIn: "10m",
     });

     console.log("from forget password token", token);
     const transporter = nodemailer.createTransport({
       service: "gmail",
       auth: {
         user: process.env.EMAIL,
         pass: process.env.APP_PASSWORD,
       },
     });
     console.log("from forget password transporter", transporter);

     const mailOptions = {
       from: process.env.EMAIL,
       to: req.body.email,
       subject: "Reset Password",
       html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:5173/reset/${token}">http://localhost:5173/reset/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
     };

     transporter.sendMail(mailOptions, (err, info) => {
       if (err) {
         return res.status(500).send({ message: err.message });
       }
       res.status(200).send({ message: "Email sent" });
     });
   } catch (err) {
     res.status(500).send({ message: err.message });
   }
 };

 const resetPassword = async (req, res) => {
   try {
     const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);

     if (!decodedToken) {
       return res.status(401).send({ message: "Invalid token" });
     }

     const user = await User.findOne({ _id: decodedToken.id });
     if (!user) {
       return res.status(401).send({ message: "no user found" });
     }

     const salt = await bcrypt.genSalt(10);
     req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

     user.password = req.body.newPassword;
     await user.save();

     res.status(200).send({ message: "Password updated" });
   } catch (err) {
     res.status(500).send({ message: err.message });
   }
 };



module.exports = {  register, login,resetPassword,forgetPassword };


