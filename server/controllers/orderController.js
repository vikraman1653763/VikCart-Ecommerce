import { request, response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";
// COD ORDER
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    // Basic presence checks
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }
    if (!items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Items must be an array" });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Optional: validate item shape & quantities
    for (const [idx, it] of items.entries()) {
      if (!it?.product) {
        return res.status(400).json({
          success: false,
          message: `Item ${idx + 1}: product id is required`,
        });
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${idx + 1}: quantity must be > 0`,
        });
      }
    }

    // Compute amount
    let amount = 0;
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${it.product}`,
        });
      }
      amount += product.offerPrice * Number(it.quantity);
    }

    // Add 2% tax (rounded down; adjust if you prefer precise cents)
    amount += Math.floor(amount * 0.02);

    await Order.create({ userId, items, amount, address, paymentType: "COD" });

    return res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//STRIPE ORDER
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;
    const baseUrl =
      origin || process.env.CLIENT_ORIGIN || "http://localhost:5173";

    // Basic presence checks
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }
    if (!items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Items must be an array" });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Optional: validate item shape & quantities
    for (const [idx, it] of items.entries()) {
      if (!it?.product) {
        return res.status(400).json({
          success: false,
          message: `Item ${idx + 1}: product id is required`,
        });
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${idx + 1}: quantity must be > 0`,
        });
      }
    }
    let productData = [];
    let subtotalPaise = 0;

    // Compute amount
    for (const it of items) {
      const product = await Product.findById(it.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${it.product}`,
        });
      }
      const unitPaise = Math.round(Number(product.offerPrice) * 100); // ₹ → paise
      const qty = Number(it.quantity);
      productData.push({
        name: product.name,
        unitPaise,
        quantity: qty,
      });
      subtotalPaise += unitPaise * qty;
    }

    // Add 2% tax
    const taxPaise = Math.round(subtotalPaise * 0.02);
    const amountPaise = subtotalPaise + taxPaise;

    const amountRupees = amountPaise / 100;

    const order = await Order.create({
      userId,
      items,
      amount: amountRupees,
      address,
      paymentType: "Online",
    });

    // Stripe gateway
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((p) => ({
      price_data: {
        currency: "inr", //  INR
        product_data: { name: p.name },
        unit_amount: p.unitPaise, // paise
      },
      quantity: p.quantity,
    }));

    if (taxPaise > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Tax (2%)" },
          unit_amount: taxPaise, // whole tax as a single line
        },
        quantity: 1,
      });
    }

    //create session
    const session = await stripeInstance.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });
    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// stripe webhooks to verify the payment action
export const stripeWebhooks = async (request, response) => {
  //  stripe gateway initialize
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }
  //handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // clear cart data
      await User.findByIdAndUpdate(userId, { cartItems: {} });

      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
