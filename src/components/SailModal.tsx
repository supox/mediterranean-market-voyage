
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Map } from "lucide-react";
import { useState } from "react";
import MapMed from "./MapMed";

// Only the 3 main countries remain
const DESTS = [
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Egypt", flag: "🇪🇬" },
];

// Only allowed routes (user can *not* cross over directly from Turkey <-> Egypt except as allowed).
const ROUTES: Record<string, Record<string, number>> = {
  Egypt: { Israel: 0.5, Turkey: 1, Egypt: 0 },
  Israel: { Egypt: 0.5, Turkey: 0.5, Israel: 0 },
  Turkey: { Israel: 0.5, Egypt: 1, Turkey: 0 },
};

function formatTravelTime(days: number) {
  const hours = Math.round(days * 12);
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

interface SailModalProps {
  open: boolean;
  onClose: () => void;
  currentCountry: string;
  currentHour?: number;
  onDestinationSelected?: (dest: string, travelTime: number) => void;
}

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;

const SailModal: React.FC<SailModalProps> = ({
  open,
  onClose,
  currentCountry,
  currentHour = DEFAULT_START_HOUR,
  onDestinationSelected,
}) => {
  const [dest, setDest] = useState<string | null>(null);

  // Countries you can travel to: arrival by 20:00 only
  const destinations = DESTS.filter((d) => {
    if (d.name === currentCountry) return false;
    const route = ROUTES[currentCountry][d.name];
    if (route === undefined || route === 999) return false;
    const travelHours = Math.round(route * 12);
    if (currentHour + travelHours > DEFAULT_END_HOUR) return false;
    return true;
  });

  // Countries not reachable or not allowed
  const disabled = DESTS
    .filter((d) => {
      if (
        d.name === currentCountry ||
        ROUTES[currentCountry][d.name] === undefined ||
        ROUTES[currentCountry][d.name] === 999
      )
        return true;
      const travelHours = Math.round(ROUTES[currentCountry][d.name] * 12);
      if (currentHour + travelHours > DEFAULT_END_HOUR) return true;
      return false;
    })
    .map((d) => d.name);

  const handlePickDestination = () => {
    if (dest && ROUTES[currentCountry][dest] !== undefined && ROUTES[currentCountry][dest] !== 999 && onDestinationSelected) {
      const travelTime = ROUTES[currentCountry][dest];
      const travelHours = Math.round(travelTime * 12);
      if (currentHour + travelHours > DEFAULT_END_HOUR) return;
      onDestinationSelected(dest, travelTime);
      setDest(null);
      onClose();
    }
  };

  const atNight = currentHour >= DEFAULT_END_HOUR;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <span className="inline-flex items-center gap-2">
              <Map size={20} /> Choose Your Destination
            </span>
          </DialogTitle>
          <DialogDescription>
            {atNight
              ? "It's too late to set sail. Rest until next day to continue traveling."
              : "Click a reachable port on the map. Unavailable destinations are greyed out."}
          </DialogDescription>
        </DialogHeader>
        <div>
          <MapMed
            country={currentCountry}
            selectedCountry={dest || undefined}
            disabledCountries={disabled}
            onSelectCountry={(name) => {
              if (!disabled.includes(name)) setDest(name);
            }}
            highlightCurrent={false}
          />
        </div>
        {dest && (
          <div className="flex justify-center mb-2">
            <span className="rounded px-3 py-1 bg-blue-50 border text-blue-900 border-blue-200 font-semibold text-sm">
              {dest} — {formatTravelTime(ROUTES[currentCountry][dest])}
            </span>
          </div>
        )}
        {destinations.length === 0 || atNight ? (
          <div className="w-full py-2 text-center text-blue-700/90 mt-2 bg-blue-50 border border-blue-200 rounded-lg font-medium text-sm">
            {atNight
              ? "You must rest until the next day to sail."
              : "No destinations can be reached before nightfall. Try again next day."}
          </div>
        ) : (
          <button
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-blue-700 disabled:opacity-70"
            disabled={!dest || disabled.includes(dest)}
            onClick={handlePickDestination}
          >
            {dest ? `Next: Hire Defend Ships` : "Select Destination on Map"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SailModal;
