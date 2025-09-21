import React from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";

// Define multiple areas (30+). Colors represent importance
const areas: {
  name: string;
  color: string;
  coordinates: LatLngExpression[];
}[] = [
  // High importance
  { name: "Delhi", color: "red", coordinates: [[28.70, 77.10],[28.70, 77.30],[28.90, 77.30],[28.90, 77.10]] },
  { name: "Mumbai", color: "orange", coordinates: [[18.92, 72.78],[18.92, 72.88],[19.00, 72.88],[19.00, 72.78]] },
  { name: "Kolkata", color: "green", coordinates: [[22.50, 88.30],[22.50, 88.45],[22.65, 88.45],[22.65, 88.30]] },
  { name: "Bangalore", color: "grey", coordinates: [[12.90, 77.50],[12.90, 77.65],[13.05, 77.65],[13.05, 77.50]] },

  // Cluster of 4 nearby locations (Punjab)
  { name: "Amritsar", color: "red", coordinates: [[31.63, 74.85],[31.63, 74.95],[31.73, 74.95],[31.73, 74.85]] },
  { name: "Jalandhar", color: "red", coordinates: [[31.32, 75.55],[31.32, 75.65],[31.42, 75.65],[31.42, 75.55]] },
  { name: "Ludhiana", color: "orange", coordinates: [[30.88, 75.80],[30.88, 75.90],[30.98, 75.90],[30.98, 75.80]] },
  { name: "Patiala", color: "green", coordinates: [[30.31, 76.36],[30.31, 76.46],[30.41, 76.46],[30.41, 76.36]] },

  // Other major cities
  { name: "Chennai", color: "orange", coordinates: [[13.05, 80.25],[13.05, 80.35],[13.15, 80.35],[13.15, 80.25]] },
  { name: "Hyderabad", color: "green", coordinates: [[17.38, 78.40],[17.38, 78.50],[17.48, 78.50],[17.48, 78.40]] },
  { name: "Pune", color: "orange", coordinates: [[18.50, 73.80],[18.50, 73.90],[18.60, 73.90],[18.60, 73.80]] },
  { name: "Ahmedabad", color: "green", coordinates: [[23.00, 72.55],[23.00, 72.65],[23.10, 72.65],[23.10, 72.55]] },
  { name: "Surat", color: "orange", coordinates: [[21.18, 72.78],[21.18, 72.88],[21.28, 72.88],[21.28, 72.78]] },
  { name: "Jaipur", color: "red", coordinates: [[26.90, 75.75],[26.90, 75.85],[27.00, 75.85],[27.00, 75.75]] },
  { name: "Lucknow", color: "green", coordinates: [[26.80, 80.90],[26.80, 81.00],[26.90, 81.00],[26.90, 80.90]] },
  { name: "Kanpur", color: "orange", coordinates: [[26.45, 80.30],[26.45, 80.40],[26.55, 80.40],[26.55, 80.30]] },
  { name: "Nagpur", color: "green", coordinates: [[21.14, 79.05],[21.14, 79.15],[21.24, 79.15],[21.24, 79.05]] },
  { name: "Bhopal", color: "orange", coordinates: [[23.25, 77.40],[23.25, 77.50],[23.35, 77.50],[23.35, 77.40]] },
  { name: "Indore", color: "green", coordinates: [[22.70, 75.85],[22.70, 75.95],[22.80, 75.95],[22.80, 75.85]] },
  { name: "Patna", color: "red", coordinates: [[25.60, 85.10],[25.60, 85.20],[25.70, 85.20],[25.70, 85.10]] },
  { name: "Raipur", color: "orange", coordinates: [[21.23, 81.63],[21.23, 81.73],[21.33, 81.73],[21.33, 81.63]] },
  { name: "Guwahati", color: "green", coordinates: [[26.18, 91.74],[26.18, 91.84],[26.28, 91.84],[26.28, 91.74]] },
  { name: "Thiruvananthapuram", color: "grey", coordinates: [[8.48, 76.90],[8.48, 77.00],[8.58, 77.00],[8.58, 76.90]] },
  { name: "Kochi", color: "orange", coordinates: [[9.95, 76.25],[9.95, 76.35],[10.05, 76.35],[10.05, 76.25]] },
  { name: "Kozhikode", color: "green", coordinates: [[11.25, 75.75],[11.25, 75.85],[11.35, 75.85],[11.35, 75.75]] },
  { name: "Visakhapatnam", color: "orange", coordinates: [[17.70, 83.25],[17.70, 83.35],[17.80, 83.35],[17.80, 83.25]] },
  { name: "Vijayawada", color: "green", coordinates: [[16.50, 80.60],[16.50, 80.70],[16.60, 80.70],[16.60, 80.60]] },
  { name: "Coimbatore", color: "orange", coordinates: [[11.00, 76.95],[11.00, 77.05],[11.10, 77.05],[11.10, 76.95]] },
  { name: "Madurai", color: "green", coordinates: [[9.90, 78.10],[9.90, 78.20],[10.00, 78.20],[10.00, 78.10]] },
  { name: "Mysore", color: "red", coordinates: [[12.30, 76.60],[12.30, 76.70],[12.40, 76.70],[12.40, 76.60]] },
  { name: "Agra", color: "orange", coordinates: [[27.15, 78.00],[27.15, 78.10],[27.25, 78.10],[27.25, 78.00]] },
  { name: "Varanasi", color: "red", coordinates: [[25.30, 82.95],[25.30, 83.05],[25.40, 83.05],[25.40, 82.95]] },
  { name: "Dehradun", color: "grey", coordinates: [[30.31, 78.03],[30.31, 78.13],[30.41, 78.13],[30.41, 78.03]] },
];

// India bounds to restrict map
const indiaBounds: LatLngExpression[] = [
  [6.55, 68.11],   // SW
  [35.67, 97.40],  // NE
];

const legendItems = [
  { color: "red", label: "High Importance" },
  { color: "orange", label: "Medium Importance" },
  { color: "green", label: "Normal Importance" },
  { color: "grey", label: "Neutral / Other" },
];

const HeatmapAreas = () => {
  return (
    <div>
      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {areas.map((area, idx) => (
          <Polygon
            key={idx}
            positions={area.coordinates}
            pathOptions={{ color: area.color, fillOpacity: 0.5 }}
          />
        ))}
      </MapContainer>
       {/* Legend Container */}
       <div className="bg-white shadow-md rounded-lg p-4 max-w-lg mx-auto mt-6">
        <h2 className="text-xl font-bold mb-5 text-center">Map Legend</h2>
        <div className="grid grid-cols-2 gap-4 ">
          {legendItems.map((item) => (
            <div key={item.color} className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapAreas;
