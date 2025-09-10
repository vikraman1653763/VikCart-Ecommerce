export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const API_PATHS = {
  USER: {
    REGISTER: "/api/user/register",
    LOGIN: "/api/user/login",
    IS_AUTH: "/api/user/is-auth",
    LOGOUT: "/api/user/logout",
  },

  SELLER: {
    LOGIN: "/api/seller/login",
    IS_AUTH: "/api/seller/is-auth",
    LOGOUT: "/api/seller/logout",
  },

  PRODUCT: {
    ADD: "/api/product/add",
    LIST: "/api/product/list",
    BY_ID: "/api/product/by-id",
    CHANGE_STOCK: "/api/product/stock",
  },

  CART: {
    UPDATE: "/api/cart/update",
  },

  ADDRESS: {
    ADD: "/api/address/add",
    GET: "/api/address/get",
  },

  ORDER: {
    PLACE_COD: "/api/order/cod",
    USER_ORDERS: "/api/order/user",
    ALL_ORDERS: "/api/order/cod", // seller view
  },
};
