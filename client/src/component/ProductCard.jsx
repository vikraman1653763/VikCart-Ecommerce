// ProductCard.jsx
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { GrStar } from "react-icons/gr";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { assets } from "@/assets/assets";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();
  if (!product) return null;

  // helpers
  const getImgSrc = (img) => {
    if (!img) return assets.upload_area || ""; // fallback placeholder
    return typeof img === "object" && img !== null ? img.url : img;
  };
  const mainImg =
    Array.isArray(product.image)
      ? getImgSrc(product.image[0])
      : getImgSrc(product.image);

  const category = product.category || "Product";
  const name = product.name || "Unnamed";
  const ratingNum = Math.max(0, Math.min(5, Number(product?.rating ?? 0)));
  const offer = Number(product?.offerPrice ?? 0);
  const mrp = Number(product?.price ?? 0);
  const inStock = product?.inStock !== false; // default true if missing

  const qtyInCart = cartItems?.[product._id] || 0;

  const goToDetail = () => {
    // tolerate missing category/id
    const cat = (category || "misc").toLowerCase();
    const id = product?._id || "";
    navigate(`/products/${cat}/${id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      onClick={goToDetail}
      className="border border-gray-500/30 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? goToDetail() : null)}
    >
      <div className="group cursor-pointer flex items-center justify-center px-2">
        {mainImg ? (
          <img
            className="group-hover:scale-105 transition max-w-26 md:max-w-36 object-contain"
            src={mainImg}
            alt={name}
          />
        ) : (
          <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">
            No image
          </div>
        )}
      </div>

      <div className="text-gray-500/60 text-sm">
        <p className="truncate">{category}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full" title={name}>
          {name}
        </p>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <GrStar
              key={i}
              size={18}
              className={i < Math.round(ratingNum) ? "text-primary" : "text-primary/30"}
            />
          ))}
          <p className="ml-1">({Number.isFinite(ratingNum) ? ratingNum : 0})</p>
        </div>

        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}
            {offer.toFixed(2)}{" "}
            {mrp > 0 && (
              <span className="text-gray-500/60 md:text-sm text-xs line-through">
                {currency}
                {mrp.toFixed(2)}
              </span>
            )}
          </p>

          <div className="text-primary" onClick={(e) => e.stopPropagation()}>
            {!inStock ? (
              <span className="inline-flex items-center justify-center px-2 h-[34px] rounded border border-gray-300 text-gray-400 text-xs cursor-not-allowed">
                Out of stock
              </span>
            ) : qtyInCart <= 0 ? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded text-primary cursor-pointer"
                onClick={() => addToCart(product._id)}
                aria-label={`Add ${name} to cart`}
              >
                <HiOutlineShoppingCart size={17} />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/20 border border-primary/40 rounded select-none font-bold">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer text-md px-2 h-full"
                  aria-label={`Decrease ${name} quantity`}
                >
                  -
                </button>
                <span className="w-5 text-center">{qtyInCart}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer text-md px-2 h-full"
                  aria-label={`Increase ${name} quantity`}
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
