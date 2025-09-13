// ProductCard.jsx
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { GrStar } from "react-icons/gr";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { assets } from "@/assets/assets";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();
  if (!product) return null;

  // helpers
  const getImgSrc = (img) => {
    if (!img) return assets.upload_area || "";
    return typeof img === "object" && img !== null ? img.url : img;
  };
  const mainImg = Array.isArray(product.image)
    ? getImgSrc(product.image[0])
    : getImgSrc(product.image);

  const category = product.category || "Product";
  const name = product.name || "Unnamed";
  const ratingNum = Math.max(0, Math.min(5, Number(product?.rating ?? 0)));
  const offer = Number(product?.offerPrice ?? 0);
  const mrp = Number(product?.price ?? 0);
  const inStock = product?.inStock !== false;
  const qtyInCart = cartItems?.[product._id] || 0;

  const goToDetail = () => {
    const cat = (category || "misc").toLowerCase();
    const id = product?._id || "";
    navigate(`/products/${cat}/${id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      onClick={goToDetail}
      className="border border-gray-300 rounded-lg bg-white w-full max-w-[220px] sm:max-w-[240px] p-2 sm:p-3 flex flex-col hover:shadow-sm transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? goToDetail() : null)}
    >
      {/* Image */}
      <div className="flex items-center justify-center h-28 sm:h-36 overflow-hidden">
        {mainImg ? (
          <img
            className="max-h-full object-contain transition group-hover:scale-105"
            src={mainImg}
            alt={name}
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-col flex-1">
        <p className="text-gray-500/70 text-xs sm:text-sm truncate">
          {category}
        </p>
        <p
          className="text-gray-800 font-medium text-sm sm:text-base truncate"
          title={name}
        >
          {name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-0.5 text-xs sm:text-sm mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <GrStar
              key={i}
              size={14}
              className={i < Math.round(ratingNum) ? "text-primary" : "text-gray-300"}
            />
          ))}
          <span className="ml-1">({ratingNum})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-2 sm:mt-3">
          <p className="text-primary font-semibold text-sm sm:text-base">
            {currency}
            {offer.toFixed(2)}{" "}
            {mrp > 0 && (
              <span className="text-gray-500/60 text-xs sm:text-sm line-through ml-1">
                {currency}
                {mrp.toFixed(2)}
              </span>
            )}
          </p>

          <div className="text-primary" onClick={(e) => e.stopPropagation()}>
            {!inStock ? (
              <span className="inline-flex items-center justify-center text-center px-2 h-7 sm:h-8 rounded border border-gray-300 text-gray-400 text-[10px] sm:text-xs cursor-not-allowed">
                Out of stock
              </span>
            ) : qtyInCart <= 0 ? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-14 sm:w-16 h-7 sm:h-8 rounded text-primary text-xs sm:text-sm"
                onClick={() => addToCart(product._id)}
              >
                <HiOutlineShoppingCart size={14} />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1 sm:gap-2 w-14 sm:w-20 h-7 sm:h-8 bg-primary/20 border border-primary/40 rounded select-none font-bold text-xs sm:text-sm">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="px-1 sm:px-2"
                >
                  -
                </button>
                <span>{qtyInCart}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="px-1 sm:px-2"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
