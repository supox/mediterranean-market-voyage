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
import React, { useState } from "react";

// Main game page, using extracted logic and focused components
const Index = () => {
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
  } = useGameLogic();

  // Intercept sailing: 1. ask about defend ships, then 2. continue to normal sail modal
  const [pendingSail, setPendingSail] = useState<{open: boolean}>({ open: false });

  function openSailFlow() {
    // Instead of opening sail modal, open the defend ships modal, then sail modal
    setDefendShipsModalOpen(true);
    setPendingSail({open: true});
  }

  function handleConfirmDefendShips(numShips: number, shipPrice: number) {
    setDefendShips(numShips, shipPrice);
    setDefendShipsModalOpen(false);
    setTimeout(() => {
      setSailOpen(true);
    }, 200); // show sail modal after closing defend modal
  }

  // For pirate and all events: 
  // onSelect returns outcome, modal shows it, 
  // after OK, parent closes event modal & resumes sailing
  function onEventSelect(val: string) {
    // The outcome gets shown inside EventModal; we do NOT close yet!
    handleEventOption(val);
    // Do not resumeSailing or close modal here; only do it after OK
  }

  function onEventClose() {
    // When user clicks OK in modal, this handler closes and resumes
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
                    duration: 10_000,
                    risk: sailing.risk,
                    paused: sailingPaused,
                    onMidpoint: () => {
                      if (sailing.risk) {
                        triggerEvent(sailing.risk);
                      }
                    },
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
          setPendingSail({open: false});
        }}
        balance={balance}
        cargoValue={cargoValue}
        onConfirm={handleConfirmDefendShips}
      />
      <SailModal
        open={sailOpen}
        onClose={() => setSailOpen(false)}
        onSail={handleSail}
        currentCountry={country}
        currentHour={currentHour}
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
