// src/pages/AddAddress.jsx
import { useAppContext } from "@/context/AppContext";
import { API_PATHS } from "@/utils/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MapPicker from "./MapPicker";

const InputFiled = ({ type, placeholder, name, handleChange, address }) => (
  <input
    className="w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-700 placeholder:text-gray-400 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name] ?? ""}
    required
  />
);

const AddAddress = () => {
  const { axios, user, navigate } = useAppContext();

  const [address, setAddresses] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    _lat: null,
    _lng: null,
    _full: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddresses((prev) => ({ ...prev, [name]: value }));
  };

  // Called by MapPicker when user sets/drag pin
// Called by MapPicker when user sets/drag pin
const handleMapAddress = (a) => {
  setAddresses((prev) => ({
    ...prev,
    // new map values take precedence; fall back to previous if missing
    street: a.street || prev.street,
    city: a.city || prev.city,
    state: a.state || prev.state,
    zipcode: a.zipcode || prev.zipcode,
    country: a.country || prev.country,
    _lat: a._lat,
    _lng: a._lng,
    _full: a._full,
  }));
};


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(API_PATHS.ADDRESS.ADD, { address });
      if (data?.success) {
        toast.success(data.message || "Address saved");
        navigate("/cart");
      } else {
        toast.error(data?.message || "Failed to save address");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!user) navigate("/cart");
  }, [user, navigate]);

  return (
    <div className="mt-16 pb-16">
      <p className="text-2xl md:text-3xl text-gray-600">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-10 gap-8">
        {/* LEFT: Form */}
        <div className="flex-1 max-w-md">
          <form className="space-y-3 mt-6 text-sm" onSubmit={onSubmitHandler}>
            <div className="grid grid-cols-2 gap-4">
              <InputFiled name="firstName" type="text" placeholder="First Name" handleChange={handleChange} address={address} />
              <InputFiled name="lastName" type="text" placeholder="Last Name" handleChange={handleChange} address={address} />
            </div>

            <InputFiled name="email" type="email" placeholder="Email address" handleChange={handleChange} address={address} />
            <InputFiled name="street" type="text" placeholder="Street" handleChange={handleChange} address={address} />

            <div className="grid grid-cols-2 gap-4">
              <InputFiled name="city" type="text" placeholder="City" handleChange={handleChange} address={address} />
              <InputFiled name="state" type="text" placeholder="State" handleChange={handleChange} address={address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputFiled name="zipcode" type="text" placeholder="Zipcode" handleChange={handleChange} address={address} />
              <InputFiled name="country" type="text" placeholder="Country" handleChange={handleChange} address={address} />
            </div>

            <InputFiled name="phone" type="text" placeholder="Phone" handleChange={handleChange} address={address} />

            {/* Hidden fields if you want to store lat/lng in backend */}
            <input type="hidden" name="_lat" value={address._lat ?? ""} readOnly />
            <input type="hidden" name="_lng" value={address._lng ?? ""} readOnly />
            <input type="hidden" name="_full" value={address._full ?? ""} readOnly />

            {address._full && (
              <p className="text-xs text-gray-500">Selected: {address._full}</p>
            )}

            <button className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase">
              Save address
            </button>
          </form>
        </div>

        {/* RIGHT: Map picker */}
        <div className="flex-1 md:mr-16 mb-16 md:mt-0">
          <MapPicker onChange={handleMapAddress} />
        </div>
      </div>
    </div>
  );
};

export default AddAddress;
