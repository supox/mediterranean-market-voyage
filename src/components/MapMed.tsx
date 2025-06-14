import React, { useEffect, useRef, useState } from "react";
import { LOCATIONS, FLAG, getCurve } from "@/utils/mapConfig";
import MapShip from "./MapShip";

/** The MapMed component can work in two modes:
 * 1. Port-selection mode (sail modal), with interactive ports (props: country, selectedCountry, disabledCountries, onSelectCountry, highlightCurrent)
 * 2. Animation mode, for showing the sailing animation (props: animateShip + optional rest)
 */
type AnimationModeProps = {
  animateShip: {
    from: string;
    to: string;
    duration: number;
    risk?: string | null;
    paused?: boolean;
    onMidpoint?: () => void;
    onAnimationEnd?: () => void;
  };
  country?: never;
  selectedCountry?: never;
  disabledCountries?: never;
  onSelectCountry?: never;
  highlightCurrent?: never;
};

type MapModeProps = {
  animateShip?: undefined;
  country: string;
  selectedCountry?: string;
  disabledCountries?: string[];
  onSelectCountry?: (name: string) => void;
  highlightCurrent?: boolean;
};

type MapMedProps = AnimationModeProps | MapModeProps;

const MapMed = (props: any) => {
  const [animProgress, setAnimProgress] = useState(0);
  const [midFired, setMidFired] = useState(false);
  const shipAnimRef = useRef<number | null>(null);
  const lastElapsedRef = useRef(0);
  const lastStartTimeRef = useRef<number | null>(null);
  const lastFromToRef = useRef<{ from?: string; to?: string; duration?: number }>({});

  // Destructure for both modes
  const {
    animateShip,
    country,
    selectedCountry,
    disabledCountries = [],
    onSelectCountry,
    highlightCurrent = true,
  } = props as any;

  useEffect(() => {
    if (!animateShip) {
      setAnimProgress(0);
      setMidFired(false);
      lastElapsedRef.current = 0;
      lastStartTimeRef.current = null;
      lastFromToRef.current = {};
      if (shipAnimRef.current) {
        cancelAnimationFrame(shipAnimRef.current);
        shipAnimRef.current = null;
      }
      return;
    }

    // Only reset animation progress if from/to/duration actually change (NOT when just pausing/resuming!)
    const newKey = {
      from: animateShip.from,
      to: animateShip.to,
      duration: animateShip.duration,
    };

    const prevKey = lastFromToRef.current;
    const isNewSailing =
      prevKey.from !== newKey.from ||
      prevKey.to !== newKey.to ||
      prevKey.duration !== newKey.duration;

    if (isNewSailing) {
      setAnimProgress(0);
      setMidFired(false);
      lastElapsedRef.current = 0;
      lastStartTimeRef.current = null;
      lastFromToRef.current = newKey;
    }

    let raf: number;
    let cancelled = false;

    // Use the current progress if resuming (i.e., paused), or 0 if a new journey
    const startFrom = isNewSailing ? 0 : animProgress || 0;
    let elapsedBeforePause = startFrom * animateShip.duration;
    let localMidFired = midFired;

    function draw(now: number) {
      if (cancelled) return;
      if (lastStartTimeRef.current == null) lastStartTimeRef.current = now;
      const elapsed = elapsedBeforePause + (now - lastStartTimeRef.current);
      let p = Math.min(1, elapsed / animateShip.duration);
      setAnimProgress(p);

      // Handle mid-point event
      if (!localMidFired && p >= 0.5) {
        if (animateShip.risk && animateShip.onMidpoint) animateShip.onMidpoint();
        setMidFired(true);
        localMidFired = true;
      }

      if (p < 1 && !animateShip.paused) {
        raf = requestAnimationFrame(draw);
      } else if (p >= 1) {
        setAnimProgress(1); // Ensure final state
        if (animateShip.onAnimationEnd) animateShip.onAnimationEnd();
      }
    }

    if (animateShip.paused) {
      // When paused, stop animation loop (do not reset anything!)
      lastElapsedRef.current = animProgress * animateShip.duration;
      lastStartTimeRef.current = null;
    } else {
      lastStartTimeRef.current = null; // Will be set on first frame
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
    };
    // eslint-disable-next-line
  }, [
    animateShip?.from,
    animateShip?.to,
    animateShip?.duration,
    // NOTE: "paused" is intentionally NOT included here,
  ]);

  // Resume animation when paused flag is removed; use current animProgress
  useEffect(() => {
    if (!animateShip) return;
    if (!animateShip.paused) {
      // Resume from current animation progress
      let raf: number;
      let cancelled = false;

      let elapsedBeforePause = animProgress * animateShip.duration;
      let localMidFired = midFired;

      function draw(now: number) {
        if (cancelled) return;
        if (lastStartTimeRef.current == null) lastStartTimeRef.current = now;
        const elapsed = elapsedBeforePause + (now - lastStartTimeRef.current);
        let p = Math.min(1, elapsed / animateShip.duration);
        setAnimProgress(p);

        if (!localMidFired && p >= 0.5) {
          if (animateShip.risk && animateShip.onMidpoint) animateShip.onMidpoint();
          setMidFired(true);
          localMidFired = true;
        }

        if (p < 1 && !animateShip.paused) {
          raf = requestAnimationFrame(draw);
        } else if (p >= 1) {
          setAnimProgress(1);
          if (animateShip.onAnimationEnd) animateShip.onAnimationEnd();
        }
      }

      raf = requestAnimationFrame(draw);

      return () => {
        cancelled = true;
        if (raf) cancelAnimationFrame(raf);
      };
    }
    // eslint-disable-next-line
  }, [animateShip?.paused]);

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
                  cursor: animateShip ? "default" : (isDisabled ? "not-allowed" : (onSelectCountry ? "pointer" : "default")),
                  opacity: isDisabled ? 0.43 : 1,
                  pointerEvents: animateShip ? "none" : "auto"
                }}
                onClick={() => {
                  if (animateShip || isDisabled || !onSelectCountry) return;
                  onSelectCountry(name);
                }}
                tabIndex={onSelectCountry && !animateShip && !isDisabled ? 0 : undefined}
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
