// controllers/addressController.js
import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const userId = req.userId; // ← from authUser
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: "Missing address" });
    }

    // Your schema expects Number; inputs are strings → coerce:
    const payload = {
      ...address,
      userId,
      zipcode: Number(address.zipcode),
    };

    if (!Number.isFinite(payload.zipcode)) {
      return res.status(400).json({ success: false, message: "Invalid zipcode" });
    }

    await Address.create(payload);
    return res.status(200).json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error("[addAddress] error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const userId = req.userId; // ← from authUser
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    const addresses = await Address.find({ userId }).lean();
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("[getAddress] error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
