
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
}

// Icon fallback map
const ICONS: Record<string, JSX.Element> = {
  Pirate: <Flag size={32} className="text-red-600" />,
  Navigation: <Ship size={32} className="text-sky-600" />,
  Storm: <MessageSquare size={32} className="text-blue-400" />,
  Treasure: <Coins size={32} className="text-amber-500" />,
};

const PIRATE_IMAGE_SRC = "/lovable-uploads/c79ea32b-8d77-4a6d-8804-990b2720a110.png";

const EventModal: React.FC<EventModalProps> = ({
  open,
  type,
  description,
  options,
  onClose,
  onSelectOption,
}) => {
  // outcome is string | null. If present, we show the outcome instead of the query/options
  const [outcome, setOutcome] = useState<string | null>(null);

  // Reset outcome when modal opens/closes
  useEffect(() => {
    if (!open) setOutcome(null);
  }, [open]);

  // This handles the user's event option pick, e.g., escape, negotiate, fight
  function handleOption(val: string) {
    let result: string | void = undefined;
    if (onSelectOption) {
      result = onSelectOption(val);
    }
    // If a string is returned, show outcome, otherwise close modally immediately
    if (typeof result === "string" && result.length > 0) {
      setOutcome(result);
    } else {
      // Can't happen in our current flow, but safety fallback
      onClose();
    }
  }

  // This handles the OK click after outcome; closes the modal and lets parent resume
  function handleOk() {
    setOutcome(null); // cleanup visual state
    onClose();
  }

  // Pirate event: show always the pirate image and custom title/message
  const isPirate = type === "Pirate";
  const eventTitle = isPirate ? "Pirates attack" : (type ? `${type} Event` : "Event");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center w-full">
            {isPirate ? <Flag size={32} className="text-red-600" /> : (ICONS[type] || <Flag size={28} />)}
            {eventTitle}
          </DialogTitle>
        </DialogHeader>
        {isPirate && (
          <img
            src={PIRATE_IMAGE_SRC}
            alt="Pirate encounter"
            className="w-full rounded-lg shadow mb-3 border border-amber-600"
            style={{ maxHeight: 180, objectFit: "cover" }}
            draggable={false}
          />
        )}
        {/* Outcome phase: show big text + OK */}
        {outcome ? (
          <div className="flex flex-col items-center justify-center w-full py-8">
            <div className="text-lg font-semibold text-center mb-6">{outcome}</div>
            <Button className="mt-2 w-36" onClick={handleOk}>
              OK
            </Button>
          </div>
        ) : (
          <>
            {/* Story description */}
            <div className="my-2 text-base text-center w-full">{description}</div>
            {options && options.length > 0 && (
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
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
