import { assets, dummyOrders } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GiBasket } from "react-icons/gi";

const Orders = () => {
  const { currency ,axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const {data} = await axios.get(API_PATHS.ORDER.ALL_ORDERS)
      if(data.success){
        setOrders(data.orders)
      }else{
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:items-center md:flex-row justify-between  gap-5 p-5 max-w-4xl rounded-md border border-gray-300 "
          >
            <div className="flex gap-5 max-w-80">
              <GiBasket size={50} className="text-primary bg-primary/10 border border-primary/30 rounded-sm p-1"/>
             
              <div className="">
                {order.items.map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <p className="font-medium">
                      {item.product.name}{" "}
                      <span
                        className={`text-primary`}
                      >
                        x {item.quantity}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm md:text-base text-black/60">
              <p className="text-black/80">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>
                {order.address.street}, {order.address.city}</p><p>
                {order.address.state}, {order.address.zipcode},{" "}
                {order.address.country}
              </p>
<p></p>
              <p>{order.address.phone}</p>
            </div>

            <p className="font-medium text-lg my-auto">
              {currency}{order.amount}
            </p>

            <div className="flex flex-col text-sm md:text-base text-black/60">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
