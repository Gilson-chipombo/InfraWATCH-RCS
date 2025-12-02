import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  iconUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  shadowUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
});

const Mapa = ({ className }: { className: string }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [layerType, setLayerType] = useState<"light" | "dark" | "satellite">("light");
  const { theme } = useTheme();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Erro ao obter localização", error);
          setPosition([51.505, -0.09]);
        }
      );
    } else {
      console.log("Geolocalização não suportada");
      setPosition([51.505, -0.09]);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      setLayerType("dark");
    } else {
      setLayerType("light");
    }
  }, [theme]);

  if (!position) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setLayerType("light")}
          className={`px-3 py-1 rounded bg-white text-black shadow ${
            layerType === "light" ? "font-bold border border-black" : ""
          }`}
        >
          Claro
        </button>
        <button
          onClick={() => setLayerType("dark")}
          className={`px-3 py-1 rounded bg-black text-white shadow ${
            layerType === "dark" ? "font-bold border border-white" : ""
          }`}
        >
          Escuro
        </button>
        <button
          onClick={() => setLayerType("satellite")}
          className={`px-3 py-1 rounded bg-gray-800 text-white shadow ${
            layerType === "satellite" ? "font-bold border border-white" : ""
          }`}
        >
          Satélite
        </button>
      </div>

      <MapContainer
        className={className}
        center={position}
        zoom={16}
        maxZoom={19}
        minZoom={3}
        doubleClickZoom={false}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        {layerType === "light" && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
        )}

        {layerType === "dark" && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
        )}

        {layerType === "satellite" && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; <a href="https://www.esri.com/">ESRI</a>'
          />
        )}

        <Marker
          position={position}
          icon={L.divIcon({
            html: '<div style="background-color: #4CAF50; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>',
            className: "custom-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>Este é o seu local atual!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Mapa;
