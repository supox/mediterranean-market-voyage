
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Ship, Flag, MessageSquare, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventModalProps {
  open: boolean;
  type: string;
  description: string;
  options?: { label: string; value: string }[];
  onClose: () => void;
  onSelectOption?: (val: string) => string | void;
  showOkButton?: boolean;
}

// Icon fallback map
const ICONS: Record<string, JSX.Element> = {
  Pirate: <Flag size={32} className="text-red-600" />,
  Navigation: <Ship size={32} className="text-sky-600" />,
  "Navigation Error": <Ship size={32} className="text-yellow-500" />,
  Storm: <MessageSquare size={32} className="text-blue-400" />,
  Treasure: <Coins size={32} className="text-amber-500" />,
  "Deserted Ships": <Ship size={32} className="text-amber-600" />,
};

const HE_TITLES: Record<string, string> = {
  Pirate: "מתקפת שודדי ים",
  Storm: "סערה בים",
  "Navigation Error": "שגיאה בניווט",
  "Deserted Ships": "אוניות נטושות",
  Treasure: "אוצר מוסתר",
};

const PIRATE_IMAGE_SRC = "/lovable-uploads/8cc5600b-71af-467c-b270-e5ba1bf4fa20.png";
const STORM_IMAGE_SRC = "/lovable-uploads/38924e06-f6c4-4785-92a7-54c9a2d9dc1a.png";
const DESERTED_SHIPS_IMAGE_SRC = "/lovable-uploads/a256e2b9-e4c2-44a4-afd5-8d2f9b50f492.png";
const NAV_ERROR_IMAGE_SRC = "/lovable-uploads/d8ab874c-c74d-4f7f-8546-efcdded79bc2.png";

const EventModal: React.FC<EventModalProps> = ({
  open,
  type,
  description,
  options,
  onClose,
  onSelectOption,
  showOkButton,
}) => {
  const [outcome, setOutcome] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setOutcome(null);
  }, [open]);

  function handleOption(val: string) {
    let result: string | void = undefined;
    if (onSelectOption) {
      result = onSelectOption(val);
    }
    if (typeof result === "string" && result.length > 0) {
      setOutcome(result);
    } else {
      onClose();
    }
  }

  function handleOk() {
    setOutcome(null);
    onClose();
  }

  const isPirate = type === "Pirate";
  const isStorm = type === "Storm";
  const isDesertedShips = type === "Deserted Ships";
  const isNavError = type === "Navigation Error";
  const eventTitle = HE_TITLES[type] || (type ? `${type} אירוע` : "אירוע");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col items-center" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center w-full">
            {isPirate ? (
              <Flag size={32} className="text-red-600" />
            ) : isStorm ? (
              <MessageSquare size={32} className="text-blue-400" />
            ) : isDesertedShips ? (
              <Ship size={32} className="text-amber-600" />
            ) : isNavError ? (
              <Ship size={32} className="text-yellow-500" />
            ) : (
              ICONS[type] || <Flag size={28} />
            )}
            {eventTitle}
          </DialogTitle>
        </DialogHeader>
        {isPirate && (
          <img
            src={PIRATE_IMAGE_SRC}
            alt="פגישה עם שודדי ים"
            className="w-full rounded-lg shadow mb-3 border border-amber-600"
            style={{ maxHeight: 180, objectFit: "cover" }}
            draggable={false}
          />
        )}
        {isStorm && (
          <img
            src={STORM_IMAGE_SRC}
            alt="סערה בים"
            className="w-full rounded-lg shadow mb-3 border border-blue-600"
            style={{ maxHeight: 180, objectFit: "cover" }}
            draggable={false}
          />
        )}
        {isDesertedShips && (
          <img
            src={DESERTED_SHIPS_IMAGE_SRC}
            alt="אוניות נטושות"
            className="w-full rounded-lg shadow mb-3 border border-amber-600"
            style={{ maxHeight: 180, objectFit: "cover" }}
            draggable={false}
          />
        )}
        {isNavError && (
          <img
            src={NAV_ERROR_IMAGE_SRC}
            alt="שגיאת ניווט"
            className="w-full rounded-lg shadow mb-3 border border-yellow-400"
            style={{ maxHeight: 180, objectFit: "cover" }}
            draggable={false}
          />
        )}
        {outcome ? (
          <div className="flex flex-col items-center justify-center w-full py-8">
            <div className="text-lg font-semibold text-center mb-6">{outcome}</div>
            <Button className="mt-2 w-36" onClick={handleOk}>
              אישור
            </Button>
          </div>
        ) : (
          <>
            <div className="my-2 text-base text-center w-full">{description}</div>
            {showOkButton || isNavError ? (
              <div className="flex flex-col gap-2 mt-4 w-full items-center">
                <Button className="w-40" onClick={handleOk}>
                  אישור
                </Button>
              </div>
            ) : options && options.length > 0 ? (
              <div className="flex flex-col gap-2 mt-4 w-full items-center">
                {options.map((opt) => (
                  <Button
                    key={opt.value}
                    className="w-40"
                    variant="outline"
                    onClick={() => handleOption(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
