
import React from "react";
import { LOCATIONS, FLAG } from "@/utils/mapConfig";
import MapShip from "./MapShip";

// Hebrew country names
const COUNTRY_LABELS: Record<string, string> = {
  Turkey: "טורקיה",
  Israel: "ישראל",
  Egypt: "מצרים",
};

type MapCurrentShipProps = {
  country: string;
  onClick?: () => void;
};

const MapCurrentShip: React.FC<MapCurrentShipProps> = ({ country, onClick }) => {
  return (
    <div className="w-full flex justify-center my-4 animate-fade-in">
      <div
        className={`relative rounded-xl shadow-lg border bg-cyan-900 max-w-full h-56 aspect-[500/380] overflow-hidden transition ring-2 ring-transparent hover:ring-blue-400 cursor-pointer`}
        style={{ width: 500, height: 380 }}
        onClick={onClick}
        tabIndex={0}
        aria-label="Go to Sail"
        role="button"
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <img
          src="/lovable-uploads/460ee089-eb39-4153-a1ef-63e3e97094e9.png"
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
            const isCurrent = country === name;
            return (
              <g key={name}
                style={{
                  opacity: isCurrent ? 1 : 0.64,
                  pointerEvents: "none"
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="17"
                  fill={isCurrent ? "#16a34a" : "#fff9"}
                  stroke={isCurrent ? "#176e34" : "#0a2540"}
                  strokeWidth={isCurrent ? 4 : 2}
                  style={{
                    filter: isCurrent ? "drop-shadow(0 0 8px #16a34a66)" : "none"
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
                    opacity: isCurrent ? 1 : 0.4,
                    textShadow: "1px 1px 3px #fff8, 0px 0px 6px #fff8"
                  }}
                >
                  {COUNTRY_LABELS[name] ?? name}
                </text>
              </g>
            );
          })}
          {country && LOCATIONS[country] && (
            <MapShip from={country} to={country} animProgress={0} />
          )}
        </svg>
      </div>
    </div>
  );
};

export default MapCurrentShip;
