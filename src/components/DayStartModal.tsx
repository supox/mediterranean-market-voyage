
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sun, CloudRain } from "lucide-react";

interface DayStartModalProps {
  open: boolean;
  weather: string;
  day: number;
  onClose?: () => void;
}

const weatherInfo: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  Sunny: {
    label: "Sunny Skies",
    icon: <Sun size={40} className="text-yellow-400" />,
    desc: "It's a bright, sunny day on the Mediterranean.",
  },
  Stormy: {
    label: "Stormy Weather",
    icon: <CloudRain size={40} className="text-blue-400" />,
    desc: "Storms loom over the sea. Sailing could be risky.",
  },
  Overcast: {
    label: "Overcast",
    icon: <CloudRain size={40} className="text-gray-400" />,
    desc: "The sky is overcast, with grey clouds all around.",
  },
};

const DayStartModal: React.FC<DayStartModalProps> = ({ open, weather, day, onClose }) => {
  const info = weatherInfo[weather] || {
    label: weather,
    icon: null,
    desc: "",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs flex flex-col items-center animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center">
            <span className="text-2xl mb-1">Day {day}</span>
            {info.icon}
            <span className="mt-2 font-bold">{info.label}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 text-base text-center">
          {info.desc || `Today's weather: ${weather}.`}
        </DialogDescription>
        {onClose && (
          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            OK
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayStartModal;
