import dotenv from "dotenv";
dotenv.config({ quiet: true });
import app from "./server.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
