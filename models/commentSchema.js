const { Schema, model } = require("mongoose");
const  Blog  = require("./blogModels");
const User = require("./userModel");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);
module.exports = Comment;
