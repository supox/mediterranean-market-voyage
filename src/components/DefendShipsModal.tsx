
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
  // Calculate dynamic price: e.g. 8% of total value (balance + cargo) per ship, minimum 300, max 4000.
  const totalValue = balance + cargoValue;
  const pricePerShip = Math.max(300, Math.min(Math.round(totalValue * 0.08), 4000));

  const [selected, setSelected] = useState(0);

  // Max ships: do not let user rent more than affordable
  const maxShips = Math.min(5, Math.floor(balance / pricePerShip));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center font-bold">Hire Defend Ships?</DialogTitle>
          <DialogDescription className="text-center mt-1">
            Pirate activity is known along these routes.<br />
            For extra protection, you can hire defend ships (escorts) before your journey.<br />
            Each escort increases your odds of victory and plunder if pirates attack!
          </DialogDescription>
        </DialogHeader>
        <img
          src={PIRATE_BOAT_IMG}
          alt="Defend ships"
          className="w-44 h-36 object-contain mx-auto rounded shadow mb-3 border border-neutral-300 bg-neutral-100"
          draggable={false}
        />
        <div className="w-full text-center text-base my-2">
          <span className="font-semibold text-blue-900">Choose number of defend ships to hire:</span>
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
          Each ship costs <b>{pricePerShip} ₪</b>.<br />
          {maxShips === 0
            ? <span className="text-red-600">Not enough funds to hire a ship.</span>
            : <span>
                Total: <b>{selected * pricePerShip} ₪</b>
              </span>
          }
        </div>
        <div className="flex flex-row gap-2 mt-3 justify-center w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selected, pricePerShip)}
            disabled={selected * pricePerShip > balance}
          >
            Hire {selected > 0 ? selected : "no"} ship{selected === 1 ? "" : "s"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DefendShipsModal;
