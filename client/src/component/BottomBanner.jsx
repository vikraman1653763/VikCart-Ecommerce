import { assets, features } from "@/assets/assets";
import React from "react";

const BottomBanner = () => {
  return (
    <div className=" relative mt-24">
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full md:hidden block"
      />
      <div className=" absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 md:pr-24">
        <div>
          <h1 className=" text-2xl md:text-3xl font-semibold text-primary mb-6">
            Why We Are the Best?
          </h1>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}>
                {Icon ? (
                  <Icon
                    size={36}
                    className="shrink-0 text-primary/80"
                    aria-hidden="true"
                  />
                ) : null}{" "}
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">
                    {f.title}
                  </h3>
                  <p className="text-gray-500/70 text-xs md:text-sm">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomBanner;
