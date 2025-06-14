
import React, { useState, useRef } from "react";
import SailModal from "./SailModal";
import DefendShipsModal from "./DefendShipsModal";

interface SailFlowProps {
  currentCountry: string;
  currentHour: number;
  balance: number;
  cargoValue: number;
  onSail: (dest: string, travelTime: number) => void;
  onDefendShips: (numShips: number, shipPrice: number) => void;
}

const SailFlow: React.FC<SailFlowProps> = ({
  currentCountry,
  currentHour,
  balance,
  cargoValue,
  onSail,
  onDefendShips,
}) => {
  const [sailModalOpen, setSailModalOpen] = useState(false);
  const [defendShipsModalOpen, setDefendShipsModalOpen] = useState(false);
  const [pendingSail, setPendingSail] = useState<{
    open: boolean;
    dest?: string;
    travelTime?: number;
  }>({ open: false });
  const pendingSailRef = useRef<{
    open: boolean;
    dest?: string;
    travelTime?: number;
  }>({ open: false });
  const didPickDestinationRef = useRef(false);

  function updatePendingSail(next: { open: boolean; dest?: string; travelTime?: number }) {
    setPendingSail(next);
    pendingSailRef.current = next;
  }

  function openSailFlow() {
    updatePendingSail({ open: true });
    setSailModalOpen(true);
  }

  function handleDestinationSelected(dest: string, travelTime: number) {
    console.log("[handleDestinationSelected] called with", { dest, travelTime });
    updatePendingSail({ open: true, dest, travelTime });
    setDefendShipsModalOpen(true);
    didPickDestinationRef.current = true;
    console.log("[handleDestinationSelected] pendingSailRef.current after update:", pendingSailRef.current);
  }

  function handleConfirmDefendShips(numShips: number, shipPrice: number) {
    onDefendShips(numShips, shipPrice);
    const { dest, travelTime } = pendingSailRef.current;
    console.log("[handleConfirmDefendShips] pendingSailRef.current:", pendingSailRef.current);
    if (dest && travelTime !== undefined && travelTime !== null) {
      console.log("[handleConfirmDefendShips] Triggering onSail with", { dest, travelTime });
      onSail(dest, travelTime);
      updatePendingSail({ open: false });
      setDefendShipsModalOpen(false);
      setSailModalOpen(false);
    } else {
      console.warn("[handleConfirmDefendShips] Cannot start sailing. Closing modals defensively. Values:", { dest, travelTime });
      setDefendShipsModalOpen(false);
      updatePendingSail({ open: false });
      setSailModalOpen(false);
    }
  }

  function handleSailModalClose() {
    if (!didPickDestinationRef.current) {
      updatePendingSail({ open: false });
    }
    didPickDestinationRef.current = false;
    setSailModalOpen(false);
  }

  return (
    <>
      <SailModal
        open={sailModalOpen && !defendShipsModalOpen}
        onClose={handleSailModalClose}
        currentCountry={currentCountry}
        currentHour={currentHour}
        onDestinationSelected={handleDestinationSelected}
      />
      <DefendShipsModal
        open={defendShipsModalOpen}
        onClose={() => {
          setDefendShipsModalOpen(false);
          updatePendingSail({ open: false });
          setSailModalOpen(false);
        }}
        balance={balance}
        cargoValue={cargoValue}
        onConfirm={handleConfirmDefendShips}
      />
    </>
  );
};

export { SailFlow, type SailFlowProps };
export default SailFlow;
