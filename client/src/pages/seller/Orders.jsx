import ConfirmDialog from "@/component/ConfirmDialog";
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GiBasket } from "react-icons/gi";

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // confirm dialog only for Delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCfg, setConfirmCfg] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(API_PATHS.ORDER.ALL_ORDERS);
      if (data.success) setOrders(Array.isArray(data.orders) ? data.orders : []);
      else toast.error(data.message || "Failed to fetch orders");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const onToggleDelivered = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const { data } = await axios.patch(API_PATHS.ORDER.TOGGLE_DELIVERED(orderId));
      if (data.success) {
        toast.success(data.order?.isDelivered ? "Marked Delivered" : "Marked Undelivered");
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...data.order } : o)));
      } else toast.error(data.message || "Failed to update");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const onDeleteOrder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const { data } = await axios.delete(API_PATHS.ORDER.DELETE(orderId));
      if (data.success) {
        toast.success("Order deleted");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else toast.error(data.message || "Failed to delete");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = (order) => {
    setConfirmCfg({
      title: "Delete this order?",
      message:
        `This will permanently remove the order placed on ${new Date(order.createdAt).toLocaleString()}.\n` +
        `This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "danger",
      onConfirm: () => onDeleteOrder(order._id),
    });
    setConfirmOpen(true);
  };

  if (loading) return <div className="p-6">Loading orders…</div>;
  if (!orders.length) return <div className="p-6">No orders found.</div>;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {orders.map((order) => {
          const addr = order?.address || {};
          const items = Array.isArray(order?.items) ? order.items : [];
          const delivered = !!order?.isDelivered;

          return (
            <div
              key={order?._id || order?.id}
              className="relative flex flex-col md:items-start md:flex-row justify-between gap-5 p-5 pr-24 max-w-4xl rounded-md border border-gray-300"
            >
             

             
              {/* LEFT: basket + items */}

              <div className="flex gap-5 max-w-80">
<div className=" relative flex items-center justify-start  gap-4 flex-col w-23">

                <GiBasket size={50} className="text-primary bg-primary/10 border border-primary/30 rounded-sm p-1" />
                 {/* STATUS: absolute bottom-left */}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium
                  ${delivered ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                {delivered ? "Delivered" : "Not Delivered"}
              </span>
                </div>

                <div>
                  {items.length === 0 && <p className="text-black/60">No items</p>}
                  {items.map((item, idx) => {
                    const name = item?.product?.name || item?.name || "Product unavailable";
                    return (
                      <div key={item?._id || idx} className="flex flex-col">
                        <p className="font-medium">
                          {name} <span className="text-primary">x {item?.quantity ?? 0}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="text-sm md:text-base text-black/60">
                <p className="text-black/80">{[addr.firstName, addr.lastName].filter(Boolean).join(" ")}</p>
                <p>{[addr.street, addr.city].filter(Boolean).join(", ")}</p>
                <p>{[addr.state, addr.zipcode, addr.country].filter(Boolean).join(", ")}</p>
                <p>{addr.phone || ""}</p>
              </div>

              {/* AMOUNT + META + DELETE (static, in normal flow) */}
              <div className="flex flex-col items-start gap-2 ">
                <p className="font-medium text-lg">
                  {currency}{order?.amount ?? 0}
                </p>
                <span className="text-xs text-black/60">Payment: {order?.isPaid ? "Paid" : "Pending"}</span>
                <span className="text-xs text-black/60">
                  Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                </span>

              </div>
                {/* Delete button — STATIC (not absolute) */}
               {/* TOGGLE */}
                <div className="absolute top-3 bottom-3 right-3 flex flex-col justify-between items-end">
        {/* Toggle (top) */}
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={delivered}
            onChange={() => onToggleDelivered(order._id)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 relative transition">
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        {/* Delete (bottom) – static inside this column */}
        <button
          onClick={() => confirmDelete(order)}
          disabled={actionLoadingId === order._id}
          className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
          title="Delete order"
        >
          Delete
        </button>
      </div>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog for delete */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (typeof confirmCfg.onConfirm === "function") {
            await confirmCfg.onConfirm();
          }
        }}
        title={confirmCfg.title}
        message={confirmCfg.message}
        confirmText={confirmCfg.confirmText}
        cancelText={confirmCfg.cancelText}
        confirmVariant={confirmCfg.confirmVariant}
      />
    </div>
  );
};

export default Orders;
