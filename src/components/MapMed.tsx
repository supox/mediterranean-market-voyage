
import React from "react";
import { Ship } from "lucide-react";

// Map coordinates for each country (relative to SVG viewBox)
const LOCATIONS: Record<string, { x: number; y: number }> = {
  Israel:  { x: 400, y: 170 },
  Turkey:  { x: 260, y: 45 },
  Greece:  { x: 60,  y: 70 },
  Cyprus:  { x: 270, y: 115 },
  Egypt:   { x: 110, y: 230 },
};

const FLAG = {
  Israel: "🇮🇱",
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Cyprus: "🇨🇾",
  Egypt: "🇪🇬",
};

interface MapMedProps {
  country: string;
}

const MapMed: React.FC<MapMedProps> = ({ country }) => {
  // Ship position
  const ship = LOCATIONS[country] || LOCATIONS["Israel"];

  return (
    <div className="w-full flex justify-center my-6">
      <svg 
        viewBox="0 0 500 280" 
        className="rounded-xl shadow-lg border bg-cyan-900 max-w-full h-56"
        style={{ background: "#034694" }}
      >
        {/* Sea (background) */}
        <rect x="0" y="0" width="500" height="280" fill="#034694" />
        {/* Land masses (blocky retro style) */}
        <polygon points="0,260 0,0 230,0 230,40 60,40 60,100 0,100" fill="#1a7f20" opacity="0.95"/> {/* Left land (Africa/Egypt) */}
        <polygon points="230,0 500,0 500,45 300,45 230,40" fill="#b3691b" opacity="0.97"/> {/* Top land (Turkey/Asia Minor) */}
        <polygon points="0,260 120,260 120,210 70,210 70,130 0,100" fill="#1a7f20" opacity="0.98"/> {/* Bottom left (Egypt cont) */}
        {/* Israel block */}
        <rect x="410" y="120" width="90" height="125" fill="#c22121" opacity="0.95"/>
        {/* Islands */}
        <ellipse cx="285" cy="120" rx="40" ry="12" fill="#efe995" opacity="0.93"/> {/* Cyprus */}
        <ellipse cx="105" cy="70" rx="45" ry="15" fill="#efe995" opacity="0.93"/> {/* Crete/Greece */}
        
        {/* Country Labels */}
        {Object.entries(LOCATIONS).map(([name, { x, y }]) => (
          <g key={name}>
            <circle cx={x} cy={y} r="13" fill="#fff9" stroke="#0a2540" strokeWidth={2} />
            <text 
              x={x} y={y+4} textAnchor="middle" fontSize="15" fontWeight="bold"
              fill="#033" style={{ dominantBaseline: 'middle' }}
            >
              {FLAG[name]}
            </text>
            <text
              x={x} y={y+26}
              textAnchor="middle" fontSize="11" fill="#e0e0e0" style={{ fontWeight: 600, letterSpacing: 0.2 }}>
              {name}
            </text>
          </g>
        ))}
        
        {/* Ship marker */}
        <g>
          <circle cx={ship.x} cy={ship.y - 16} r={18} fill="#e9fbf5CC" opacity={0.55} />
          <foreignObject x={ship.x - 13} y={ship.y - 33} width="26" height="26">
            <div className="flex justify-center items-center w-full h-full">
              <Ship size={23} color="#2662a9" style={{strokeWidth:2.5}} />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );
};

export default MapMed;
