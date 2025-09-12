import express from "express";
// productRoute.js
import { upload } from "../configs/multer.js";
import { addProduct, productList, productById, changeStock, deleteProduct, updateProduct } from "../controllers/productController.js";
import authSeller from "../middleware/authSeller.js";

const productRouter = express.Router();

productRouter.post("/add", upload.array(["images"]), authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.post("/by-id", productById);
productRouter.put("/stock", authSeller, changeStock);
productRouter.delete("/delete/:id", authSeller, deleteProduct);
productRouter.put(
  "/update/:id",
  authSeller,
  upload.array("images"), 
  updateProduct
);
export default productRouter;
