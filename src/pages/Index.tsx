import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import SailModal from "@/components/SailModal";
import EventModal from "@/components/EventModal";
import GameOver from "@/components/GameOver";
import PricesTable from "@/components/PricesTable";
import MapMed from "@/components/MapMed";
import DefendShipsModal from "@/components/DefendShipsModal";
import { useGameLogic } from "@/hooks/useGameLogic";
import React, { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";

// Main game page, using extracted logic and focused components
const Index = () => {
  // SAIL SUCCESS TOAST HANDLER
  function handleSailSuccess(destination: string, hadEvent: boolean) {
    if (!hadEvent) {
      toast({
        title: "Smooth Sailing!",
        description: `You sailed to ${destination} with no incidents.`,
      });
    }
  }

  const {
    // Game state
    day,
    formattedTime,
    currentHour,
    country,
    weather,
    balance,
    cargo,
    bank,
    cargoForHeader,
    prices,
    pricesByCountry,
    // Modal states
    marketOpen,
    setMarketOpen,
    bankOpen,
    setBankOpen,
    sailOpen,
    setSailOpen,
    eventOpen,
    setEventOpen,
    eventData,
    setEventData,
    // Actions
    handleMarketTrade,
    handleBankAction,
    handleSail,
    handleEventOption,
    handleRest,
    resetGame,
    finishSail,
    triggerEvent,
    sailing,
    sailingPaused,
    resumeSailing,
    // Game flags
    isGameOver,
    maxDeposit,
    maxWithdraw,
    setDefendShips,
    defendShipsModalOpen,
    setDefendShipsModalOpen,
    cargoValue,
    setSailingHasEventOccurred,
  } = useGameLogic({
    onSailSuccess: (destination: string, hadEvent: boolean) =>
      handleSailSuccess(destination, hadEvent),
  });

  // STATE to store destination before modals and journey starts
  const [pendingSail, setPendingSail] = useState<{
    open: boolean;
    dest?: string;
    travelTime?: number;
  }>({ open: false });

  // Ref to always have the latest value for callback
  const pendingSailRef = useRef<{
    open: boolean;
    dest?: string;
    travelTime?: number;
  }>({ open: false });
  // Whenever state updates, keep ref in sync
  function updatePendingSail(next: { open: boolean; dest?: string; travelTime?: number }) {
    setPendingSail(next);
    pendingSailRef.current = next;
  }

  function openSailFlow() {
    updatePendingSail({ open: true });
  }

  function handleDestinationSelected(dest: string, travelTime: number) {
    updatePendingSail({ open: true, dest, travelTime });
    setDefendShipsModalOpen(true);
  }

  function handleConfirmDefendShips(numShips: number, shipPrice: number) {
    // Set defend ships (Charges the user)
    setDefendShips(numShips, shipPrice);

    // Immediately trigger the sailing, then close defend modal and pending state.
    const { dest, travelTime } = pendingSailRef.current;
    if (dest && travelTime !== undefined) {
      handleSail(dest, travelTime);
      updatePendingSail({ open: false }); // Close sail modal and clear dest
      setDefendShipsModalOpen(false);
      // No need to wait for modal closing, animation/map will show right away.
    } else {
      // Defensive: just close modal, but this shouldn't happen if flow is right
      setDefendShipsModalOpen(false);
      updatePendingSail({ open: false });
    }
  }

  // For pirate and all events: 
  // onSelect returns outcome, modal shows it, 
  // after OK, parent closes event modal & resumes sailing
  function handleMapMidpoint() {
    if (sailing && sailing.risk && !sailing.hasEventOccurred) {
      triggerEvent(sailing.risk);
      if (setSailingHasEventOccurred) setSailingHasEventOccurred(true);
    }
  }

  function onEventSelect(val: string): string | void {
    return handleEventOption(val);
  }

  function onEventClose() {
    resumeSailing();
    setEventOpen(false); // closes EventModal
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-yellow-50 w-full">
      <GameHeader
        day={Math.min(day, 7)}
        timeOfDay={formattedTime}
        country={country}
        weather={weather}
        balance={balance}
        cargo={cargoForHeader}
      />
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-10 pb-44 px-3">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 tracking-tight drop-shadow">
          🌊 Merchant of the Mediterranean
        </h1>
        {/* Show action panel unless sailing is in progress */}
        {isGameOver ? (
          <GameOver balance={balance} cargo={cargo} onPlayAgain={resetGame} />
        ) : (
          <>
            {!sailing && (
              <ActionPanel
                onMarket={() => setMarketOpen(true)}
                onBank={() => setBankOpen(true)}
                onSail={openSailFlow}
                onRest={handleRest}
                disabled={isGameOver}
              />
            )}
            {/* When sailing, show the animated map */}
            {sailing && (
              <div className="w-full max-w-xl mx-auto border bg-white/90 rounded-xl shadow-lg p-4 animate-fade-in">
                <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2 mb-2">
                  <span>🧭 Sailing from <span className="font-semibold">{sailing.from}</span> to <span className="font-semibold">{sailing.to}</span>...</span>
                </h3>
                <MapMed
                  animateShip={{
                    from: sailing.from,
                    to: sailing.to,
                    duration: 5_000, // Changed from 10_000 to 5_000 (5 seconds)
                    risk: sailing.risk,
                    paused: sailingPaused,
                    onMidpoint: handleMapMidpoint,
                    onAnimationEnd: () => {
                      finishSail(sailing.to, sailing.travelTime);
                    }
                  }}
                />
                <div className="text-blue-700 mt-2 text-center text-sm font-medium">The ship is at sea. Please wait...</div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Only show prices if not sailing */}
      {!sailing && (
        <PricesTable pricesByCountry={pricesByCountry} country={country} />
      )}
      <MarketModal
        open={marketOpen}
        onClose={() => setMarketOpen(false)}
        onTrade={handleMarketTrade}
        balance={balance}
        cargo={cargo}
        prices={prices}
      />
      <BankModal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        onBankAction={handleBankAction}
        maxDeposit={maxDeposit}
        maxWithdraw={maxWithdraw}
      />
      <DefendShipsModal
        open={defendShipsModalOpen}
        onClose={() => {
          setDefendShipsModalOpen(false);
          updatePendingSail({ open: false });
        }}
        balance={balance}
        cargoValue={cargoValue}
        onConfirm={handleConfirmDefendShips}
      />
      <SailModal
        open={pendingSail.open && !defendShipsModalOpen}
        onClose={() => updatePendingSail({ open: false })}
        currentCountry={country}
        currentHour={currentHour}
        onDestinationSelected={handleDestinationSelected}
      />
      <EventModal
        open={eventOpen}
        type={eventData.type}
        description={eventData.description}
        options={eventData.options}
        onClose={onEventClose}
        onSelectOption={onEventSelect}
      />
    </div>
  );
};

export default Index;
