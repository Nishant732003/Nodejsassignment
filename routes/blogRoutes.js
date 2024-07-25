const express = require("express");
const router = express.Router();
const postControllers = require("../controllers/blogpostController");
const upload = require("../middlewares/useMulter");

const authMiddleware = require("../middlewares/authMiddleWare");

// router.use(authMiddleware);

router
  .route("/create")
    .post(authMiddleware,upload.single("coverImageURL"), postControllers.createBlogs);
  
router.route("/read").get(postControllers.getAllBlogs);

router.route("/read/:id").get(authMiddleware,postControllers.getBlogById);

router.route("/update/:id").put(authMiddleware,upload.single("coverImageURL"),postControllers.updateBlogById);

router.route("/delete/:id").delete(authMiddleware,postControllers.deleteBlogById);

router.route("/comment").post(authMiddleware,postControllers.addCommentOnBlog);

router.route("/like").post(authMiddleware,postControllers.addLikeOnBlog);

module.exports = router;
