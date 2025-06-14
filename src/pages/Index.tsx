import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import GameOver from "@/components/GameOver";
import PricesTable from "@/components/PricesTable";
import SailFlow, { SailFlowRef } from "@/components/SailFlow";
import GameEventHandler from "@/components/GameEventHandler";
import MapAnimationContainer from "@/components/MapAnimationContainer";
import { useGameLogic } from "@/hooks/useGameLogic";
import React, { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import CargoExpansionModal from "@/components/CargoExpansionModal";
import MapCurrentShip from "@/components/MapCurrentShip";

const Index = () => {
  const [mapShouldFadeOut, setMapShouldFadeOut] = useState(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSmoothSailingToast = useRef(false);
  const sailFlowRef = useRef<SailFlowRef>(null);

  function handleSailSuccess(destination: string, hadEvent: boolean) {
    if (!hadEvent && !hasShownSmoothSailingToast.current) {
      hasShownSmoothSailingToast.current = true;
      toast({
        title: "Smooth Sailing!",
        description: `You sailed to ${destination} with no incidents.`,
      });
      setTimeout(() => {
        setMapShouldFadeOut(true);
      }, 1000);
    }
  }

  const {
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
    eventOpen,
    setEventOpen,
    eventData,
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
    cargoValue,
    setSailingHasEventOccurred,
    shipCapacity,
    cargoExpansionModalOpen,
    setCargoExpansionModalOpen,
    cargoExpansionOffer,
    acceptCargoExpansion,
    declineCargoExpansion,
    rerouteToNavErrorTarget,
  } = useGameLogic({
    onSailSuccess: (destination: string, hadEvent: boolean) =>
      handleSailSuccess(destination, hadEvent),
  });

  function handleMapMidpoint() {
    if (sailing && sailing.risk && !sailing.hasEventOccurred) {
      if (typeof sailingPaused === 'boolean' && !sailingPaused) {
        // Event pausing logic remains
      }
      triggerEvent(sailing.risk);
      if (setSailingHasEventOccurred) setSailingHasEventOccurred(true);
    }
  }

  function onEventSelect(val: string): string | void {
    return handleEventOption(val);
  }

  function onEventClose() {
    if (sailing && sailing.risk === "Navigation Error" && sailing.navErrorTarget) {
      rerouteToNavErrorTarget();
      setEventOpen(false);
    } else {
      resumeSailing();
      setEventOpen(false);
    }
  }

  function handleAnimationEnd() {
    if (mapShouldFadeOut) {
      setTimeout(() => {
        setMapShouldFadeOut(false);
        hasShownSmoothSailingToast.current = false;
        if (sailing && typeof sailing.to === "string" && typeof sailing.travelTime === "number") {
          finishSail(sailing.to, sailing.travelTime);
        }
      }, 300);
    } else {
      hasShownSmoothSailingToast.current = false;
      finishSail(sailing.to, sailing.travelTime);
    }
  }

  function handleSailButtonClick() {
    hasShownSmoothSailingToast.current = false;
    // --- BEGIN: Ship capacity check before open Sail modal ---
    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    if (totalCargo > shipCapacity) {
      toast({
        title: "Too Much Cargo",
        description: `Your ship can only hold ${shipCapacity} tons. Sell or store excess cargo before setting sail.`,
      });
      return; // Do not open modal
    }
    // --- END: capacity check ---
    sailFlowRef.current?.openSailFlow();
  }

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
      {/* Removed cargo capacity indicator just below header */}
      {/* <div className="w-full max-w-4xl mx-auto px-4 mt-2 text-right">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm drop-shadow">
          Cargo Limit: {cargo.reduce((a, c) => a + c.amount, 0)}/{shipCapacity} tons
        </span>
      </div> */}
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-10 pb-12 px-3">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 tracking-tight drop-shadow">
          🌊 Merchant of the Mediterranean
        </h1>
        {isGameOver ? (
          <GameOver balance={balance} cargo={cargo} onPlayAgain={resetGame} />
        ) : (
          <>
            {!sailing && (
              <ActionPanel
                onMarket={() => setMarketOpen(true)}
                onBank={() => setBankOpen(true)}
                onSail={handleSailButtonClick}
                onRest={handleRest}
                disabled={isGameOver}
                country={country}
              />
            )}
            {sailing && (
              <MapAnimationContainer
                sailing={sailing}
                sailingPaused={sailingPaused}
                mapShouldFadeOut={mapShouldFadeOut}
                onMapMidpoint={handleMapMidpoint}
                onAnimationEnd={handleAnimationEnd}
              />
            )}
          </>
        )}
      </div>
      {/* Show static map with ship location above prices table */}
      {!sailing && (
        <MapCurrentShip country={country} onClick={handleSailButtonClick} />
      )}
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
        country={country}
      />
      <BankModal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        onBankAction={handleBankAction}
        maxDeposit={maxDeposit}
        maxWithdraw={maxWithdraw}
      />
      <SailFlow
        ref={sailFlowRef}
        currentCountry={country}
        currentHour={currentHour}
        balance={balance}
        cargoValue={cargoValue}
        onSail={handleSail}
        onDefendShips={setDefendShips}
      />
      <GameEventHandler
        eventOpen={eventOpen}
        eventData={eventData}
        onEventSelect={onEventSelect}
        onEventClose={onEventClose}
      />
      {/* Modal for cargo expansion offer */}
      <CargoExpansionModal
        open={cargoExpansionModalOpen}
        currentCapacity={shipCapacity}
        newCapacity={cargoExpansionOffer?.newCapacity || shipCapacity * 2}
        price={cargoExpansionOffer?.price || 0}
        balance={balance}
        onAccept={acceptCargoExpansion}
        onDecline={declineCargoExpansion}
      />
    </div>
  );
};

export default Index;
