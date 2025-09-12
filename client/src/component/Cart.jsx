import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgCloseO } from "react-icons/cg";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
    setShowUserLogin
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  const getCart = () => {
    const tempArray = Object.entries(cartItems || {})
      .map(([id, qty]) => {
        const p = products.find((item) => item._id === id);
        if (!p) return null; // product may not exist anymore
        return { ...p, quantity: Number(qty) || 0 }; // don't mutate original
      })
      .filter(Boolean);

    setCartArray(tempArray);
  };

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get(API_PATHS.ADDRESS.GET);
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const placeOrder = async () => {
    try {
      if (!user) {
        setShowUserLogin(true);
        return toast.error("Please login to place an order");
      }
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }
      // COD order
      if (paymentOption === "COD") {
        const { data } = await axios.post(API_PATHS.ORDER.PLACE_COD, {
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        });
        if (data.success) {
          toast.success(data.message || "Order placed successfully");
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message || "Could not place order");
        }
      } else {
        // Stripe order
        const { data } = await axios.post(API_PATHS.ORDER.PLACE_STRIPE, {
          userId: user._id,
          items: cartArray.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          address: selectedAddress._id,
        });
        if (data.success) {
          window.location.replace(data.url);
        } else {
          toast.error(data.message || "Could not place order");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  useEffect(() => {
    if (user) {
      getUserAddress();
    }
  }, [user]);

  // ===== Derived totals for UI (match backend rules) =====
  const subtotal = getCartAmount(); // rupees
  const deliveryFee = subtotal > 0 && subtotal < 100 ? 50 : 0; // ₹50 if subtotal < ₹100
  const tax = Math.round(subtotal * 0.02); // 2% on subtotal (not on delivery)
  const grandTotal = subtotal + tax + deliveryFee;

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-16">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-primary">${getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(
                    `/products/${product.category.toLowerCase()}/${product._id}`
                  );
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={
                    Array.isArray(product.image)
                      ? typeof product.image[0] === "object"
                        ? product.image[0]?.url
                        : product.image[0]
                      : product.image
                  }
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      value={cartItems?.[product._id] ?? product.quantity ?? 1}
                      className="outline-none"
                    >
                      {Array(
                        Math.max(9, cartItems?.[product._id] ?? product.quantity ?? 1)
                      )
                        .fill(0)
                        .map((_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              {currency}
              {product.offerPrice * product.quantity}
            </p>
            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto "
            >
              {/* Single handler; removed inner onClick to avoid passing no id */}
              <CgCloseO alt="remove" className=" inline-block w-6 h-6 text-red-400" />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium"
        >
          <img
            src={assets.arrow_right_icon_colored}
            alt="arrow"
            className="group-hover:-translate-x-1 transition"
          />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">
              {selectedAddress
                ? `${selectedAddress.street},${selectedAddress.city},${selectedAddress.state},${selectedAddress.country}`
                : "No address found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-primary hover:underline cursor-pointer"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                {addresses.map((address, i) => (
                  <p
                    key={address._id || i}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100"
                  >
                    {address.street}, {address.city}, {address.state},{" "}
                    {address.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10"
                >
                  Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

          <select
            onChange={(e) => setPaymentOption(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>
              {currency}
              {subtotal}
            </span>
          </p>

          <p className="flex justify-between">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? "text-green-600" : ""}>
              {deliveryFee === 0 ? "Free" : `${currency}${deliveryFee}`}
            </span>
          </p>

          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>
              {currency}
              {tax}
            </span>
          </p>

          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>
              {currency}
              {grandTotal}
            </span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;
