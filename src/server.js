import express from "express";
import categoryRouter from "./routes/category.routes.js";
import subCategoryRouter from "./routes/subCategory.routes.js";
import itemRouter from "./routes/item.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => res.send("OK!"));

app.use("/api/categories", categoryRouter);
app.use("/api/subCategories", subCategoryRouter);
app.use("/api/items", itemRouter);

export default app;
