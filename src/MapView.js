import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import foodbankIconImg from "./assets/foodbank.png";
import dropboxIconImg from "./assets/dropbox.png";

import foodbankData from "./foodbank.json";
import dropboxesData from "./dropboxes.json";

// --- ICON SETUP ---
const foodbankIcon = L.icon({
  iconUrl: foodbankIconImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const dropboxIcon = L.icon({
  iconUrl: dropboxIconImg,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MAPBOX_TOKEN = "pk.eyJ1IjoibWNpbGE3NzQiLCJhIjoiY21lZGxlcGd5MDgwODJqbXNxbzJ3MmZwaiJ9.RLjL-6U0jlIEdcOZhrv5pg";

const MapView = () => {
  const foodbankPosition =
    foodbankData && foodbankData.length > 0
      ? [foodbankData[0].latitude, foodbankData[0].longitude]
      : [-45.874, 170.503]; // fallback

  const [routes, setRoutes] = useState([]);

  // Fetch routes from Mapbox Directions API
  useEffect(() => {
    const fetchRoutes = async () => {
      const newRoutes = [];
      for (let d of dropboxesData) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${foodbankPosition[1]},${foodbankPosition[0]};${d.longitude},${d.latitude}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // coordinates are [lng, lat] from Mapbox
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            newRoutes.push(coords);
          }
        } catch (err) {
          console.error("Error fetching route:", err);
        }
      }
      setRoutes(newRoutes);
    };

    fetchRoutes();
  }, [foodbankPosition]);

  return (
    <MapContainer center={foodbankPosition} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
        id="mapbox/navigation-night-v1"
        tileSize={512}
        zoomOffset={-1}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />

      {/* Foodbank Marker */}
      {foodbankData.length > 0 && (
        <Marker position={foodbankPosition} icon={foodbankIcon}>
          <Popup>{foodbankData[0].name || "Foodbank"}</Popup>
        </Marker>
      )}

      {/* Dropboxes Markers */}
      {dropboxesData.map((d, idx) => (
        <Marker key={idx} position={[d.latitude, d.longitude]} icon={dropboxIcon}>
          <Popup>{d.name || `Dropbox ${idx + 1}`}</Popup>
        </Marker>
      ))}

      {/* Polylines for Routes */}
      {routes.map((coords, idx) => (
        <Polyline key={idx} positions={coords} color="#00FFFF" weight={3} />
      ))}
    </MapContainer>
  );
};

export default MapView;
