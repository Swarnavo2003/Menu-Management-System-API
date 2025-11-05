import Category from "../models/category.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, taxApplicability, tax, taxType } = req.body;

    // Check for image in request
    let imagePath;
    if (req.files && req.files.image && req.files.image.length > 0) {
      imagePath = req.files.image[0].path;
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    // Validate required fields (check for undefined to allow false values)
    if (
      !name ||
      !description ||
      taxApplicability === undefined ||
      tax === undefined ||
      !taxType
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
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

    // Create category
    const category = new Category({
      name,
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      description,
      taxApplicability: taxApplicability,
      tax: taxApplicability ? tax : 0,
      taxType: taxApplicability ? taxType : "none",
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

export const getCategoryByIdOrName = async (req, res) => {
  try {
    const { identifier } = req.params;

    let category;

    // Check if identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    } else {
      // Search by name
      category = await Category.findOne({ name: identifier });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, taxApplicability, tax, taxType } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check for duplicate name if name is being updated
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    // Handle image update
    if (req.files && req.files.image && req.files.image.length > 0) {
      const uploadedImage = await uploadOnCloudinary(req.files.image[0].path);

      if (uploadedImage) {
        // Delete old image from Cloudinary
        if (category.image.public_id) {
          await deleteFromCloudinary(category.image.public_id);
        }

        category.image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        };
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    if (taxApplicability !== undefined) {
      category.taxApplicability = taxApplicability;

      // If tax is not applicable, reset tax and taxType
      if (!taxApplicability) {
        category.tax = 0;
        category.taxType = "none";
      }
    }

    if (tax !== undefined && category.taxApplicability) {
      category.tax = tax;
    }

    if (taxType !== undefined && category.taxApplicability) {
      category.taxType = taxType;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete image from Cloudinary
    if (category.image.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
