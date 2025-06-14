
import React from "react";
import MapMed from "./MapMed";

// Hebrew country labels for translation in title
const COUNTRY_LABELS: Record<string, string> = {
  Turkey: "טורקיה",
  Israel: "ישראל",
  Egypt: "מצרים",
};

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
      <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2 mb-2 text-right justify-end">
        <span>
          🧭 הספינה מפליגה מ
          <span className="font-semibold mx-1">
            {COUNTRY_LABELS[sailing.from] ?? sailing.from}
          </span>
          אל
          <span className="font-semibold mx-1">
            {COUNTRY_LABELS[sailing.to] ?? sailing.to}
          </span>
          ...
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
        הספינה בים. אנא המתן...
      </div>
    </div>
  );
};

export default MapAnimationContainer;

