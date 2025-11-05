import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryByIdOrName,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";

const router = express.Router();

// Create sub-category
router.post("/", createSubCategory);

// Get all sub-categories
router.get("/", getAllSubCategories);

// Get all sub-categories under a category
router.get("/category/:categoryId", getSubCategoriesByCategory);

// Get sub-category by ID or Name
router.get("/:identifier", getSubCategoryByIdOrName);

// Update sub-category
router.put("/:id", updateSubCategory);

// Delete sub-category
router.delete("/:id", deleteSubCategory);

export default router;
