
import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import GameOver from "@/components/GameOver";
import PricesTable from "@/components/PricesTable";
import SailFlow from "@/components/SailFlow";
import GameEventHandler from "@/components/GameEventHandler";
import MapAnimationContainer from "@/components/MapAnimationContainer";
import { useGameLogic } from "@/hooks/useGameLogic";
import React, { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [mapShouldFadeOut, setMapShouldFadeOut] = useState(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSmoothSailingToast = useRef(false);

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
  } = useGameLogic({
    onSailSuccess: (destination: string, hadEvent: boolean) =>
      handleSailSuccess(destination, hadEvent),
  });

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
    setEventOpen(false);
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
        {isGameOver ? (
          <GameOver balance={balance} cargo={cargo} onPlayAgain={resetGame} />
        ) : (
          <>
            {!sailing && (
              <ActionPanel
                onMarket={() => setMarketOpen(true)}
                onBank={() => setBankOpen(true)}
                onSail={() => {
                  hasShownSmoothSailingToast.current = false;
                }}
                onRest={handleRest}
                disabled={isGameOver}
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
      <SailFlow
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
    </div>
  );
};

export default Index;
