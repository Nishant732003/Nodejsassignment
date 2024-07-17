const { Schema, model } = require("mongoose");
const  Blog  = require("./blogModels");
const  User  = require("./userModel");
const likeSchema = new Schema(
  {
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

const Like = model("Like", likeSchema);
module.exports = Like;
