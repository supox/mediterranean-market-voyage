
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CargoExpansionModalProps {
  open: boolean;
  currentCapacity: number;
  newCapacity: number;
  price: number;
  balance: number;
  onAccept: () => void;
  onDecline: () => void;
}

const CargoExpansionModal: React.FC<CargoExpansionModalProps> = ({
  open,
  currentCapacity,
  newCapacity,
  price,
  balance,
  onAccept,
  onDecline,
}) => {
  return (
    <Dialog open={open} onOpenChange={onDecline} dir="rtl">
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-1 text-blue-900 font-bold">
            הצעה להרחבת מטען!
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center mb-2">
          <span className="text-5xl mb-2">🚢</span>
          <p className="text-base text-gray-700 mb-2 text-center">
            בנאי מקומי מציע לשדרג את האוניה להובלת מטען נוסף!
            <br />
            <span className="font-semibold text-slate-800">
              הכפל את מגבלת המטען מ-
              <span className="text-blue-700">{currentCapacity} טון</span>
              <span className="mx-1">→</span>
              <span className="text-green-700">{newCapacity} טון</span>
            </span>
            <br />
            בתשלום חד פעמי של:
            <span className="block text-2xl font-bold text-amber-600 mt-2">
              {price.toLocaleString()} ₪
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            className="w-full"
            variant="default"
            disabled={balance < price}
            onClick={onAccept}
          >
            קבל הצעה
          </Button>
          <Button className="w-full" variant="outline" onClick={onDecline}>
            דחה הצעה
          </Button>
          {balance < price && (
            <span className="text-xs text-red-500 text-center">
              אין מספיק כסף
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CargoExpansionModal;
