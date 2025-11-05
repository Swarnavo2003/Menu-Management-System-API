import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: [true, "SubCategory description is required"],
      trim: true,
    },
    taxApplicability: {
      type: Boolean,
      default: null,
    },
    tax: {
      type: Number,
      default: null,
      min: [0, "Tax cannot be negative"],
    },
    taxType: {
      type: String,
      enum: ["percentage", "fixed", "none", null],
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for category + name
subCategorySchema.index({ category: 1, name: 1 });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
export default SubCategory;
