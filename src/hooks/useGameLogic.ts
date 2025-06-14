
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Wheat, Coins } from "lucide-react";

const INITIAL_BALANCE = 5000;
const INITIAL_CARGO = [
  { type: "Wheat", amount: 0 },
  { type: "Olives", amount: 0 },
  { type: "Copper", amount: 0 },
];
const WEATHER_TYPES = ["Sunny", "Stormy", "Overcast"];

const getRandomWeather = () =>
  WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

export function useGameLogic() {
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
      toast({ description: `Deposited ${amount} NIS` });
    } else {
      setBalance((b) => b + amount);
      setBank((bk) => bk - amount);
      toast({ description: `Withdrew ${amount} NIS` });
    }
    advanceTime("short");
  }

  function handleSail(dest: string, travelDays: number) {
    const risk =
      Math.random() < (timeOfDay === "Evening" ? 0.18 : 0.1)
        ? "Pirate"
        : null;
    setCountry(dest);
    setWeather(getRandomWeather());
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
    let desc = "";
    if (val === "escape")
      desc = "You attempt to flee... and narrowly evade capture!";
    if (val === "negotiate")
      desc =
        "A payment is made — the pirates let you go with most of your cargo.";
    if (val === "fight")
      desc = "Battle ensues! You win, and plunder some coin from the pirates.";
    toast({ title: "Event Outcome", description: desc });
  }

  function handleRest() {
    advanceTime("rest");
    toast({ title: "Rested", description: "Night passes peacefully in the harbor." });
  }

  function resetGame() {
    setDay(1);
    setTimeOfDay("Morning");
    setCountry("Turkey");
    setWeather(getRandomWeather());
    setBalance(INITIAL_BALANCE);
    setCargo([...INITIAL_CARGO]);
    setBank(0);
  }

  // Calculate goods for header
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

  const isGameOver = day > 7;

  return {
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
    maxDeposit: balance,
    maxWithdraw: bank,
  };
}
