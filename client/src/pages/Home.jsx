import BestSeller from "@/component/BestSeller";
import BottomBanner from "@/component/BottomBanner";
import Categories from "@/component/Categories";
import MainBanner from "@/component/MainBanner";
import NewsLetter from "@/component/NewsLetter";
import React from "react";

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsLetter/>
    </div>
  );
};

export default Home;
