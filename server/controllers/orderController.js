import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from "../models/User.js";

/**
 * COD ORDER
 */
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    // Basic presence checks
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items must be an array" });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate items
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
      amount += Number(product.offerPrice) * Number(it.quantity);
    }

    // Add 2% tax (rounded down)
    amount += Math.floor(amount * 0.02);

    await Order.create({ userId, items, amount, address, paymentType: "COD" });

    return res.status(200).json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * STRIPE ORDER
 */
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;
    const baseUrl = origin || process.env.CLIENT_ORIGIN || "http://localhost:5173";

    // Basic presence checks
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items must be an array" });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate items
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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for stripe
    const line_items = productData.map((p) => ({
      price_data: {
        currency: "inr",
        product_data: { name: p.name },
        unit_amount: p.unitPaise,
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

    // Create session (include session_id in success URL)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/loader?next=my-orders&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
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

/**
 * Webhook to verify payment action
 * NOTE: This must receive the raw body (see server setup)
 */
export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body, // raw Buffer (express.raw)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session?.metadata?.orderId;
        const userId = session?.metadata?.userId;
        const paymentIntentId = session.payment_intent;

        if (orderId && userId) {
          await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            status: "Payment Received",
            paymentIntent: typeof paymentIntentId === "string" ? paymentIntentId : null,
          });

          // Clear cart
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session?.metadata?.orderId;
        if (orderId) {
          await Order.findByIdAndDelete(orderId);
        }
        break;
      }

      // Optional: keep for visibility
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        // Handled indirectly via checkout.session.* events
        break;
      }

      default:
        // console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return response.json({ received: true });
  } catch (err) {
    console.error("[webhook handler] error:", err);
    return response.status(500).send("Webhook handler failed");
  }
};

/**
 * Success-page fallback: confirm session id and mark paid
 * (Covers cases where webhook didn’t fire)
 */
export const confirmStripeSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const orderId = session?.metadata?.orderId;
    const userId = session?.metadata?.userId;

    if (!orderId || !userId) {
      return res.status(400).json({ success: false, message: "Missing order metadata" });
    }

    const paid =
      session.payment_status === "paid" ||
      (typeof session.payment_intent === "string" && !!session.payment_intent);

    if (!paid) {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      status: "Payment Received",
      paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
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
