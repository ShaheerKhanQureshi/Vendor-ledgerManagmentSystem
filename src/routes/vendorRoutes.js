import express from "express"
import { createVendor, updateVendor, deleteVendor, getAllVendors } from "../controllers/vendorController.js"

const router = express.Router()

router.post("/addvendor", createVendor)
router.put("/:id", updateVendor)
router.delete("/:id", deleteVendor)
router.get("/getvendors", getAllVendors)

export default router

