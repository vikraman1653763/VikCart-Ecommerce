// controllers/cartController.js
import User from "../models/User.js";

export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;                   // ✅ from authUser
    const cartItems = req.body?.cartItems || {}; // guard

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { cartItems } },                   // safer update
      { new: true }                              // return updated doc
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Cart Updated",
      cartItems: updated.cartItems || {}
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success:false, message:error.message });
  }
};
