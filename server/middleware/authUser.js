import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    // safer than touching req.body
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default authUser;
