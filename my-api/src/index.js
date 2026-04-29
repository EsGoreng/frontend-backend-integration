import express from "express";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
