// ProductList.jsx
import React, { useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import toast from "react-hot-toast";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import ConfirmDialog from "@/component/ConfirmDialog";
import Modal from "@/component/Modal";
import { assets } from "@/assets/assets";
import { RiImageEditFill, RiDeleteBin2Fill, RiImageAddFill  } from "react-icons/ri";

const ProductList = () => {
  const {
    products,
    currency,
    axios,
    fetchProducts,
    deleteProduct,
    updateProduct,
  } = useAppContext();

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  const [existingSlots, setExistingSlots] = useState([null, null, null, null]); // [{url, publicId}|null]
  const [newImages, setNewImages] = useState([null, null, null, null]); // [File|null]

  const getImgSrc = (product) => {
    const first = product?.image?.[0];
    return typeof first === "object" && first !== null ? first.url : first;
  };

  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.put(API_PATHS.PRODUCT.CHANGE_STOCK, {
        id,
        inStock,
      });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete handlers
  const onDeleteClick = (product) => {
    setTargetProduct(product);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (targetProduct?._id) await deleteProduct(targetProduct._id);
    setConfirmOpen(false);
    setTargetProduct(null);
  };

  // Edit handlers
  const onEditClick = (product) => {
    setDraft({
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      offerPrice: product.offerPrice,
      inStock: product.inStock,
      rating: product.rating,
      description: Array.isArray(product.description)
        ? product.description.join("\n")
        : "",
    });
    const toObj = (val) =>
      typeof val === "object" && val !== null
        ? val
        : val
        ? { url: String(val), publicId: null }
        : null;

    const slots = [0, 1, 2, 3].map((i) => toObj(product.image?.[i]));
    setExistingSlots(slots);
    setNewImages([null, null, null, null]);

    setNewImages([]);
    setEditOpen(true);
  };

 const handleEditSave = async () => {
  if (!draft?._id) return;

  const payload = {
    name: draft.name,
    category: draft.category,
    price: Number(draft.price || 0),
    offerPrice: Number(draft.offerPrice || 0),
    inStock: !!draft.inStock,
    rating: Number(draft.rating || 1),
    description: (draft.description || "")
      .split("\n").map(s => s.trim()).filter(Boolean),
  };

  const files = newImages.filter(Boolean); // new files only
  const keepExisting = existingSlots.filter(Boolean); // keep these

  // Enforce max 4 before sending
  if (keepExisting.length + files.length > 4) {
    toast.error("Maximum 4 images allowed");
    return;
  }

  // NOTE: updateProduct will accept `existingImages` via FormData
  const ok = await updateProduct(draft._id, payload, files, keepExisting);
  if (ok) setEditOpen(false);
};


  const hasProducts = useMemo(() => (products || []).length > 0, [products]);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-7xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Actual Price
                </th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
                <th className="px-4 py-3 font-semibold truncate text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product) => (
                <tr key={product._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <img
                        src={getImgSrc(product)}
                        alt={product.name}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell line-through text-gray-400">
                    {currency}
                    {product.price}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {currency}
                    {product.offerPrice}
                  </td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        checked={product.inStock}
                        onChange={() =>
                          toggleStock(product._id, !product.inStock)
                        }
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3  items-center justify-center">
                      <button
                        onClick={() => onEditClick(product)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                        title="Edit product"
                      >
                        <FiEdit2 />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(product)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                        title="Delete product"
                      >
                        <FiTrash2 />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!hasProducts && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete product?"
        message={
          targetProduct
            ? `This will permanently remove "${targetProduct.name}".\nThis action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit product"
        size="md"
        actions={
          <div className="flex items-center justify-between gap-4 w-full">
            <button
              type="button"
              className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full md:w-36 h-10 rounded-md text-white bg-blue-600 font-medium text-sm hover:bg-blue-700 active:scale-95 transition"
              onClick={handleEditSave}
            >
              Save
            </button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Category
                </label>
                <input
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, category: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Actual Price
                </label>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={draft.offerPrice}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, offerPrice: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2  flex flex-row items-center justify-center gap-3 ">
              <div className="w-1/2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={draft.inStock}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, inStock: e.target.checked }))
                    }
                    />
                  In Stock
                </label>
                    </div>
                 <div className="  w-1/2">
                <label className="block text-sm text-gray-700 mb-1">
                  Rating (1–5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={draft.rating}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, rating: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              </div>
             
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Description (one point per line)
                </label>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>


          {/* Images: max 4, show existing, allow replace/remove per slot */}
<div>
  <label className="block text-sm text-gray-700 mb-2">Images (max 4)</label>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[0,1,2,3].map((index) => {
      const file = newImages[index];
      const existing = existingSlots[index];
      const previewSrc = file
        ? URL.createObjectURL(file)
        : existing?.url || assets.upload_area;

      const handlePick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setNewImages(prev => {
          const arr = [...prev];
          arr[index] = f;
          return arr;
        });
      };

      const handleClear = () => {
        // Clear this slot: remove new file and existing image
        setNewImages(prev => {
          const arr = [...prev]; arr[index] = null; return arr;
        });
        setExistingSlots(prev => {
          const arr = [...prev]; arr[index] = null; return arr;
        });
      };

      return (
        <div key={index} className="flex flex-col items-center gap-2">
          <label htmlFor={`image${index}`} className="cursor-pointer">
            <input
              id={`image${index}`}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePick}
            />
            <img
              className="h-24 w-24 object-cover rounded-md border border-gray-200 hover:opacity-90"
              src={previewSrc}
              alt={`slot-${index}`}
              width={96}
              height={96}
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => document.getElementById(`image${index}`).click()}
              className="px-2 py-1 text-xs text-blue-500 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              {file || existing ? <RiImageEditFill size={20}/>: <RiImageAddFill size={20} className=" text-lime-500"/> }
            </button>
            {(file || existing) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50"
              >
                <RiDeleteBin2Fill size={20} className=" text-red-400"/>
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>

  <p className="text-xs text-gray-500 mt-2">
    Only 4 images max. Replacing or removing a slot updates that image.
  </p>
</div>


            
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
