
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
  // For fade-out animation of map after smooth sailing
  const [mapShouldFadeOut, setMapShouldFadeOut] = useState(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSmoothSailingToast = useRef(false);

  // SAIL SUCCESS TOAST HANDLER - now also triggers fade out
  function handleSailSuccess(destination: string, hadEvent: boolean) {
    if (!hadEvent && !hasShownSmoothSailingToast.current) {
      hasShownSmoothSailingToast.current = true;
      toast({
        title: "Smooth Sailing!",
        description: `You sailed to ${destination} with no incidents.`,
      });
      // Start fade-out animation for the map after a short delay
      setTimeout(() => {
        setMapShouldFadeOut(true);
      }, 1000); // Wait 1 second before starting fade
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
  const pendingSailRef = useRef<{
    open: boolean;
    dest?: string;
    travelTime?: number;
  }>({ open: false });
  // Track if we're closing SailModal due to destination selection or cancel
  const didPickDestinationRef = useRef(false);

  function updatePendingSail(next: { open: boolean; dest?: string; travelTime?: number }) {
    setPendingSail(next);
    pendingSailRef.current = next;
  }

  function openSailFlow() {
    updatePendingSail({ open: true });
    hasShownSmoothSailingToast.current = false; // Reset for new journey
  }

  function handleDestinationSelected(dest: string, travelTime: number) {
    console.log("[handleDestinationSelected] called with", { dest, travelTime });
    updatePendingSail({ open: true, dest, travelTime });
    setDefendShipsModalOpen(true);
    didPickDestinationRef.current = true; // Mark that destination was picked!
    // Log pendingSailRef after update
    console.log("[handleDestinationSelected] pendingSailRef.current after update:", pendingSailRef.current);
  }

  function handleConfirmDefendShips(numShips: number, shipPrice: number) {
    setDefendShips(numShips, shipPrice);
    const { dest, travelTime } = pendingSailRef.current;
    console.log("[handleConfirmDefendShips] pendingSailRef.current:", pendingSailRef.current);
    // Accept both 0 and positive travelTime (don't exclude 0-hour trips!)
    if (dest && travelTime !== undefined && travelTime !== null) {
      console.log("[handleConfirmDefendShips] Triggering handleSail with", { dest, travelTime });
      handleSail(dest, travelTime);
      updatePendingSail({ open: false }); // Close sail modal and clear dest
      setDefendShipsModalOpen(false);
    } else {
      console.warn("[handleConfirmDefendShips] Cannot start sailing. Closing modals defensively. Values:", { dest, travelTime });
      setDefendShipsModalOpen(false);
      updatePendingSail({ open: false });
    }
  }

  function handleSailModalClose() {
    // Only reset pendingSail if this is not from picking destination
    if (!didPickDestinationRef.current) {
      updatePendingSail({ open: false });
    }
    didPickDestinationRef.current = false; // Always reset flag after closing modal
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

  // Defensive: clear fade timer on unmount
  React.useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

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
              <div
                className={`w-full max-w-xl mx-auto border bg-white/90 rounded-xl shadow-lg p-4 animate-fade-in ${
                  mapShouldFadeOut ? "animate-fade-out" : ""
                }`}
              >
                <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2 mb-2">
                  <span>
                    🧭 Sailing from{" "}
                    <span className="font-semibold">{sailing.from}</span> to{" "}
                    <span className="font-semibold">{sailing.to}</span>...
                  </span>
                </h3>
                <MapMed
                  animateShip={{
                    from: sailing.from,
                    to: sailing.to,
                    duration: 5000,
                    risk: sailing.risk,
                    paused: sailingPaused,
                    onMidpoint: handleMapMidpoint,
                    onAnimationEnd: () => {
                      // Wait for fade animation to complete if it was triggered
                      if (mapShouldFadeOut) {
                        setTimeout(() => {
                          setMapShouldFadeOut(false);
                          if (sailing && typeof sailing.to === "string" && typeof sailing.travelTime === "number") {
                            finishSail(sailing.to, sailing.travelTime);
                          }
                        }, 300); // Wait for fade-out animation
                      } else {
                        finishSail(sailing.to, sailing.travelTime);
                      }
                    },
                  }}
                />
                <div className="text-blue-700 mt-2 text-center text-sm font-medium">
                  The ship is at sea. Please wait...
                </div>
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
        onClose={handleSailModalClose}
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
