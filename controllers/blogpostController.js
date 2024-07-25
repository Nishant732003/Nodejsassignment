const Blog = require("../models/blogModels");
const User  = require("../models/userModel");
const uploadOnCloudinary = require("../fileUpload/cloudinary");
const Comment = require("../models/commentSchema");
const CryptoJS = require("crypto-js");


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 

const createBlogs = async (req, res) => {
  try {
    const { title, body, user } = req.body;
    const file = req.file;

    if (!title || !body || !file || !user) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "Unable to find user",
      });
    }

    const coverImageURL = await uploadOnCloudinary(file);

    //encrypt the title and body
    const encryptedTitle = CryptoJS.AES.encrypt(title, ENCRYPTION_KEY).toString();
    const encryptedBody = CryptoJS.AES.encrypt(body, ENCRYPTION_KEY).toString();
    
    const newBlog = new Blog({
      title:encryptedTitle,
      body:encryptedBody,
      coverImageURL,
      createdBy: user,
    });

    await newBlog.save();
    existingUser.blogs.push(newBlog);
    await existingUser.save();

    return res.status(201).send({
      success: true,
      message: "BlogPosts created",
      newBlog: {
        ...newBlog._doc,
        title: title,
        body:body,
      },
    });

  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error while creating blog",
      error,
    });
  }
};


const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "userName email")
      .populate("comments")
      .populate("likes");
     
    const decryptedBlogs = blogs.map((blog) => {
      const decryptedTitle = CryptoJS.AES.decrypt(
        blog.title,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      const decryptedBody = CryptoJS.AES.decrypt(
        blog.body,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      return {
        ...blog._doc,
        title: decryptedTitle,
        body: decryptedBody,
      };
    });

    return res.status(200).json({
      success: true,
      message: "BlogPosts fetched successfully",
      blogs:decryptedBlogs,
    });

  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching blogs",
      error: error.message, 
    });
  }
};


const getBlogById = async (req, res) => {
     console.log("getBlogById called with id:", req.params.id);
  try {

    const { id } = req.params;
      console.log("id", id);
    const blog = await Blog.findById(id)
      .populate("createdBy", "userName email")
      .populate("comments")
      .populate("likes");
    
    console.log("blogs", blog);
    
     if (!blog) {
      return res.status(404).json({
        success: false,
        message: "BlogPost not found",
      });
    }

    try {

      const decryptedTitle = CryptoJS.AES.decrypt(
        blog.title,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      const decryptedBody = CryptoJS.AES.decrypt(
        blog.body,
        ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      const decryptedBlog = {
        ...blog._doc,
        title: decryptedTitle,
        body: decryptedBody,
      };

      return res.status(200).json({
        success: true,
        message: "BlogPost fetched successfully",
        blog: decryptedBlog,
      });

    } catch (decryptionError) {
      console.error("Error decrypting blog data:", decryptionError);
      return res.status(500).json({
        success: false,
        message: "Error decrypting blog data",
        error: decryptionError.message,
      });
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching blog",
      error: error.message,
    });
  }
};


const updateBlogById = async (req, res) => {

  try {
    const { id } = req.params;
    const { title, body, user } = req.body;
    const file = req.file;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "BlogPost not found",
      });
    };

    if (title) {
      const encryptedTitle = CryptoJS.AES.encrypt(
        title,
        ENCRYPTION_KEY
      ).toString();
      blog.title = encryptedTitle;
    }

    if (body) {
      const encryptedBody = CryptoJS.AES.encrypt(
        body,
        ENCRYPTION_KEY
      ).toString();
      blog.body = encryptedBody;
    }

    if (user) blog.createdBy = user;

    if (file) {
      const coverImageURL = await uploadOnCloudinary(file);
      blog.coverImageURL = coverImageURL;
    }

    await blog.save();

    // Decrypt the data before sending the response
    const decryptedBlog = {
      ...blog._doc,
      title:
        title ||
        CryptoJS.AES.decrypt(blog.title, ENCRYPTION_KEY).toString(
          CryptoJS.enc.Utf8
        ),
      body:
        body ||
        CryptoJS.AES.decrypt(blog.body, ENCRYPTION_KEY).toString(
          CryptoJS.enc.Utf8
        ),
    };

    return res.status(200).json({
      success: true,
      message: "BlogPost updated successfully",
      blog:decryptedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Error while updating blog",
      error: error.message,
    });
  }
};


const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "BlogPost not found",
      });
    }
     // Remove the blog reference from the user's blogs array
    const user = await User.findById(blog.createdBy);
    if (user) {
      user.blogs.pull(blog._id);
      await user.save();
      }
      return res.status(200).json({
      success: true,
      message: "BlogPost deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Error while deleting blog",
      error: error.message,
    });
  }
};


const addCommentOnBlog = async (req, res) => {
  console.log("Received request body:", req.body);
  try {
    const { blogId, content, user } = req.body;
    console.log("Extracted fields:", { blogId, content, user });

    if (!blogId || !content || !user) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "BlogPost not found",
      });
    }

    const encryptedContent = CryptoJS.AES.encrypt(
      content,
      ENCRYPTION_KEY
    ).toString();

    const newComment = new Comment({
      content: encryptedContent,
      createdBy: user,
      blogId,
    });

    await newComment.save();

    existingBlog.comments.push(newComment._id);
    await existingBlog.save();

    // Decrypt the content before sending the response
    const decryptedComment = {
      ...newComment._doc,
      content: content,
    };

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: decryptedComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error while adding comment",
      error: error.message,
    });
  }
};


const addLikeOnBlog = async (req, res) => {
  try {
    const { blogId, user } = req.body;

    if (!blogId || !user) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "BlogPost not found",
      });
    }

    if (existingBlog.likes.includes(user)) {
      return res.status(400).json({
        success: false,
        message: "User has already liked this blogpost",
      });
    }

    existingBlog.likes.push(user);
    await existingBlog.save();

    return res.status(200).json({
      success: true,
      message: "BlogPost liked successfully",
    });
      
  } catch (error) {
    console.error("Error adding like:", error);
    return res.status(500).json({
      success: false,
      message: "Error while adding like",
      error: error.message,
    });
  }
};


module.exports = {
    createBlogs,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById,
    addCommentOnBlog,
    addLikeOnBlog
};
