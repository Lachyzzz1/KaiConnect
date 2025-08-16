import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const position = [-45.874, 170.503]; // Example starting point (Dunedin)

  // Replace with *your* mapbox token
  const MAPBOX_TOKEN = "pk.eyJ1IjoibWNpbGE3NzQiLCJhIjoiY21lZGxlcGd5MDgwODJqbXNxbzJ3MmZwaiJ9.RLjL-6U0jlIEdcOZhrv5pg";

  return (
    <MapContainer center={position} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
        id="mapbox/streets-v12"
        tileSize={512}
        zoomOffset={-1}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>Example drop box</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;

