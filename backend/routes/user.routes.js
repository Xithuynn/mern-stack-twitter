import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { getUserProfile } from "../controllers/user.controller.js"

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile)
router.get("/suggested", protectRoute, getUserProfile)
router.get("/follow/:id", protectRoute, followUnfollowUser)
router.get("/update", protectRoute, updateUserProfile)
