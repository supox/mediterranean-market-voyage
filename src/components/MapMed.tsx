
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
  country?: string; // ship position (optional in destination picker context)
  selectedCountry?: string; // which country is selected as destination
  disabledCountries?: string[]; // can't pick these
  onSelectCountry?: (country: string) => void; // for clicking countries
  highlightCurrent?: boolean; // highlight the ship/country
}

const MapMed: React.FC<MapMedProps> = ({
  country,
  selectedCountry,
  disabledCountries = [],
  onSelectCountry,
  highlightCurrent = true,
}) => {
  // Position of ship if a country is provided
  const ship = country ? LOCATIONS[country] : null;

  return (
    <div className="w-full flex justify-center my-2">
      <svg 
        viewBox="0 0 500 280" 
        className="rounded-xl shadow-lg border bg-cyan-900 max-w-full h-56 cursor-pointer"
        style={{ background: "#034694" }}
      >
        {/* Sea (background) */}
        <rect x="0" y="0" width="500" height="280" fill="#034694" />
        {/* Land masses (blocky retro style) */}
        <polygon points="0,260 0,0 230,0 230,40 60,40 60,100 0,100" fill="#1a7f20" opacity="0.95"/> {/* Left land (Africa/Egypt)*/}
        <polygon points="230,0 500,0 500,45 300,45 230,40" fill="#b3691b" opacity="0.97"/> {/* Top land */}
        <polygon points="0,260 120,260 120,210 70,210 70,130 0,100" fill="#1a7f20" opacity="0.98"/> {/* Bottom left */}
        {/* Israel block */}
        <rect x="410" y="120" width="90" height="125" fill="#c22121" opacity="0.95"/>
        {/* Islands */}
        <ellipse cx="285" cy="120" rx="40" ry="12" fill="#efe995" opacity="0.93"/>
        <ellipse cx="105" cy="70" rx="45" ry="15" fill="#efe995" opacity="0.93"/>

        {/* Country Labels as interactive markers */}
        {Object.entries(LOCATIONS).map(([name, { x, y }]) => {
          const isSelected = selectedCountry === name;
          const isDisabled = disabledCountries.includes(name);
          const isCurrent = country === name;
          const markerColor = isSelected
            ? "#4299e1"
            : isCurrent && highlightCurrent
              ? "#16a34a"
              : "#fff9";

          return (
            <g
              key={name}
              style={{ cursor: isDisabled ? "not-allowed" : (onSelectCountry ? "pointer" : "default"), opacity: isDisabled ? 0.43 : 1 }}
              onClick={() => {
                if (isDisabled || !onSelectCountry) return;
                onSelectCountry(name);
              }}
              tabIndex={onSelectCountry && !isDisabled ? 0 : undefined}
              aria-label={name}
            >
              <circle
                cx={x}
                cy={y}
                r="13"
                fill={markerColor}
                stroke={isSelected ? "#2563eb" : "#0a2540"}
                strokeWidth={isSelected ? 4 : 2}
                style={{
                  filter: isSelected
                    ? "drop-shadow(0 0 6px #2563eb44)"
                    : isCurrent && highlightCurrent
                      ? "drop-shadow(0 0 8px #16a34a33)"
                      : "none"
                }}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="15"
                fontWeight="bold"
                fill="#033"
                style={{ dominantBaseline: 'middle', pointerEvents: "none" }}
              >
                {FLAG[name]}
              </text>
              <text
                x={x}
                y={y + 26}
                textAnchor="middle"
                fontSize="11"
                fill="#e0e0e0"
                style={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  pointerEvents: "none",
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Ship marker (for main map usage, not destination picker) */}
        {ship && (
          <g>
            <circle cx={ship.x} cy={ship.y - 16} r={18} fill="#e9fbf5CC" opacity={0.55} />
            <foreignObject x={ship.x - 13} y={ship.y - 33} width="26" height="26">
              <div className="flex justify-center items-center w-full h-full">
                <Ship size={23} color="#2662a9" style={{ strokeWidth: 2.5 }} />
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
};

export default MapMed;
