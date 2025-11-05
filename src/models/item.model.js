import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
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
      required: [true, "Item description is required"],
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
    baseAmount: {
      type: Number,
      required: [true, "Base amount is required"],
      min: [0, "Base amount cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate total amount
itemSchema.pre("save", function (next) {
  this.totalAmount = this.baseAmount - this.discount;
  next();
});

// Pre-update middleware to recalculate total amount
itemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.baseAmount !== undefined || update.discount !== undefined) {
    const baseAmount = update.baseAmount || 0;
    const discount = update.discount || 0;
    update.totalAmount = baseAmount - discount;
  }
  next();
});

// Text index for search functionality
itemSchema.index({ name: "text", description: "text" });

// Index for faster queries
itemSchema.index({ category: 1 });
itemSchema.index({ subCategory: 1 });

const Item = mongoose.model("Item", itemSchema);
export default Item;
