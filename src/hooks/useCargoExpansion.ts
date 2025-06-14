
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
  const [offerDay, setOfferDay] = useState(1);

  function maybeShowCargoExpansion(newDay: number) {
    if (newDay > 1 && offerDay !== newDay) {
      setOfferDay(newDay);
      // User must have at least 6000 NIS for the offer to show
      if (balance < 6000) {
        return;
      }
      // 20% chance
      if (Math.random() < 0.2) {
        const minPrice = 5000;
        // Price is 30% of balance, but capped at 90% of balance and not less than minPrice
        const proposedPrice = Math.floor(Math.max(minPrice, balance * 0.3));
        const maxAllowedPrice = Math.floor(balance * 0.9);
        const calcPrice = Math.min(proposedPrice, maxAllowedPrice);
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
