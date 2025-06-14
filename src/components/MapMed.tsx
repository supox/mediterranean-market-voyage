
import React from "react";
import { Ship } from "lucide-react";

// Map coordinates for each country (relative to this map image, manually adjusted)
const LOCATIONS: Record<string, { x: number; y: number }> = {
  Turkey:  { x: 395, y: 80 },
  Greece:  { x: 68, y: 82 },
  Cyprus:  { x: 287, y: 168 },
  Israel:  { x: 347, y: 236 },
  Egypt:   { x: 163, y: 303 },
};

const FLAG = {
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Cyprus: "🇨🇾",
  Israel: "🇮🇱",
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
      <div className="relative rounded-xl shadow-lg border bg-cyan-900 max-w-full h-56 aspect-[500/380] overflow-hidden" style={{ width: 500, height: 380 }}>
        {/* Background map image */}
        <img
          src="/lovable-uploads/65af5864-7834-4eda-8f8c-a0f7e4772f3d.png"
          alt="Mediterranean map"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 0,
            pointerEvents: "none",
            userSelect: "none",
          }}
          draggable={false}
        />
        {/* SVG overlays for interaction */}
        <svg
          width={500}
          height={380}
          viewBox="0 0 500 380"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
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
              <g key={name}
                style={{
                  cursor: isDisabled ? "not-allowed" : (onSelectCountry ? "pointer" : "default"),
                  opacity: isDisabled ? 0.43 : 1,
                  pointerEvents: "auto"
                }}
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
                  r="17"
                  fill={markerColor}
                  stroke={isSelected ? "#2563eb" : "#0a2540"}
                  strokeWidth={isSelected ? 4 : 2}
                  style={{
                    filter: isSelected
                      ? "drop-shadow(0 0 6px #2563eb66)"
                      : isCurrent && highlightCurrent
                        ? "drop-shadow(0 0 8px #16a34a66)"
                        : "none"
                  }}
                />
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="bold"
                  fill="#033"
                  style={{ dominantBaseline: 'middle', pointerEvents: "none" }}
                >
                  {FLAG[name]}
                </text>
                <text
                  x={x}
                  y={y + 35}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#2d3748"
                  style={{
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    pointerEvents: "none",
                    opacity: isDisabled ? 0.4 : 1,
                    textShadow: "1px 1px 3px #fff8, 0px 0px 6px #fff8"
                  }}
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* Ship marker */}
          {ship && (
            <g>
              <circle cx={ship.x} cy={ship.y - 21} r={23} fill="#e9fbf5CC" opacity={0.54} />
              <foreignObject x={ship.x - 17} y={ship.y - 38} width="34" height="34">
                <div className="flex justify-center items-center w-full h-full">
                  <Ship size={28} color="#2662a9" style={{ strokeWidth: 2.5 }} />
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default MapMed;
