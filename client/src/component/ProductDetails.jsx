import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { GrStar } from "react-icons/gr";

const ProductDetails = () => {
  const { products, navigate, currency, addToCart, removeFromCart, cartItems } =
    useAppContext();

  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);

  const product = products.find((item) => item._id === id);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (products.length > 0 && product) {
      let productsCopy = products.filter(
        (item) => product.category === item.category && item._id !== id
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products, product, id]);

  useEffect(() => {
    setThumbnail(product?.image?.[0] || null);
  }, [product]);

  const qtyInCart = cartItems?.[product?._id] || 0;
  const ratingNum = Number(product?.rating || 0);
  const roundedRating = Math.round(ratingNum);

  return (
    product && (
      <div className="mt-12">
        <p>
          <Link to={"/"}>Home</Link> /<Link to={"/products"}> Products</Link> /
          <Link to={`/products/${product.category.toLowerCase()}`}>
            {" "}
            {product.category}
          </Link>{" "}
          /<span className="text-primary"> {product.name}</span>
        </p>

        <div className="flex flex-col md:flex-row gap-16 mt-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-3">
              {product.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setThumbnail(image)}
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>

            <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
              <img
                src={thumbnail}
                alt="Selected product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-sm w-full md:w-1/2">
            <h1 className="text-3xl font-medium">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <GrStar
                    key={i}
                    size={18}
                    className={
                      i < roundedRating ? "text-primary" : "text-primary/30"
                    }
                  />
                ))}
              <p className="text-base ml-2">({ratingNum})</p>
            </div>

            {/* Prices */}
            <div className="mt-6">
              <p className="text-gray-500/70 line-through">
                MRP: {currency}
                {product.price}
              </p>
              <p className="text-2xl font-medium">
                MRP: {currency}
                {product.offerPrice}
              </p>
              <span className="text-gray-500/70">(inclusive of all taxes)</span>
            </div>

            {/* About */}
            <p className="text-base font-medium mt-6">About Product</p>
            <ul className="list-disc ml-4 text-gray-500/70">
              {product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>

            {/* Cart Controls */}
            <div className="flex items-center mt-10 gap-4 text-base">
              {qtyInCart === 0 ? (
                <button
                  onClick={() => addToCart(product._id)}
                  className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="w-full flex   items-center gap-4">
                  {/* qty control - same size as button */}
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

                  {/* go to cart - same size as control */}
                  <button
                    onClick={() => {
                      navigate("/cart");
                      scrollTo(0, 0);
                    }}
                    className="w-full py-3.5 cursor-pointer font-medium   bg-primary text-white rounded hover:bg-primary-dull transition"
                  >
                    Go to Cart
                  </button>
                </div>
              )}

              {/* Buy Now (ensure at least 1 in cart) */}
              {qtyInCart === 0 && (
                <button
                  onClick={() => {
                    addToCart(product._id);
                    navigate("/cart");
                    scrollTo(0, 0);
                  }}
                  className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition"
                >
                  Buy now
                </button>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full ">
            {relatedProducts
              .filter((rp) => rp.inStock)
              .map((rp) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
          </div>
          <button
            onClick={() => {
              navigate("/products");
              scrollTo(0, 0);
            }}
            className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
          >
            See more
          </button>
        </div>
      </div>
    )
  );
};

export default ProductDetails;
