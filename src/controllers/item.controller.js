import Item from "../models/item.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Create a new item
export const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      taxApplicability,
      tax,
      taxType,
      baseAmount,
      discount,
      category,
      subCategory,
    } = req.body;

    // Check for image in request
    let imagePath;
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = req.files.image[0].path;
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Item image is required",
      });
    }

    // Validate required fields
    if (!name || !description || !baseAmount || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, base amount, and category are required",
      });
    }

    // Check if parent category exists
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    // Check if sub-category exists (if provided)
    if (subCategory) {
      const parentSubCategory = await SubCategory.findById(subCategory);
      if (!parentSubCategory) {
        return res.status(404).json({
          success: false,
          message: "Sub-category not found",
        });
      }

      // Verify that sub-category belongs to the specified category
      if (parentSubCategory.category.toString() !== category) {
        return res.status(400).json({
          success: false,
          message: "Sub-category does not belong to the specified category",
        });
      }
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadOnCloudinary(imagePath);
    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Create item
    const item = new Item({
      name,
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      description,
      taxApplicability:
        taxApplicability !== undefined ? taxApplicability : false,
      tax: tax !== undefined ? tax : 0,
      taxType: taxType || "none",
      baseAmount,
      discount: discount || 0,
      category,
      subCategory: subCategory || null,
    });

    await item.save();

    // Populate references
    await item.populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    });
  }
};

// Get all items
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get all items under a category
export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const items = await Item.find({ category: categoryId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get all items under a sub-category
export const getItemsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    // Check if sub-category exists
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    const items = await Item.find({ subCategory: subCategoryId })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get item by ID or Name
export const getItemByIdOrName = async (req, res) => {
  try {
    const { identifier } = req.params;

    let item;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Item.findById(identifier)
        .populate("category", "name")
        .populate("subCategory", "name");
    } else {
      // Search by name
      item = await Item.findOne({ name: identifier })
        .populate("category", "name")
        .populate("subCategory", "name");
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    });
  }
};

// Search items by name
export const searchItemByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Search query 'name' is required",
      });
    }

    // Using text search
    const items = await Item.find(
      { $text: { $search: name } },
      { score: { $meta: "textScore" } }
    )
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ score: { $meta: "textScore" } });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching items",
      error: error.message,
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      taxApplicability,
      tax,
      taxType,
      baseAmount,
      discount,
      category,
      subCategory,
    } = req.body;

    // Check if item exists
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // If category is being updated, check if new category exists
    if (category && category !== item.category.toString()) {
      const newCategory = await Category.findById(category);
      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: "New category not found",
        });
      }
    }

    // If sub-category is being updated, check if it exists and belongs to the category
    if (subCategory !== undefined) {
      if (subCategory) {
        const newSubCategory = await SubCategory.findById(subCategory);
        if (!newSubCategory) {
          return res.status(404).json({
            success: false,
            message: "New sub-category not found",
          });
        }

        const categoryToCheck = category || item.category.toString();
        if (newSubCategory.category.toString() !== categoryToCheck) {
          return res.status(400).json({
            success: false,
            message: "Sub-category does not belong to the specified category",
          });
        }
      }
    }

    // Handle image update
    if (req.files && req.files.image && req.files.image.length > 0) {
      const uploadedImage = await uploadOnCloudinary(req.files.image[0].path);

      if (uploadedImage) {
        // Delete old image from Cloudinary
        if (item.image.public_id) {
          await deleteFromCloudinary(item.image.public_id);
        }

        item.image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        };
      }
    }

    // Update fields
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (taxApplicability !== undefined)
      item.taxApplicability = taxApplicability;
    if (tax !== undefined) item.tax = tax;
    if (taxType !== undefined) item.taxType = taxType;
    if (baseAmount !== undefined) item.baseAmount = baseAmount;
    if (discount !== undefined) item.discount = discount;
    if (category !== undefined) item.category = category;
    if (subCategory !== undefined) item.subCategory = subCategory;

    await item.save();

    // Populate references
    await item.populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
    ]);

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Delete image from Cloudinary
    if (item.image.public_id) {
      await deleteFromCloudinary(item.image.public_id);
    }

    await Item.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};
