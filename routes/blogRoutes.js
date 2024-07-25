const express = require("express");
const router = express.Router();
const postControllers = require("../controllers/blogpostController");
const upload = require("../middlewares/useMulter");

const authMiddleware = require("../middlewares/authMiddleWare");

router.use(authMiddleware);

router
  .route("/create")
    .post(upload.single("coverImageURL"), postControllers.createBlogs);
  
router.route("/read").get(postControllers.getAllBlogs);

router.route("/read/:id").get(postControllers.getBlogById);

router.route("/update/:id").put(upload.single("coverImageURL"),postControllers.updateBlogById);

router.route("/delete/:id").delete(postControllers.deleteBlogById);

router.route("/comment").post(postControllers.addCommentOnBlog);

router.route("/like").post(postControllers.addLikeOnBlog);

module.exports = router;
