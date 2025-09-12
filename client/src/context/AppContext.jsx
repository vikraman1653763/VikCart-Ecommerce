import { API_PATHS, BASE_URL } from "@/utils/api";
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = BASE_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  const isSyncingCartRef = useRef(false);

  // fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API_PATHS.PRODUCT.LIST);
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    }
  };

  // Add product to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const cart = prev || {};
      const current = Number(cart[itemId] || 0);
      return { ...cart, [itemId]: current + 1 };
    });
    toast.success("Added to Cart");
  };

  // UPDATE cart item quantity
  const updateCartItem = (itemId, quantity) => {
    setCartItems((prev) => {
      const cart = prev || {};
      return { ...cart, [itemId]: quantity };
    });
    toast.success("Cart Updated");
  };

  // remove product from cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const cart = { ...(prev || {}) };
      if (cart[itemId]) {
        cart[itemId] -= 1;
        if (cart[itemId] <= 0) delete cart[itemId];
      }
      return cart;
    });
    toast.success("Removed From Cart");
  };

  // get cart item count
  const getCartCount = () => {
    const cart = cartItems || {};
    let total = 0;
    for (const id in cart) total += Number(cart[id] || 0);
    return total;
  };

  // get cart total amount
  const getCartAmount = () => {
    const cart = cartItems || {};
    let total = 0;
    for (const id in cart) {
      const qty = Number(cart[id] || 0);
      if (qty > 0) {
        const itemInfo = products.find((p) => p._id === id);
        const price = itemInfo?.offerPrice ?? 0;
        total += price * qty;
      }
    }
    return Math.floor(total * 100) / 100;
  };


  
  // Sequential role detection: try user → then seller
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await axios.get(API_PATHS.USER.IS_AUTH);
        if (data.success) {
          setUser(data.user);
          setCartItems(data.user?.cartItems || {});
          setIsSeller(false);
          return;
        }
      } catch {
        setUser(null);
        setCartItems({});
      }

      try {
        const { data } = await axios.get(API_PATHS.SELLER.IS_AUTH);
        if (data.success) {
          setIsSeller(true);
          return;
        }
      } catch {
        setIsSeller(false);
      }
    };

    initAuth();
    fetchProducts();
  }, []);

  // update CartItem in database
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post(API_PATHS.CART.UPDATE, {
          cartItems: cartItems || {},
        });
        if (!data.success) toast.error(data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    };

    if (user) updateCart();
  }, [cartItems, user]);

 const mergeCarts = (serverCart = {}, localCart = {}) => {
    const merged = { ...serverCart };
    for (const id in localCart) {
      merged[id] = (merged[id] || 0) + localCart[id];
    }
    return merged;
  };

  // ---------- handlePostLogin: call this right after the backend login returns success ----------
  const handlePostLogin = async () => {
    try {
      const localCart = cartItems || {};

      // fetch server user (requires cookie set by login response)
      const userResp = await axios.get(API_PATHS.USER.IS_AUTH);
      if (!userResp.data?.success || !userResp.data?.user) {
        // if something odd, set user to null and keep local cart
        setUser(null);
        return;
      }

      const serverCart = userResp.data.user.cartItems || {};

      // if no local items, just adopt server cart
      if (Object.keys(localCart).length === 0) {
        setUser(userResp.data.user);
        setCartItems(serverCart);
        return;
      }

      // merge and push to server
      const merged = mergeCarts(serverCart, localCart);
      isSyncingCartRef.current = true;

      // update the server cart
      const updateResp = await axios.post(API_PATHS.CART.UPDATE, { cartItems: merged });

      // prefer server-returned cartItems if provided
      const finalCart = updateResp?.data?.cartItems || merged;

      // refresh user to get latest server-side user object
      const fresh = await axios.get(API_PATHS.USER.IS_AUTH);

      setUser(fresh?.data?.user || userResp.data.user);
      setCartItems(finalCart);
    } catch (err) {
      console.error("handlePostLogin error", err);
      // fallback: try to fetch user and adopt whatever cart the server has
      try {
        const fallback = await axios.get(API_PATHS.USER.IS_AUTH);
        if (fallback.data?.success && fallback.data.user) {
          setUser(fallback.data.user);
          setCartItems(fallback.data.user.cartItems || {});
        }
      } catch (e) {
        // final fallback: keep local cart and keep user null
      }
    } finally {
      // short delay then re-enable automatic sync
      setTimeout(() => (isSyncingCartRef.current = false), 200);
    }
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    setCartItems,
    handlePostLogin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
