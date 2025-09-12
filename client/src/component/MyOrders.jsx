// MyOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import toast from "react-hot-toast";
import { assets } from "@/assets/assets";

const MyOrders = () => {
  const { axios, user, currency, navigate } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fmtAmt = (n) => `${currency}${(Number(n) || 0).toFixed(2)}`;

  const getImgSrc = (img) => {
    if (!img) return assets.upload_area || ""; // fallback
    // array entry can be string URL or {url, publicId}
    return typeof img === "object" && img !== null ? img.url : img;
  };

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_PATHS.ORDER.USER_ORDERS);
      if (data.success) {
        setMyOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchMyOrders();
  }, [user?._id]); // only refetch when user changes

  // Sort newest first; tolerate missing createdAt
  const sortedOrders = useMemo(() => {
    return [...myOrders].sort((a, b) => {
      const tA = new Date(a?.createdAt || 0).getTime();
      const tB = new Date(b?.createdAt || 0).getTime();
      return tB - tA;
    });
  }, [myOrders]);

  if (!user) {
    return (
      <div className="mt-16 pb-16">
        <div className="flex flex-col items-start gap-2 max-w-2xl">
          <p className="text-2xl font-medium">My Orders</p>
          <p className="text-gray-500">Please log in to see your orders.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-start w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full" />
      </div>

      {loading && (
        <div className="text-gray-500">Loading your orders…</div>
      )}

      {!loading && sortedOrders.length === 0 && (
        <div className="text-gray-500">
          You don’t have any orders yet.
        </div>
      )}

      {!loading &&
        sortedOrders.map((order) => {
          const orderId = order?._id || "—";
          const paymentType = order?.paymentType || "—";
          const orderAmount = fmtAmt(order?.amount);

          const items = Array.isArray(order?.items) ? order.items : [];

          return (
            <div
              key={orderId}
              className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
            >
              <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col break-words gap-2">
                <span className="break-all font-mono text-xs md:text-sm">
                  Order ID: {orderId}
                </span>
                <span>Payment: {paymentType}</span>
                <span>Total Amount: {orderAmount}</span>
              </p>

              {items.length === 0 && (
                <div className="text-gray-500 mt-4">
                  No items found for this order.
                </div>
              )}

              {items.map((item, idx) => {
                const prod = item?.product || {};
                const name = prod?.name || "Unnamed Product";
                const category = prod?.category || "—";
                const img0 = Array.isArray(prod?.image) ? prod.image[0] : prod?.image;
                const imgSrc = getImgSrc(img0);
                const qty = Number(item?.quantity || 1);
                const price = Number(prod?.offerPrice || 0);
                const lineTotal = fmtAmt(qty * price);

                const created = order?.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "—";
                const status = order?.status || "Processing";

                return (
                  <div
                    className={`relative bg-white text-gray-600 ${
                      items.length !== idx + 1 ? "border-b" : ""
                    } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl`}
                    key={`${orderId}-${prod?._id || idx}`}
                  >
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="bg-primary/10 p-4 rounded-lg w-24 h-24 flex items-center justify-center overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={name}
                            className="w-16 h-16 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg md:text-xl font-medium text-gray-800">
                          {name}
                        </h2>
                        <p className="text-sm">Category: {category}</p>
                      </div>
                    </div>

                    <div className="text-sm md:text-base font-normal flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                      <p>Quantity: {qty}</p>
                      <p>Status: {status}</p>
                      <p>Date: {created}</p>
                    </div>

                    <p className="text-primary text-lg font-medium">
                      Amount: {lineTotal}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};

export default MyOrders;
