import React, { useEffect, useRef, useState } from "react";
import { LOCATIONS, FLAG, getCurve } from "@/utils/mapConfig";
import MapShip from "./MapShip";

const MapMed = ({
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
    let lastElapsed = 0;

    function draw(now: number) {
      if (animateShip.paused) {
        shipAnimRef.current = requestAnimationFrame(draw);
        return;
      }
      const elapsed = now - start + lastElapsed;
      let p = Math.min(1, elapsed / animateShip.duration);
      setAnimProgress(p);
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

    function frame(now: number) {
      if (!animateShip.paused) {
        draw(now);
      } else {
        shipAnimRef.current = requestAnimationFrame(frame);
      }
    }

    if (animateShip.paused) {
      shipAnimRef.current = requestAnimationFrame(frame);
    } else {
      shipAnimRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
      shipAnimRef.current = null;
    };
  }, [
    animateShip?.from,
    animateShip?.to,
    animateShip?.duration,
    animateShip?.risk,
    animateShip?.paused,
  ]);

  return (
    <div className="w-full flex justify-center my-2">
      <div className="relative rounded-xl shadow-lg border bg-cyan-900 max-w-full h-56 aspect-[500/380] overflow-hidden" style={{ width: 500, height: 380 }}>
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
          {animateShip &&
            <path
              d={getCurve(LOCATIONS[animateShip.from], LOCATIONS[animateShip.to])}
              stroke="#2563eb"
              strokeWidth={3.5}
              fill="none"
              strokeDasharray="8 6"
              opacity={0.7}
              style={{ filter: "drop-shadow(0 0 8px #38bdf855)" }}
            />
          }
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
          {animateShip ?
            <MapShip from={animateShip.from} to={animateShip.to} animProgress={animProgress} />
            : (country && LOCATIONS[country] && (
              <MapShip from={country} to={country} animProgress={0} />
            ))}
        </svg>
      </div>
    </div>
  );
};

export default MapMed;
