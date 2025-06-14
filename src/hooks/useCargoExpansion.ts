
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePricesForAllCountries } from "@/utils/pricing";
import { DAY_START_HOUR, SHIP_CAPACITY as BASE_SHIP_CAPACITY } from "@/utils/gameHelpers";

export function useCargoExpansion({ balance, shipCapacity, setShipCapacity }: {
  balance: number;
  shipCapacity: number;
  setShipCapacity: (cap: number) => void;
}) {
  const [cargoExpansionOffer, setCargoExpansionOffer] = useState<null | { price: number, newCapacity: number }>(null);
  const [cargoExpansionModalOpen, setCargoExpansionModalOpen] = useState(false);

  function maybeShowCargoExpansion(newDay: number) {
    if (newDay > 1) {
      // User must have at least 6000 NIS for the offer to show
      if (balance < 6000) {
        return;
      }
      // 40% chance (increased from 20%)
      if (Math.random() < 0.4) {
        // New price calculation: Math.min(Math.max(5000, balance * 0.1), balance * 0.5)
        const calcPrice = Math.min(Math.max(5000, balance * 0.1), balance * 0.5);
        const newCapacity = shipCapacity * 2;
        setCargoExpansionOffer({ price: calcPrice, newCapacity });
        setCargoExpansionModalOpen(true);
      }
    }
  }

  function acceptCargoExpansion() {
    if (cargoExpansionOffer) {
      setShipCapacity(cargoExpansionOffer.newCapacity);
      toast({
        title: "הרחבת המטען הצליחה!",
        description: `הספינה שלך יכולה להכיל כעת עד ${cargoExpansionOffer.newCapacity} טון.`
      });
      setCargoExpansionOffer(null);
      setCargoExpansionModalOpen(false);
    }
  }
  function declineCargoExpansion() {
    setCargoExpansionOffer(null);
    setCargoExpansionModalOpen(false);
  }

  return {
    cargoExpansionOffer,
    cargoExpansionModalOpen,
    setCargoExpansionModalOpen,
    maybeShowCargoExpansion,
    acceptCargoExpansion,
    declineCargoExpansion,
  };
}
