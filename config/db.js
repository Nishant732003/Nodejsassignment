const mongoose = require("mongoose");
require("dotenv");
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}assignment`);
    console.log(`Connected to mongodb database ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Mongo connect error ${error}`);
  }
};

module.exports = connectDB;
                                              