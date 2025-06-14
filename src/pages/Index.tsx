import { useState } from "react";
import GameHeader from "@/components/GameHeader";
import ActionPanel from "@/components/ActionPanel";
import MarketModal from "@/components/MarketModal";
import BankModal from "@/components/BankModal";
import SailModal from "@/components/SailModal";
import EventModal from "@/components/EventModal";
import { toast } from "@/hooks/use-toast";
import { Wheat, Coins } from "lucide-react";

const INITIAL_BALANCE = 5000;
const INITIAL_CARGO = [
  { type: "Wheat", amount: 0 },
  { type: "Olives", amount: 0 },
  { type: "Copper", amount: 0 },
];
const ALL_COUNTRIES = ["Turkey", "Israel", "Greece", "Cyprus", "Egypt"];
const WEATHER_TYPES = ["Sunny", "Stormy", "Overcast"];

const getRandomWeather = () =>
  WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

export default function Index() {
  const [day, setDay] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState("Morning");
  const [country, setCountry] = useState("Israel");
  const [weather, setWeather] = useState(getRandomWeather());
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [cargo, setCargo] = useState([...INITIAL_CARGO]);
  const [bank, setBank] = useState(0);

  // Modal states
  const [marketOpen, setMarketOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [sailOpen, setSailOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [eventData, setEventData] = useState<{
    type: string;
    description: string;
    options?: { label: string; value: string }[];
  }>({ type: "", description: "", options: [] });

  // Helper: find cargo good (by type)
  const cargoGood = (type: string) =>
    cargo.find((g) => g.type === type) || { type, amount: 0 };

  // Handle daily time
  function advanceTime(amount: "short" | "long" | "rest") {
    // Simple time state machine: Morning → Midday → Evening → Night → Morning (+1d)
    const order = ["Morning", "Midday", "Evening", "Night"];
    let idx = order.indexOf(timeOfDay);
    if (amount === "rest" || timeOfDay === "Night") {
      setDay((d) => d + 1);
      setTimeOfDay("Morning");
      setWeather(getRandomWeather());
      toast({ description: "A new day dawns over the Mediterranean." });
    } else if (amount === "short") {
      setTimeOfDay(order[Math.min(idx + 1, 3)]);
    } else if (amount === "long") {
      setTimeOfDay("Night");
    }
  }

  // Actions
  function handleMarketTrade(type: string, quantity: number, isBuy: boolean) {
    // Price logic handled in MarketModal (random per session)
    const price = isBuy
      ? type === "Wheat"
        ? 9
        : type === "Olives"
        ? 25
        : 55
      : type === "Wheat"
      ? 8
      : type === "Olives"
      ? 22
      : 52;
    if (isBuy) {
      setBalance((b) => b - price * quantity);
      setCargo((prev) => {
        const found = prev.find((g) => g.type === type);
        if (found) {
          return prev.map((g) =>
            g.type === type ? { ...g, amount: g.amount + quantity } : g
          );
        } else {
          return [...prev, { type, amount: quantity }];
        }
      });
      toast({ title: "Trade Complete", description: `Bought ${quantity} ${type}` });
    } else {
      setBalance((b) => b + price * quantity);
      setCargo((prev) =>
        prev.map((g) =>
          g.type === type ? { ...g, amount: Math.max(0, g.amount - quantity) } : g
        )
      );
      toast({ title: "Trade Complete", description: `Sold ${quantity} ${type}` });
    }
    advanceTime("short");
  }

  function handleBankAction(type: "deposit" | "withdraw", amount: number) {
    if (type === "deposit") {
      setBalance((b) => b - amount);
      setBank((bk) => bk + amount);
      toast({ description: `Deposited ${amount} ₤` });
    } else {
      setBalance((b) => b + amount);
      setBank((bk) => bk - amount);
      toast({ description: `Withdrew ${amount} ₤` });
    }
    advanceTime("short");
  }

  function handleSail(dest: string, travelDays: number) {
    // Random event stub (10% pirate event chance, evening more likely)
    const risk =
      Math.random() < (timeOfDay === "Evening" ? 0.18 : 0.1)
        ? "Pirate"
        : null;
    setCountry(dest);
    setWeather(getRandomWeather());
    // Advance time: scale by travelDays
    if (travelDays >= 1) {
      advanceTime("long");
    } else {
      advanceTime("short");
    }
    if (risk) {
      setEventData({
        type: "Pirate",
        description:
          "Pirate ships approach! Will you try to Escape, Negotiate, or Fight Back?",
        options: [
          { label: "Escape", value: "escape" },
          { label: "Negotiate", value: "negotiate" },
          { label: "Fight Back", value: "fight" },
        ],
      });
      setTimeout(() => setEventOpen(true), 700);
    } else {
      toast({ title: `Arrived: ${dest}`, description: `You sailed safely!` });
    }
  }

  function handleEventOption(val: string) {
    // Pirate event outcome stubs
    let desc = "";
    if (val === "escape") desc = "You attempt to flee... and narrowly evade capture!";
    if (val === "negotiate") desc = "A payment is made — the pirates let you go with most of your cargo.";
    if (val === "fight") desc = "Battle ensues! You win, and plunder some coin from the pirates.";
    toast({ title: "Event Outcome", description: desc });
  }

  function handleRest() {
    advanceTime("rest");
    toast({ title: "Rested", description: "Night passes peacefully in the harbor." });
  }

  // Calculate goods for header: conform to Good[] types
  const cargoForHeader = [
    {
      type: "Wheat" as const,
      amount: cargoGood("Wheat").amount,
      icon: <Wheat size={16} className="text-amber-500" />,
    },
    {
      type: "Olives" as const,
      amount: cargoGood("Olives").amount,
      icon: <Coins size={16} className="text-green-600" />,
    },
    {
      type: "Copper" as const,
      amount: cargoGood("Copper").amount,
      icon: <Coins size={16} className="text-orange-700" />,
    },
  ];

  // End game after Day 7
  const isGameOver = day > 7;

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
          <div className="bg-white border border-green-100 p-8 rounded-xl shadow text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <div className="mb-1">
              <span className="font-medium">Final Balance:</span>{" "}
              <span className="text-green-700 font-extrabold text-2xl">
                {balance.toLocaleString()} ₤
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium">Cargo Value (mock):</span>{" "}
              <span className="text-blue-800">
                ~{(cargo.reduce((acc, g) => acc + (g.amount * 14), 0)).toLocaleString()} ₤
              </span>
            </div>
            <button
              className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow rounded-lg font-bold text-lg"
              onClick={() => {
                setDay(1);
                setTimeOfDay("Morning");
                setCountry("Turkey");
                setWeather(getRandomWeather());
                setBalance(INITIAL_BALANCE);
                setCargo([...INITIAL_CARGO]);
                setBank(0);
              }}
            >
              Play Again
            </button>
          </div>
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
      {/* Modals */}
      <MarketModal
        open={marketOpen}
        onClose={() => setMarketOpen(false)}
        onTrade={handleMarketTrade}
        balance={balance}
      />
      <BankModal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        onBankAction={handleBankAction}
        maxDeposit={balance}
        maxWithdraw={bank}
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
}
