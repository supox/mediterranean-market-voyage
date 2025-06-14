import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sun, CloudRain } from "lucide-react";

interface DayStartModalProps {
  open: boolean;
  weather: string;
  day: number;
  onClose?: () => void;
}

const weatherInfo: Record<
  string,
  { label: string; icon: React.ReactNode; desc: string }
> = {
  Sunny: {
    label: "שמיים בהירים",
    icon: <Sun size={40} className="text-yellow-400" />,
    desc: "זהו יום שמשי ובהיר בים התיכון.",
  },
  Stormy: {
    label: "מזג אוויר סוער",
    icon: <CloudRain size={40} className="text-blue-400" />,
    desc: "סערות פוקדות את הים. מסוכן להפליג.",
  },
  Overcast: {
    label: "מעונן",
    icon: <CloudRain size={40} className="text-gray-400" />,
    desc: "השמיים מעוננים, עננים אפורים בכל מקום.",
  },
};

const DayStartModal: React.FC<DayStartModalProps> = ({
  open,
  weather,
  day,
  onClose,
}) => {
  const info = weatherInfo[weather] || {
    label: weather,
    icon: null,
    desc: "",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs flex flex-col items-center animate-fade-in pt-4">
        <img
          src="/lovable-uploads/d7086654-ee76-4b8e-8f73-989a18c0eff3.png"
          alt="סוחר מתחיל יום חדש"
          className="rounded-lg w-[180px] h-[120px] object-cover mb-2 shadow-md"
          draggable={false}
        />
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center w-full text-center">
            <span className="text-2xl mb-1">יום {day}</span>
            {info.icon}
            <span className="mt-2 font-bold">{info.label}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 text-base text-center">
          {info.desc || `מזג האוויר היום: ${weather}.`}
        </DialogDescription>
        {onClose && (
          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            אישור
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayStartModal;
