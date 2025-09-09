import express from "express";
import authUser from "../middleware/authUser.js";
import { isSellerAuth, sellerLogin, sellerLogout } from "../controllers/sellerController.js";

const sellerRouter = express.Router()

sellerRouter.post('/login',sellerLogin)
sellerRouter.get('/is-auth',authUser,isSellerAuth)
sellerRouter.get('/logout',authUser,sellerLogout) 


export default sellerRouter