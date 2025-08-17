import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import foodbankIconImg from "./assets/foodbank.png";
import dropboxIconImg from "./assets/dropbox.png";
import userIconImg from "./assets/user.png";

import foodbankData from "./foodbank.json";
import dropboxesData from "./dropboxes.json";

// --- ICON SETUP ---
// Define custom icons for markers on the map
const foodbankIcon = L.icon({
  iconUrl: foodbankIconImg,
  iconSize: [32, 32],         //This is the size of the icon
  iconAnchor: [16, 32],       //This is the point of the icon that corresponds to the markers location
  popupAnchor: [0, -32],      //This is the position of the pop up relative to the icon
});

const dropboxIcon = L.icon({
  iconUrl: dropboxIconImg,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const userIcon = L.icon({
  iconUrl: userIconImg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

//define the color of the routes based on priority(low, medium, high)
const priorityColors = {
  1: "#00FFFF", // low priority color
  2: "#FFD700", // medium priority color
  3: "#FF0000"  // high priority color
};


const MAPBOX_TOKEN = "pk.eyJ1IjoibWNpbGE3NzQiLCJhIjoiY21lZGxlcGd5MDgwODJqbXNxbzJ3MmZwaiJ9.RLjL-6U0jlIEdcOZhrv5pg";

const MapView = () => {
  //gte the position of the foodbank
  const foodbankPosition =
    foodbankData && foodbankData.length > 0
      ? [foodbankData[0].latitude, foodbankData[0].longitude]
      : [-45.874, 170.503]; // fallback

  //state to store routes to dropboxes
  const [routes, setRoutes] = useState([]);
  //state to store the current users location
  const [userPosition, setUserPosition] = useState(null);
  //state to store the route from user to foodbank 
  const [userRoute, setUserRoute] = useState([]);

  // --- GET USER LOCATION ---
  //use the browsers geolocation API to get the user current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
        (err) => console.error("Error getting user location:", err)
      );
    }
  }, []);


  // --- FETCH ROUTES TO DROPBOXES ---
  //Use Mapbox Directions API to fetch driving routes from foodbank to each dropbox
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

  // --- FETCH USER ROUTE ---
  //Fetch route from users locaiton to the foodbank using Mapbox Directions API
  useEffect(() => {
    const fetchUserRoute = async () => {
      if (!userPosition) return;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userPosition[1]},${userPosition[0]};${foodbankPosition[1]},${foodbankPosition[0]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setUserRoute(coords);
        }
      } catch (err) {
        console.error("Error fetching user route:", err);
      }
    };
    fetchUserRoute();
  }, [userPosition, foodbankPosition]);

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
          <Tooltip permanent direction="top" offset={[0, -25]} className="tooltip-sm">
            {foodbankData[0].name}
          </Tooltip>
          <Popup>{foodbankData[0].name || "Foodbank"}</Popup>
        </Marker>
      )}

      {/* Dropboxes Markers */}
      {dropboxesData.map((d, idx) => (
        <Marker key={idx} position={[d.latitude, d.longitude]} icon={dropboxIcon}>
          <Tooltip permanent direction="top" offset={[0, -25]} className="tooltip-sm">
            {d.name}
          </Tooltip>
          <Popup>{d.name || `Dropbox ${idx + 1}`}</Popup>
        </Marker>
      ))}

      {/* User Marker */}
      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Tooltip permanent direction="top" offset={[0, -25]} className="tooltip-sm">
            You
          </Tooltip>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {/* User Route */}
      {userRoute.length > 0 && (
        <Polyline
          positions={userRoute}
          color="#FF00FF"
          weight={5}
          dashArray="8, 6"
        />
      )}



      {/* Polylines for Routes */}
      {routes.map((coords, idx) => {
        const dropbox = dropboxesData[idx];
        const color = priorityColors[dropbox.priority] || "#00FFFF"; // default cyan
        return <Polyline key={idx} positions={coords} color={color} weight={5} />;
      })}
    </MapContainer>
  );
};

export default MapView;
