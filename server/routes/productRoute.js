import express from "express";
// productRoute.js
import { upload } from "../configs/multer.js";
import { addProduct, productList, productById, changeStock } from "../controllers/productController.js";
import authSeller from "../middleware/authSeller.js";

const productRouter = express.Router();

productRouter.post("/add", upload.array("images"), authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.post("/by-id", productById);
productRouter.put("/stock", authSeller, changeStock);

export default productRouter;
