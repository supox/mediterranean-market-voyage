import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Map } from "lucide-react";
import { useState } from "react";
import MapMed from "./MapMed";

const DESTS = [
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Cyprus", flag: "🇨🇾" },
  { name: "Egypt", flag: "🇪🇬" },
];

const ROUTES: Record<string, Record<string, number>> = {
  Egypt: { Israel: 0.5, Turkey: 1, Greece: 999, Cyprus: 999, Egypt: 0 },
  Israel: { Egypt: 0.5, Turkey: 0.5, Cyprus: 0.104, Greece: 1, Israel: 0 },
  Turkey: { Israel: 0.5, Egypt: 1, Cyprus: 999, Greece: 999, Turkey: 0 },
  Cyprus: { Israel: 0.104, Egypt: 999, Turkey: 999, Greece: 999, Cyprus: 0 },
  Greece: { Israel: 1, Egypt: 999, Turkey: 999, Cyprus: 999, Greece: 0 },
};

function formatTravelTime(days: number) {
  // In this game, 1 day = 12 in-game hours (08:00 to 20:00)
  const hours = Math.round(days * 12);
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

interface SailModalProps {
  open: boolean;
  onClose: () => void;
  onSail: (country: string, time: number) => void;
  currentCountry: string;
}

const SailModal: React.FC<SailModalProps> = ({
  open,
  onClose,
  onSail,
  currentCountry,
}) => {
  const [dest, setDest] = useState<string | null>(null);

  // Countries you can travel to (not current, not 999)
  const destinations = DESTS.filter(
    (d) => d.name !== currentCountry && ROUTES[currentCountry][d.name] !== 999
  );
  // Countries you can't reach
  const disabled = DESTS
    .filter(
      (d) =>
        d.name === currentCountry ||
        ROUTES[currentCountry][d.name] === 999
    )
    .map((d) => d.name);

  const handleSail = () => {
    if (dest && ROUTES[currentCountry][dest] !== 999) {
      const travelTime = ROUTES[currentCountry][dest];
      onSail(dest, travelTime);
      setDest(null);
      onClose();
    }
  };

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
            Click a reachable port on the map. Unavailable destinations are greyed out.
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
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-blue-700 disabled:opacity-70"
          disabled={!dest || ROUTES[currentCountry][dest!] === 999}
          onClick={handleSail}
        >
          {dest ? `Sail to ${dest}` : "Select Destination on Map"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SailModal;
