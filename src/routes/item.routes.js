import express from "express";
import {
  createItem,
  getAllItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getItemByIdOrName,
  searchItemByName,
  updateItem,
  deleteItem,
} from "../controllers/item.controller.js";

const router = express.Router();

// Search items by name (must be before /:identifier to avoid conflicts)
router.get("/search", searchItemByName);

// Create item
router.post("/", createItem);

// Get all items
router.get("/", getAllItems);

// Get all items under a category
router.get("/category/:categoryId", getItemsByCategory);

// Get all items under a sub-category
router.get("/subcategory/:subCategoryId", getItemsBySubCategory);

// Get item by ID or Name
router.get("/:identifier", getItemByIdOrName);

// Update item
router.put("/:id", updateItem);

// Delete item
router.delete("/:id", deleteItem);

export default router;
