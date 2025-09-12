
import Product from "../models/Product.js";
import cloudinary from "../configs/cloudinary.js";

export const addProduct = async (req, res) => {
  try {
    // Parse product data coming from the frontend
    let productData = JSON.parse(req.body.productData);
    const images = req.files;

    // ⬇️ Updated upload section: store both url & publicId
    const imageDocs = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return { url: result.secure_url, publicId: result.public_id };
      })
    );

    // Save the product with image objects
    await Product.create({ ...productData, image: imageDocs });

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// deleteProduct controller
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const publicIds = product.getImagePublicIds();
    for (const pid of publicIds) {
      try { await cloudinary.uploader.destroy(pid, { resource_type: "image" }); } catch {}
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product and images deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.status(200).json({ success: true, message: "Stock Updated" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/productController.js
// controllers/productController.js
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const fields = ["name","price","offerPrice","category","inStock","description","rating"];
    const update = {};
    for (const f of fields) if (req.body[f] !== undefined) update[f] = req.body[f];

    // normalize simple types
    if (update.price !== undefined) update.price = Number(update.price);
    if (update.offerPrice !== undefined) update.offerPrice = Number(update.offerPrice);
    if (update.inStock !== undefined) update.inStock = (String(update.inStock) === "true" || update.inStock === true);
    if (typeof update.description === "string") {
      update.description = update.description.split("\n").map(s => s.trim()).filter(Boolean);
    }

    const existingDoc = await Product.findById(id);
    if (!existingDoc) return res.status(404).json({ success: false, message: "Product not found" });

    // parse kept images (from FormData field 'existingImages')
    let keep = [];
    if (req.body.existingImages) {
      try { keep = JSON.parse(req.body.existingImages) || []; } catch {}
    }
    keep = keep
      .map(i => i && typeof i === "object" ? { url: i.url, publicId: i.publicId ?? null } : null)
      .filter(Boolean);

    // upload new files if present
    let uploaded = [];
    if (Array.isArray(req.files) && req.files.length) {
      uploaded = await Promise.all(req.files.map(async (file) => {
        const r = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
        return { url: r.secure_url, publicId: r.public_id };
      }));
    }

    // final list (max 4)
    const finalImages = [...keep, ...uploaded].slice(0, 4);
    update.image = finalImages;

    // delete removed old images from Cloudinary
    const old = Array.isArray(existingDoc.image) ? existingDoc.image : [];
    const toObj = (v) => (typeof v === "object" && v) ? v : { url: String(v), publicId: null };
    const oldMap = new Map(old.map(i => {
      const o = toObj(i);
      return [o.publicId || o.url, o.publicId];
    }));
    for (const img of finalImages) {
      const key = (img.publicId || img.url);
      if (oldMap.has(key)) oldMap.delete(key);
    }
    const removedPublicIds = [...oldMap.values()].filter(Boolean);
    await Promise.all(
      removedPublicIds.map(pid => cloudinary.uploader.destroy(pid, { resource_type: "image" }).catch(() => {}))
    );

    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
