const Blog = require("../models/blogModels");

const User  = require("../models/userModel");
const uploadOnCloudinary = require("../fileUpload/cloudinary");
const Comment = require("../models/commentSchema");

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

    const newBlog = new Blog({ title, body, coverImageURL, createdBy: user });

    await newBlog.save();
    existingUser.blogs.push(newBlog);
    await existingUser.save();

    return res.status(201).send({
      success: true,
      message: "BlogPosts created",
      newBlog,
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

    return res.status(200).json({
      success: true,
      message: "BlogPosts fetched successfully",
      blogs,
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

    return res.status(200).json({
      success: true,
      message: "BlogPost fetched successfully",
      blog,
    });
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
    }

    if (title) blog.title = title;
    if (body)  blog.body = body;
    if (user)  blog.createdBy = user;

    if (file) {
      const coverImageURL = await uploadOnCloudinary(file);
      blog.coverImageURL = coverImageURL;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "BlogPost updated successfully",
      blog,
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

    const newComment = new Comment({ content, createdBy: user, blogId });
    await newComment.save();

    existingBlog.comments.push(newComment._id);
    await existingBlog.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
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
