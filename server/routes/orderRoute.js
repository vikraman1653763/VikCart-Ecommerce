import express from "express";
import authUser from "../middleware/authUser.js";
import authSeller from "../middleware/authSeller.js";
import { deleteOrderById, getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, toggleDelivered } from "../controllers/orderController.js";

const orderRouter = express.Router()

orderRouter.post('/cod',authUser,placeOrderCOD)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.get('/user',authUser,getUserOrders)
orderRouter.get('/all',authSeller,getAllOrders)
orderRouter.patch("/:id/delivered", authSeller, toggleDelivered);
orderRouter.delete("/:id", authSeller, deleteOrderById);

export default orderRouter