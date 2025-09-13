// src/components/MapPicker.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons in Vite/CRA bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Simple Nominatim reverse geocode (OpenStreetMap, free)
// NOTE: Be gentle with requests. Consider debouncing if you add more calls.
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=en&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error("Reverse geocode failed");
  return resp.json();
}


function DraggableMarker({ position, setPosition, onAddress }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      handleLookup(e.latlng.lat, e.latlng.lng);
    },
  });

  async function handleLookup(lat, lng) {
    try {
      const data = await reverseGeocode(lat, lng);
      const a = data.address || {};
      onAddress({
        street: [a.house_number, a.road].filter(Boolean).join(" ") || "",
        city: a.city || a.town || a.village || "",
        state: a.state || "",
        zipcode: a.postcode || "",
        country: a.country || "",
        _full: data.display_name || "",
        _lat: lat,
        _lng: lng,
      });
    } catch (e) {
      // optionally toast an error
    }
  }

  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: async () => {
          const latlng = markerRef.current.getLatLng();
          setPosition(latlng);
          await handleLookup(latlng.lat, latlng.lng);
        },
      }}
    />
  );
}

export default function MapPicker({
  defaultCenter = { lat: 13.0827, lng: 80.2707 }, // Chennai default
  onChange,
  height = 320,
}) {
  const [position, setPosition] = useState(defaultCenter);

  // Optional: center on current location
  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  // On mount, reverse-geocode once from default center
  useEffect(() => {
    (async () => {
      try {
        const data = await reverseGeocode(position.lat, position.lng);
        const a = data.address || {};
        onChange?.({
          street: [a.house_number, a.road].filter(Boolean).join(" ") || "",
          city: a.city || a.town || a.village || "",
          state: a.state || "",
          zipcode: a.postcode || "",
          country: a.country || "",
          _full: data.display_name || "",
          _lat: position.lat,
          _lng: position.lng,
        });
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">
          Pin your location (drag the marker or click on the map)
        </p>
        <button
          type="button"
          onClick={locate}
          className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
        >
          Use my location
        </button>
      </div>

      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        className="w-full rounded-xl border border-gray-200 shadow-sm"
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker
          position={position}
          setPosition={setPosition}
          onAddress={(addr) => onChange?.(addr)}
        />
      </MapContainer>
    </div>
  );
}
