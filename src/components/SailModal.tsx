
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Map } from "lucide-react";
import { useState } from "react";

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
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""}`;
  if (days * 24 < 1) return `${Math.round(days * 24 * 60)} min`;
  return `${Math.round(days * 24)} hours`;
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

  const destinations = DESTS.filter(d => d.name !== currentCountry);

  const handleSail = () => {
    if (dest) {
      const travelTime = ROUTES[currentCountry][dest];
      if (travelTime !== 999) {
        onSail(dest, travelTime);
        setDest(null);
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sail to...</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2 mb-3">
          {destinations.map(d => (
            <button
              key={d.name}
              onClick={() => setDest(d.name)}
              className={`flex items-center p-3 bg-white rounded-lg border ${dest === d.name ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-100"} hover:bg-blue-50 focus:outline-none transition`}
            >
              <span className="text-2xl mr-2">{d.flag}</span>
              <span className="font-semibold text-base">{d.name}</span>
              <span className="ml-auto text-xs opacity-70">
                {ROUTES[currentCountry][d.name] === 999
                  ? "N/A"
                  : formatTravelTime(ROUTES[currentCountry][d.name])}
              </span>
            </button>
          ))}
        </div>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-blue-700 disabled:opacity-70"
          disabled={!dest || ROUTES[currentCountry][dest] === 999}
          onClick={handleSail}
        >
          {dest ? `Sail to ${dest}` : "Select Destination"}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SailModal;
