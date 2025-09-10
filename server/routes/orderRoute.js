import express from "express";
import authUser from "../middleware/authUser.js";
import authSeller from "../middleware/authSeller.js";
import { getAllOrders, getUserOrders, placeOrderCOD } from "../controllers/orderController.js";

const orderRouter = express.Router()

orderRouter.post('/cod',authUser,placeOrderCOD)
orderRouter.post('/user',authUser,getUserOrders)
orderRouter.post('/cod',authSeller,getAllOrders)

export default orderRouter