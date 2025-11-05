import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
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
      required: [true, "Category description is required"],
      trim: true,
    },
    taxApplicability: {
      type: Boolean,
      default: false,
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    taxType: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

// categorySchema.index({ name: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
