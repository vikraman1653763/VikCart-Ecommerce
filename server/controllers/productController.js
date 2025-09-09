
import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    let productData =JSON.parse(req.body.productData)
    const images = req.files
    let imageUrl = await Promise.all(
        images.map(async(item)=>{
            let result = await connectCloudinary.uploader.upload(item.path,{resource_type:'image'})
            return result.secure_url
        })
    ) 
    await productById.create({...productData,image:imageUrl})
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const productList = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const productById = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const changeStock = async (req, res) => {
  try {
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
