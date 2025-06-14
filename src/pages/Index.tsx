import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import SailModal from "@/components/SailModal";
import EventModal from "@/components/EventModal";
import GameOver from "@/components/GameOver";
import PricesTable from "@/components/PricesTable";
import MapMed from "@/components/MapMed";
import { useGameLogic } from "@/hooks/useGameLogic";

// Main game page, using extracted logic and focused components
const Index = () => {
  const {
    // Game state
    day,
    timeOfDay,
    country,
    weather,
    balance,
    cargo,
    bank,
    cargoForHeader,
    prices,

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

    // Game flags
    isGameOver,
    maxDeposit,
    maxWithdraw,
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-yellow-50 w-full">
      <GameHeader
        day={Math.min(day, 7)}
        timeOfDay={timeOfDay}
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
            <ActionPanel
              onMarket={() => setMarketOpen(true)}
              onBank={() => setBankOpen(true)}
              onSail={() => setSailOpen(true)}
              onRest={handleRest}
              disabled={isGameOver}
            />
            {/* The ship map for destination picking is now inside the Sail modal */}
          </>
        )}
      </div>
      <PricesTable />
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
      <SailModal
        open={sailOpen}
        onClose={() => setSailOpen(false)}
        onSail={handleSail}
        currentCountry={country}
      />
      <EventModal
        open={eventOpen}
        type={eventData.type}
        description={eventData.description}
        options={eventData.options}
        onClose={() => setEventOpen(false)}
        onSelectOption={handleEventOption}
      />
    </div>
  );
};

export default Index;
