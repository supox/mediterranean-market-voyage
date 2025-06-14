import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import SailModal from "@/components/SailModal";
import EventModal from "@/components/EventModal";
import GameOver from "@/components/GameOver";
import PricesTable from "@/components/PricesTable";
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
        <PricesTable />
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
            <div className="mt-14 w-full max-w-lg">
              <div className="bg-white/80 border border-slate-200 rounded-xl shadow px-6 py-5 text-base md:text-lg text-blue-900 animate-fade-in">
                <div className="mb-2 font-semibold">Tip:</div>
                <div>
                  Use the market to buy low, sell high. Sail between countries — but beware: events become riskier in the evening!
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Travel, trade, and survive — how much gold can you accumulate in just 7 days?
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <MarketModal
        open={marketOpen}
        onClose={() => setMarketOpen(false)}
        onTrade={handleMarketTrade}
        balance={balance}
        cargo={cargo}
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
