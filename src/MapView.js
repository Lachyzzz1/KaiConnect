import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import foodbankIconImg from "./assets/foodbank.png";
import dropboxIconImg from "./assets/dropbox.png";

import foodbank from "./foodbank.json";
import dropboxes from "./dropboxes.json";

// Fix the default marker icon
const foodbankIcon = L.icon({
  iconUrl: foodbankIconImg,
  iconSize: [32, 32],      // adjust size
  iconAnchor: [16, 32],    // point of the icon which corresponds to marker's location
  popupAnchor: [0, -32]    // point from which the popup should open relative to the iconAnchor
});

const dropboxIcon = L.icon({
  iconUrl: dropboxIconImg,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});


const MapView = () => {
  const foodbankPosition = [foodbank[0].latitude, foodbank[0].longitude];

  // Replace with *your* mapbox token
  const MAPBOX_TOKEN = "pk.eyJ1IjoibWNpbGE3NzQiLCJhIjoiY21lZGxlcGd5MDgwODJqbXNxbzJ3MmZwaiJ9.RLjL-6U0jlIEdcOZhrv5pg";

  return (
    <MapContainer center={foodbankPosition} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
        id="mapbox/streets-v12"
        tileSize={512}
        zoomOffset={-1}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      {/* Foodbank */}
      <Marker position={foodbankPosition} icon={foodbankIcon}>
        <Popup>{foodbank.name}</Popup>
      </Marker>

      {/* Dropboxes */}
      {dropboxes.map((d, idx) => (
        <Marker key={idx} position={[d.latitude, d.longitude]} icon={dropboxIcon}>
          <Popup>{d.name}</Popup>
        </Marker>
      ))}

      {/* Routes from foodbank to dropboxes */}
      {dropboxes.map((d, idx) => (
        <Polyline
          key={`route-${idx}`}
          positions={[foodbankPosition, [d.latitude, d.longitude]]}
          color="blue"
          weight={3}
          dashArray="5,5"
        />
      ))}
    </MapContainer>
  );
};

export default MapView;

