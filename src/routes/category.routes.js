import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryByIdOrName,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Create category
router.post("/", createCategory);

// Get all categories
router.get("/", getAllCategories);

// Get category by ID or Name
router.get("/:identifier", getCategoryByIdOrName);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;
