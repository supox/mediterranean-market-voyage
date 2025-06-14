
import { useState } from "react";

export function useDefendShips() {
  const [defendShips, setDefendShipsState] = useState(0);
  const [defendShipsModalOpen, setDefendShipsModalOpen] = useState(false);
  const [defendShipCost, setDefendShipCost] = useState(0);

  function setDefendShips(num: number, pricePerShip: number, setBalance: (fn: (v: number) => number) => void) {
    setDefendShipsState(num);
    setDefendShipCost(pricePerShip);
    setBalance((bal) => bal - (num * pricePerShip));
  }

  function clearDefendShips() {
    setDefendShipsState(0);
    setDefendShipCost(0);
  }

  return {
    defendShips,
    defendShipsModalOpen,
    setDefendShipsModalOpen,
    defendShipCost,
    setDefendShips,
    clearDefendShips,
  };
}
