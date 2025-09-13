import React from "react";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./component/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./component/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./component/ProductDetails";
import Cart from "./component/Cart";
import AddAddress from "./component/AddAddress";
import MyOrders from "./component/MyOrders";
import SellerLogin from "./component/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Loading from "./component/Loading";
import Contact from "./pages/Contact";
import 'leaflet/dist/leaflet.css';

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller")
  const{showUserLogin,isSeller} = useAppContext()
  return (
    <div className=" text-default min-h-screen text-gray-700 bg-white">
      
      {isSellerPath ?null:<Navbar/>}
      {showUserLogin ?<Login/>:null}
      <Toaster toastLimit={5}/>

      <div className={`${isSellerPath?"": "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/" element={<Home/>} /> 
          <Route path="/contact" element={<Contact/>} /> 
          <Route path="/products" element={<AllProducts/>} />
          <Route path="/products/:category" element={<ProductCategory/>} />
          <Route path="/products/:category/:id" element={<ProductDetails/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/add-address" element={<AddAddress/>} />
          <Route path="/my-orders" element={<MyOrders/>} />
          <Route path="/loader" element={<Loading/>} />
          <Route path="/seller" element={isSeller? <SellerLayout/>:<SellerLogin/>}>
          <Route index element={isSeller?<AddProduct/>:null}/>
          <Route path="product-list" element={isSeller?<ProductList/>:null}/>
          <Route path="orders" element={isSeller?<Orders/>:null}/>
          </Route>
        </Routes>
      </div>
            {isSellerPath ?null:<Footer/>}

    </div>
  );
};

export default App;
