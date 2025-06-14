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

// Hebrew country names
const COUNTRY_LABELS: Record<string, string> = {
  Turkey: "טורקיה",
  Israel: "ישראל",
  Egypt: "מצרים",
};

const MapMed = (props: any) => {
  const [animProgress, setAnimProgress] = useState(0);
  const [midFired, setMidFired] = useState(false);
  const shipAnimRef = useRef<number | null>(null);
  const lastStartTimeRef = useRef<number | null>(null);
  const savedElapsedRef = useRef(0);

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
      savedElapsedRef.current = 0;
      lastStartTimeRef.current = null;
      if (shipAnimRef.current) {
        cancelAnimationFrame(shipAnimRef.current);
        shipAnimRef.current = null;
      }
      return;
    }

    let raf: number;
    let cancelled = false;

    // If just resuming, we want to start from current animProgress and pause state
    let startFrom = animProgress;
    let elapsedBeforePause = startFrom * animateShip.duration;
    if (!animateShip.paused && !lastStartTimeRef.current) {
      lastStartTimeRef.current = null;
    }
    let midHandled = midFired;

    function draw(now: number) {
      if (cancelled) return;

      if (lastStartTimeRef.current == null) lastStartTimeRef.current = now;
      const elapsed = elapsedBeforePause + (now - lastStartTimeRef.current);
      let p = Math.min(1, elapsed / animateShip.duration);

      // If paused externally (i.e., during event), save elapsed and exit loop
      if (animateShip.paused) {
        savedElapsedRef.current = elapsed;
        // Do not increase progress, just "freeze"
        setAnimProgress(elapsed / animateShip.duration);
        if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
        shipAnimRef.current = null;
        return;
      }

      // Check for mid-point (event trigger)
      if (!midHandled && p >= 0.5) {
        // Stop at p = 0.5 if risk/event exists and call onMidpoint
        if (animateShip.risk && animateShip.onMidpoint) {
          setAnimProgress(0.5);
          savedElapsedRef.current = animateShip.duration * 0.5;
          setMidFired(true);
          midHandled = true;
          animateShip.onMidpoint();
          // Pause anim; don't continue animating until unpaused
          // No RAF scheduled, so animation stops until unpaused
          if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
          shipAnimRef.current = null;
          return;
        } else {
          midHandled = true;
          setMidFired(true);
        }
      }

      setAnimProgress(p);

      if (p < 1) {
        raf = requestAnimationFrame(draw);
        shipAnimRef.current = raf;
      } else {
        setAnimProgress(1); // Ensure full progress
        if (animateShip.onAnimationEnd) animateShip.onAnimationEnd();
        if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
        shipAnimRef.current = null;
      }
    }

    // Handle resume/pause logic always from correct progress/time
    if (animateShip.paused) {
      // If entering paused state, save progress
      if (shipAnimRef.current) cancelAnimationFrame(shipAnimRef.current);
      savedElapsedRef.current = animProgress * animateShip.duration;
      lastStartTimeRef.current = null;
    } else {
      // Resume animation or initial start
      elapsedBeforePause = savedElapsedRef.current;
      lastStartTimeRef.current = null;
      raf = requestAnimationFrame(draw);
      shipAnimRef.current = raf;
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
    animateShip?.paused,
  ]);

  return (
    <div className="w-full flex justify-center my-2">
      <div
        className="
          relative rounded-xl shadow-lg border bg-cyan-900
          w-full max-w-[500px] aspect-[500/380] overflow-hidden
          sm:h-56
        "
        style={{
          maxWidth: 500,
          aspectRatio: "500/380",
        }}
      >
        <img
          src="/lovable-uploads/65af5864-7834-4eda-8f8c-a0f7e4772f3d.png"
          alt="Mediterranean map"
          className="absolute left-0 top-0 w-full h-full object-cover select-none pointer-events-none"
          style={{ zIndex: 0 }}
          draggable={false}
        />
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 380"
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 2,
          }}
        >
          {props.animateShip && (
            <path
              d={getCurve(LOCATIONS[props.animateShip.from], LOCATIONS[props.animateShip.to])}
              stroke="#2563eb"
              strokeWidth={3.5}
              fill="none"
              strokeDasharray="8 6"
              opacity={0.7}
              style={{ filter: "drop-shadow(0 0 8px #38bdf855)" }}
            />
          )}
          {Object.entries(LOCATIONS).map(([name, { x, y }]) => {
            const isSelected = props.selectedCountry === name;
            const isDisabled = (props.disabledCountries || []).includes(name);
            const isCurrent = props.country === name;
            const markerColor = isSelected
              ? "#4299e1"
              : isCurrent && props.highlightCurrent
                ? "#16a34a"
                : "#fff9";
            return (
              <g key={name}
                style={{
                  cursor: props.animateShip
                    ? "default"
                    : isDisabled
                      ? "not-allowed"
                      : props.onSelectCountry
                        ? "pointer"
                        : "default",
                  opacity: isDisabled ? 0.43 : 1,
                  pointerEvents: props.animateShip ? "none" : "auto",
                }}
                onClick={() => {
                  if (props.animateShip || isDisabled || !props.onSelectCountry) return;
                  props.onSelectCountry(name);
                }}
                tabIndex={props.onSelectCountry && !props.animateShip && !isDisabled ? 0 : undefined}
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
                      : isCurrent && props.highlightCurrent
                        ? "drop-shadow(0 0 8px #16a34a66)"
                        : "none",
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
                  {COUNTRY_LABELS[name] ?? name}
                </text>
              </g>
            );
          })}
          {props.animateShip ?
            <MapShip from={props.animateShip.from} to={props.animateShip.to} animProgress={animProgress} />
            : (props.country && LOCATIONS[props.country] && (
              <MapShip from={props.country} to={props.country} animProgress={0} />
            ))}
        </svg>
      </div>
    </div>
  );
};
export default MapMed;
