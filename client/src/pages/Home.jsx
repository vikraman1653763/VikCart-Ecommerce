import BestSeller from "@/component/BestSeller";
import BottomBanner from "@/component/BottomBanner";
import Categories from "@/component/Categories";
import MainBanner from "@/component/MainBanner";
import React from "react";

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
    </div>
  );
};

export default Home;
