
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ship, Flag, MessageSquare, Coins } from "lucide-react";

interface EventModalProps {
  open: boolean;
  type: string;
  description: string;
  options?: { label: string; value: string }[];
  onClose: () => void;
  onSelectOption?: (val: string) => void;
}

// This is a stub for now (only pirates)
// Expand with more event logic for future versions!
const ICONS: Record<string, JSX.Element> = {
  Pirate: <Flag size={32} className="text-red-600" />,
  Navigation: <Ship size={32} className="text-sky-600" />,
  Storm: <MessageSquare size={32} className="text-blue-400" />,
  Treasure: <Coins size={32} className="text-amber-500" />,
};

const EventModal: React.FC<EventModalProps> = ({
  open,
  type,
  description,
  options,
  onClose,
  onSelectOption,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ICONS[type] || <Flag size={28} />} {type} Event
          </DialogTitle>
        </DialogHeader>
        <div className="my-2 text-base">{description}</div>
        {options && (
          <div className="flex flex-col gap-2 mt-3">
            {options.map(opt => (
              <button
                key={opt.value}
                className="px-4 py-2 bg-blue-100 border border-blue-400 rounded-lg hover:bg-blue-200 font-bold"
                onClick={() => {
                  if (onSelectOption) onSelectOption(opt.value);
                  onClose();
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
