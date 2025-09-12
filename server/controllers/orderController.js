import { request, response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";
// COD ORDER
export const placeOrderCOD = async (req, res) => {
  try {

    const userId = req.userId;
    const { items, address } = req.body;
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
    amount += Math.round(amount * 0.02);

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
export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  console.log("Webhook hit. Has signature:", !!sig, "Content-Type:", req.headers["content-type"]);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("constructEvent failed:", err.message);
    // Return 400 so Stripe retries, but now you can see the exact reason
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Event OK:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("session.metadata:", session.metadata);
        const { orderId, userId } = session.metadata || {};
        if (orderId) await Order.findByIdAndUpdate(orderId, { isPaid: true /*, status: "Paid"*/ });
        if (userId) await User.findByIdAndUpdate(userId, { cartItems: {} });
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
        const sess = sessions.data[0];
        console.log("pi → session.metadata:", sess?.metadata);
        if (sess?.metadata?.orderId) await Order.findByIdAndUpdate(sess.metadata.orderId, { isPaid: true });
        if (sess?.metadata?.userId) await User.findByIdAndUpdate(sess.metadata.userId, { cartItems: {} });
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
        const sess = sessions.data[0];
        if (sess?.metadata?.orderId) await Order.findByIdAndDelete(sess.metadata.orderId);
        break;
      }
      default:
        // no-op
        break;
    }
    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    // Still return 200 to avoid retry storms during debugging
    return res.json({ received: true });
  }
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


export const toggleDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.isDelivered = !order.isDelivered;
    order.deliveredAt = order.isDelivered ? new Date() : undefined;
    await order.save();

    // return fresh populated order for UI
    const full = await Order.findById(id).populate("items.product address");
    return res.json({ success: true, order: full });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// NEW – delete order
export const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Order.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, message: "Order deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};