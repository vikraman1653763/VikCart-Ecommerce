import jwt from "jsonwebtoken";

const authSeller = async (req,res,next)=>{
    const{sellerToken} = req.cookies
    if(!sellerToken){
        return res.status(403).json({success:false,message:'Not Authorized'})
    }
      try {
        const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    
        if (!decoded.email === process.env.SELLER_EMAIL) {
          return res.status(401).json({ success: false, message: "Not Authorized" });
        }    
        next();
      } catch (error) {
        console.error(error.message);
        return res.status(401).json({ success: false, message: "Invalid Token" });
      }
    };
    
    export default authSeller;
    
