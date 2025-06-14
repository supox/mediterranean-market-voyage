
import React from "react";
import MapMed from "./MapMed";

interface MapAnimationContainerProps {
  sailing: {
    from: string;
    to: string;
    travelTime: number;
    risk?: string | null;
  };
  sailingPaused: boolean;
  mapShouldFadeOut: boolean;
  onMapMidpoint: () => void;
  onAnimationEnd: () => void;
}

const MapAnimationContainer: React.FC<MapAnimationContainerProps> = ({
  sailing,
  sailingPaused,
  mapShouldFadeOut,
  onMapMidpoint,
  onAnimationEnd,
}) => {
  return (
    <div
      className={`w-full max-w-xl mx-auto border bg-white/90 rounded-xl shadow-lg p-4 animate-fade-in ${
        mapShouldFadeOut ? "animate-fade-out" : ""
      }`}
    >
      <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2 mb-2">
        <span>
          🧭 Sailing from{" "}
          <span className="font-semibold">{sailing.from}</span> to{" "}
          <span className="font-semibold">{sailing.to}</span>...
        </span>
      </h3>
      <MapMed
        animateShip={{
          from: sailing.from,
          to: sailing.to,
          duration: 5000,
          risk: sailing.risk,
          paused: sailingPaused,
          onMidpoint: onMapMidpoint,
          onAnimationEnd,
        }}
      />
      <div className="text-blue-700 mt-2 text-center text-sm font-medium">
        The ship is at sea. Please wait...
      </div>
    </div>
  );
};

export default MapAnimationContainer;
