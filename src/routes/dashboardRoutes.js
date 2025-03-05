import express from "express";
import { getDashboardData } from "../controllers/dashboard.js";

const router = express.Router();

router.get("/dashboard", getDashboardData);

export default router;
