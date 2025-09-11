import { dummyProducts } from "@/assets/assets";
import { API_PATHS, BASE_URL } from "@/utils/api";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
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

  // fetch seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get(API_PATHS.SELLER.IS_AUTH);
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // fetch user status
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(API_PATHS.USER.IS_AUTH);
      if (data.success) {
        setUser(data.user)
      setCartItems(data.user?.cartItems || {}); 
          }
else {
      setUser(null);
      setCartItems({});                         
    }
    } catch (error) {
      setUser(null)
       setCartItems({});  
    }
  };

  //fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API_PATHS.PRODUCT.LIST);
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(error.response?.data?.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

// Add product to cart
const addToCart = (itemId) => {
  setCartItems(prev => {
    const cart = prev || {};                 // ← fallback
    const current = Number(cart[itemId] || 0);
    return { ...cart, [itemId]: current + 1 };
  });
  toast.success("Added to Cart");
};

// UPDATE cart item quantity
const updateCartItem = (itemId, quantity) => {
  setCartItems(prev => {
    const cart = prev || {};
    return { ...cart, [itemId]: quantity };
  });
  toast.success("Cart Updated");
};

// remove product from cart
const removeFromCart = (itemId) => {
  setCartItems(prev => {
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
      const itemInfo = products.find(p => p._id === id);
      const price = itemInfo?.offerPrice ?? 0;   // ← guard if products not loaded
      total += price * qty;
    }
  }
  return Math.floor(total * 100) / 100;
};


  useEffect(() => {
    fetchUser()
    fetchSeller();
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
    setCartItems
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
