import SubCategory from "../models/subCategory.model.js";
import Category from "../models/category.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Create a new sub-category
export const createSubCategory = async (req, res) => {
  try {
    const { name, description, taxApplicability, tax, taxType, category } =
      req.body;

    // Check for image in request
    let imagePath;
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = req.files.image[0].path;
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "SubCategory image is required",
      });
    }

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
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

    // Upload image to Cloudinary
    const uploadedImage = await uploadOnCloudinary(imagePath);
    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Inherit tax details from parent category if not provided
    const subCategoryData = {
      name,
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      description,
      category,
      taxApplicability:
        taxApplicability !== undefined
          ? taxApplicability
          : parentCategory.taxApplicability,
      tax: tax !== undefined ? tax : parentCategory.tax,
      taxType: taxType !== undefined ? taxType : parentCategory.taxType,
    };

    const subCategory = new SubCategory(subCategoryData);
    await subCategory.save();

    res.status(201).json({
      success: true,
      message: "SubCategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating sub-category",
      error: error.message,
    });
  }
};

// Get all sub-categories
export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sub-categories",
      error: error.message,
    });
  }
};

// Get all sub-categories under a category
export const getSubCategoriesByCategory = async (req, res) => {
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

    const subCategories = await SubCategory.find({ category: categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sub-categories",
      error: error.message,
    });
  }
};

// Get sub-category by ID or Name
export const getSubCategoryByIdOrName = async (req, res) => {
  try {
    const { identifier } = req.params;

    let subCategory;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      subCategory = await SubCategory.findById(identifier).populate(
        "category",
        "name"
      );
    } else {
      // Search by name
      subCategory = await SubCategory.findOne({ name: identifier }).populate(
        "category",
        "name"
      );
    }

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sub-category",
      error: error.message,
    });
  }
};

// Update sub-category
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, taxApplicability, tax, taxType, category } =
      req.body;

    // Check if sub-category exists
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // If category is being updated, check if new category exists
    if (category && category !== subCategory.category.toString()) {
      const newCategory = await Category.findById(category);
      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: "New category not found",
        });
      }
    }

    // Handle image update
    if (req.files && req.files.image && req.files.image.length > 0) {
      const uploadedImage = await uploadOnCloudinary(req.files.image[0].path);

      if (uploadedImage) {
        // Delete old image from Cloudinary
        if (subCategory.image.public_id) {
          await deleteFromCloudinary(subCategory.image.public_id);
        }

        subCategory.image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        };
      }
    }

    // Update fields
    if (name !== undefined) subCategory.name = name;
    if (description !== undefined) subCategory.description = description;
    if (category !== undefined) subCategory.category = category;
    if (taxApplicability !== undefined)
      subCategory.taxApplicability = taxApplicability;
    if (tax !== undefined) subCategory.tax = tax;
    if (taxType !== undefined) subCategory.taxType = taxType;

    await subCategory.save();

    // Populate category before sending response
    await subCategory.populate("category", "name");

    res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating sub-category",
      error: error.message,
    });
  }
};

// Delete sub-category
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    // Delete image from Cloudinary
    if (subCategory.image.public_id) {
      await deleteFromCloudinary(subCategory.image.public_id);
    }

    await SubCategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting sub-category",
      error: error.message,
    });
  }
};
