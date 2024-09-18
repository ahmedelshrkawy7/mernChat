import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"; ///  auth.js
import connectToMongoDB from "./db/connectToMongoDB.js";

const app = express();
const PORT = process.env.PORT || 7000;
dotenv.config();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log("server is running on port", PORT);
});
