import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createPost , deletePost , commentPost , likeUnlikePost, getAllPosts, getNewsFeed, getLikedPost, getUserPosts} from "../controllers/post.controller.js";


const router = express.Router();

router.get("/all", protectRoute, getAllPosts)
router.get("/newsfeed", protectRoute, getNewsFeed)
router.get("/likes/:id" , protectRoute, getLikedPost)
router.get("/wall/:username", protectRoute, getUserPosts )
router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/comment/:id", protectRoute, commentPost)
router.delete("/delete/:id", protectRoute, deletePost)


export default router;


