// ProductDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import { GrStar } from "react-icons/gr";
import { assets } from "@/assets/assets";

const ProductDetails = () => {
  const { products, navigate, currency, addToCart, removeFromCart, cartItems } =
    useAppContext();

  const { id } = useParams();
  const product = useMemo(
    () => products.find((item) => item._id === id),
    [products, id]
  );

  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // helpers
  const getImgSrc = (img) =>
    img && typeof img === "object" ? img.url : img || "";
  const getFirstImg = (p) => {
    if (!p?.image) return "";
    if (Array.isArray(p.image)) return getImgSrc(p.image[0]);
    return getImgSrc(p.image);
  };
  const toArr = (val) => (Array.isArray(val) ? val : val ? [val] : []);
  const fmt = (n) => (Number.isFinite(+n) ? (+n).toFixed(2) : "0.00");

  // related products: same category, exclude current, only in-stock
  useEffect(() => {
    if (!product) {
      setRelatedProducts([]);
      return;
    }
    const rel = products
      .filter(
        (it) =>
          it?._id !== id &&
          it?.category &&
          product?.category &&
          it.category === product.category
      )
      .slice(0, 5);
    setRelatedProducts(rel);
  }, [products, product, id]);

  // set initial thumbnail
  useEffect(() => {
    setThumbnail(getFirstImg(product) || assets.upload_area || "");
  }, [product]);

  if (!product) {
    return (
      <div className="mt-12">
        <p className="text-gray-500">Product not found.</p>
        <button
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="mt-4 px-4 py-2 rounded border text-primary hover:bg-primary/10"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const qtyInCart = cartItems?.[product._id] || 0;
  const ratingNum = Math.max(0, Math.min(5, Number(product?.rating ?? 0)));
  const roundedRating = Math.round(ratingNum);
  const inStock = product?.inStock !== false;
  const price = fmt(product?.price);
  const offerPrice = fmt(product?.offerPrice);
  const imageList = toArr(product?.image);
  const descList = toArr(product?.description);
  const categorySlug = (product?.category || "products").toLowerCase();

  return (
    <div className="mt-12">
      {/* Breadcrumbs */}
      <p className="text-sm">
        <Link to="/">Home</Link> /
        <Link to="/products"> Products</Link> /
        <Link to={`/products/${categorySlug}`}> {product?.category || "—"}</Link> /
        <span className="text-primary"> {product?.name || "Unnamed"}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        {/* Images */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {imageList.length > 0 ? (
              imageList.map((img, index) => {
                const src = getImgSrc(img);
                return (
                  <div
                    key={index}
                    onClick={() => setThumbnail(src)}
                    className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                  >
                    {src ? (
                      <img src={src} alt={`Thumbnail ${index + 1}`} />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="border max-w-24 border-gray-500/30 rounded overflow-hidden flex items-center justify-center text-xs text-gray-400 p-3">
                No images
              </div>
            )}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt="Selected product"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-[320px] h-[320px] flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product?.name || "Unnamed"}</h1>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <GrStar
                key={i}
                size={18}
                className={i < roundedRating ? "text-primary" : "text-primary/30"}
              />
            ))}
            <p className="text-base ml-2">({ratingNum})</p>
          </div>

          {/* Prices */}
          <div className="mt-6">
            {Number(product?.price) > 0 && (
              <p className="text-gray-500/70 line-through">
                MRP: {currency}
                {price}
              </p>
            )}
            <p className="text-2xl font-medium">
              Price: {currency}
              {offerPrice}
            </p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          {/* About */}
          {descList.length > 0 && (
            <>
              <p className="text-base font-medium mt-6">About Product</p>
              <ul className="list-disc ml-4 text-gray-500/70">
                {descList.map((desc, index) => (
                  <li key={index}>{String(desc)}</li>
                ))}
              </ul>
            </>
          )}

          {/* Cart Controls */}
          <div className="flex items-center mt-10 gap-4 text-base">
            {!inStock ? (
              <div className="w-full py-3.5 text-center font-medium bg-gray-100 text-gray-400 rounded">
                Out of stock
              </div>
            ) : qtyInCart === 0 ? (
              <>
                <button
                  onClick={() => addToCart(product._id)}
                  className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    addToCart(product._id);
                    navigate("/cart");
                    window.scrollTo(0, 0);
                  }}
                  className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
                >
                  Buy now
                </button>
              </>
            ) : (
              <div className="w-full flex items-center gap-4">
                {/* qty control */}
                <div className="w-full py-3 cursor-pointer flex items-center justify-center font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition select-none rounded">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer text-lg px-3 h-full"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{qtyInCart}</span>
                  <button
                    onClick={() => addToCart(product._id)}
                    className="cursor-pointer text-lg px-3 h-full"
                  >
                    +
                  </button>
                </div>

                {/* go to cart */}
                <button
                  onClick={() => {
                    navigate("/cart");
                    window.scrollTo(0, 0);
                  }}
                  className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white rounded hover:bg-primary-dull transition"
                >
                  Go to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max">
          <p className="text-3xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
          {relatedProducts.filter((rp) => rp?.inStock !== false).map((rp) => (
            <ProductCard key={rp._id} product={rp} />
          ))}
        </div>
        <button
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
        >
          See more
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
