import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getAllNotification , deleteNotification} from "../controllers/notification.controller.js";
const router = express.Router();


router.get("/get", protectRoute,getAllNotification)
router.delete("/delete/:id", protectRoute, deleteNotification)
export default router;