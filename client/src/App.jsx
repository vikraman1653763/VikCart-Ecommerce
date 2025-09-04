import React from "react";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller")
  return (
    <div>
      
      {isSellerPath ?null:<Navbar/>}
      <Toaster/>

      <div className={`${isSellerPath?"":""} px-6 md:px-16 lg:px-24 xl:px-32`}>
        <Routes>
          <Route path="/" element={<Home/>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
