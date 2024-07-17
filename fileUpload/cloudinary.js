const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    const response = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    fs.unlinkSync(file.path);

    return response.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

module.exports = uploadOnCloudinary;
