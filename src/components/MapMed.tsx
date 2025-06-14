
import React, { useEffect, useRef, useState } from "react";
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

type AnimateShipProps = {
  from: string;
  to: string;
  duration: number; // ms 
  risk: string | null;
  onMidpoint: () => void;
  onAnimationEnd: () => void;
};

interface MapMedProps {
  country?: string; // ship position (optional in destination picker context)
  selectedCountry?: string; // which country is selected as destination
  disabledCountries?: string[]; // can't pick these
  onSelectCountry?: (country: string) => void; // for clicking countries
  highlightCurrent?: boolean; // highlight the ship/country
  // Animation
  animateShip?: AnimateShipProps;
}

function getCurve(from: {x:number, y:number}, to: {x:number, y:number}) {
  // Simple quadratic curve, control pt at midpoint pulled toward the sea center
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 55; // shifts midpoint up (to sea)
  return `M ${from.x} ${from.y} Q ${mx} ${my}, ${to.x} ${to.y}`;
}

const MapMed: React.FC<MapMedProps> = ({
  country,
  selectedCountry,
  disabledCountries = [],
  onSelectCountry,
  highlightCurrent = true,
  animateShip,
}) => {
  // Animate ship state
  const [animProgress, setAnimProgress] = useState(0); // 0-1
  const [midFired, setMidFired] = useState(false);
  const shipAnimRef = useRef<number | null>(null);

  // Start animation when animateShip is set:
  useEffect(() => {
    if (!animateShip) {
      setAnimProgress(0);
      setMidFired(false);
      if (shipAnimRef.current) {
        cancelAnimationFrame(shipAnimRef.current);
        shipAnimRef.current = null;
      }
      return;
    }
    setAnimProgress(0);
    setMidFired(false);
    let start = performance.now();
    function draw(now: number) {
      const elapsed = now - start;
      let p = Math.min(1, elapsed / animateShip.duration);
      setAnimProgress(p);
      // Fire midpoint event if needed
      if (!midFired && p >= 0.5) {
        if (animateShip.risk && animateShip.onMidpoint) animateShip.onMidpoint();
        setMidFired(true);
      }
      if (p < 1) {
        shipAnimRef.current = requestAnimationFrame(draw);
      } else {
        if (animateShip.onAnimationEnd) animateShip.onAnimationEnd();
        shipAnimRef.current = null;
      }
    }
    shipAnimRef.current = requestAnimationFrame(draw);
    return () => {
      if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
      shipAnimRef.current = null;
    };
    // eslint-disable-next-line
  }, [animateShip?.from, animateShip?.to, animateShip?.duration, animateShip?.risk]);

  // Find anim position
  let shipAnimPos: {x:number,y:number}|null = null;
  if (animateShip) {
    const src = LOCATIONS[animateShip.from];
    const dest = LOCATIONS[animateShip.to];
    if (src && dest) {
      // Interpolate along quadratic
      const mx = (src.x + dest.x) / 2;
      const my = (src.y + dest.y) / 2 - 55;
      // Quadratic Bézier parameterization
      const t = animProgress;
      const x = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * mx + t * t * dest.x;
      const y = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * my + t * t * dest.y;
      shipAnimPos = { x, y };
    }
  }

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
        {/* SVG overlays for interaction & animation */}
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
          {/* Travel curve for animation */}
          {animateShip && (
            <path
              d={getCurve(LOCATIONS[animateShip.from], LOCATIONS[animateShip.to])}
              stroke="#2563eb"
              strokeWidth={3.5}
              fill="none"
              strokeDasharray="8 6"
              opacity={0.7}
              style={{filter:"drop-shadow(0 0 8px #38bdf855)"}}
            />
          )}
          {/* Country markers */}
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
          {/* Animated ship */}
          {shipAnimPos ? (
            <g>
              <circle cx={shipAnimPos.x} cy={shipAnimPos.y - 21} r={23} fill="#e9fbf5CC" opacity={0.54} />
              <foreignObject x={shipAnimPos.x - 17} y={shipAnimPos.y - 38} width="34" height="34">
                <div className="flex justify-center items-center w-full h-full animate-pulse">
                  <Ship size={28} color="#2563eb" style={{ strokeWidth: 2.5 }} />
                </div>
              </foreignObject>
            </g>
          ) : (
            country && LOCATIONS[country] && (
              // Not animating, static ship at port
              <g>
                <circle cx={LOCATIONS[country].x} cy={LOCATIONS[country].y - 21} r={23} fill="#e9fbf5CC" opacity={0.54} />
                <foreignObject x={LOCATIONS[country].x - 17} y={LOCATIONS[country].y - 38} width="34" height="34">
                  <div className="flex justify-center items-center w-full h-full">
                    <Ship size={28} color="#2662a9" style={{ strokeWidth: 2.5 }} />
                  </div>
                </foreignObject>
              </g>
            )
          )}
        </svg>
      </div>
    </div>
  );
};

export default MapMed;
