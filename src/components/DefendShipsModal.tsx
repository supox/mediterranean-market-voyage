import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DefendShipsModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  cargoValue: number;
  onConfirm: (numShips: number, shipPrice: number) => void;
}

const PIRATE_BOAT_IMG = "/lovable-uploads/631c7179-6593-4761-a2ef-4d16d836ba74.png";

const DefendShipsModal: React.FC<DefendShipsModalProps> = ({
  open,
  onClose,
  balance,
  cargoValue,
  onConfirm,
}) => {
  // Calculate dynamic price as before
  const totalValue = balance + cargoValue;
  const pricePerShip = Math.max(300, Math.min(Math.round(totalValue * 0.08), 4000));
  const [selected, setSelected] = useState(0);
  const maxShips = Math.min(5, Math.floor(balance / pricePerShip));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center font-bold">שכור ספינות ליווי?</DialogTitle>
          <DialogDescription className="text-center mt-1">
            פעילות שודדי ים מוכרת באזור זה.
            <br />
            ניתן לשכור ספינות ליווי (שמירה) לפני ההפלגה. כל ליווי מעלה את סיכויי ההגנה והשלל!
          </DialogDescription>
        </DialogHeader>
        <img
          src={PIRATE_BOAT_IMG}
          alt="ספינות ליווי"
          className="w-44 h-36 object-contain mx-auto rounded shadow mb-3 border border-neutral-300 bg-neutral-100"
          draggable={false}
        />
        <div className="w-full text-center text-base my-2">
          <span className="font-semibold text-blue-900">בחר את מספר הספינות להגנה:</span>
        </div>
        <div className="flex flex-row justify-center gap-2 my-1">
          {[...Array(maxShips + 1).keys()].map(n => (
            <Button
              key={n}
              size="sm"
              variant={n === selected ? "default" : "outline"}
              onClick={() => setSelected(n)}
              className="w-10"
            >
              {n}
            </Button>
          ))}
        </div>
        <div className="text-sm text-gray-700 my-1 text-center w-full">
          כל ספינה עולה <b>{pricePerShip} ₪</b>.<br />
          {maxShips === 0
            ? <span className="text-red-600">אין מספיק כסף לשכור ליווי.</span>
            : <span>
                סה"כ: <b>{selected * pricePerShip} ₪</b>
              </span>
          }
        </div>
        <div className="flex flex-row gap-2 mt-3 justify-center w-full">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button
            onClick={() => onConfirm(selected, pricePerShip)}
            disabled={selected * pricePerShip > balance}
          >
            שכור {selected > 0 ? selected : "אין"} ספינות
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DefendShipsModal;
