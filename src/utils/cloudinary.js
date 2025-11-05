import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, folder = "uploads") => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
    });

    await fs.unlink(localFilePath);

    return result;
  } catch (error) {
    console.log(error);
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.log("Error deleting local file:", unlinkError);
    }
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};
