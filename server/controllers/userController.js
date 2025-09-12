import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .json({ success: false, message: "Missing Details" })
        .status(400);
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .json({ success: false, message: "User already Exists" })
        .status(400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

 res.cookie("token", token, {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production", // in prod use HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    return res.status(200).json({
  success: true,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    cartItems: user.cartItems || {},
  },})
  
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message }).status(500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing field" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .json({ success: true, user: { email: user.email, name: user.name } })
      .status(200);
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message }).status(500);
  }
};

// CHECK AUTH
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const logout = async(req,res)=>{
  try {
    res.clearCookie('token',{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'prodction' ? 'none' : 'strict' ,
    })
    return res.json({success:true,message:"Logged Out"})
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message }).status(500);
  }
}