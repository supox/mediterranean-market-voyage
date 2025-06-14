import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePrices } from "@/utils/pricing";

// Game constants
const INITIAL_BALANCE = 5000;
const INITIAL_CARGO = [
  { type: "Wheat", amount: 0 },
  { type: "Olives", amount: 0 },
  { type: "Copper", amount: 0 },
];
const WEATHER_TYPES = ["Sunny", "Stormy", "Overcast"];
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;

// Helper to get random weather
const getRandomWeather = () =>
  WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

// Helper to format time as "HH:00"
function formatTime(hour: number) {
  return hour.toString().padStart(2, "0") + ":00";
}

export function useGameLogic() {
  const [day, setDay] = useState(1);
  // Instead of "Morning", "Midday", etc., use hour (integer, 8 - 20 inclusive)
  const [currentHour, setCurrentHour] = useState(DAY_START_HOUR);
  const [country, setCountry] = useState("Israel");
  const [weather, setWeather] = useState(getRandomWeather());
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [cargo, setCargo] = useState([...INITIAL_CARGO]);
  const [bank, setBank] = useState(0);

  // Market prices for current country (regenerates on sail)
  const [prices, setPrices] = useState(generatePrices());

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

  // Only advances the day if "rest" is called
  function advanceTime(hours: number | "rest") {
    if (hours === "rest") {
      setDay((d) => d + 1);
      setCurrentHour(DAY_START_HOUR);
      setWeather(getRandomWeather());
      toast({ description: "A new day dawns over the Mediterranean." });
      return;
    }
    let newHour = currentHour + hours;
    if (newHour > DAY_END_HOUR) {
      // Cap hour to 20:00 if trying to exceed it—no day increment
      setCurrentHour(DAY_END_HOUR);
    } else {
      setCurrentHour(newHour);
    }
    // Day only increases on rest now
  }

  // Actions
  function handleMarketTrade(type: string, quantity: number, isBuy: boolean) {
    const price = prices[type as keyof typeof prices];

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
    // No time advance for market
  }

  function handleBankAction(type: "deposit" | "withdraw", amount: number) {
    if (type === "deposit") {
      setBalance((b) => b - amount);
      setBank((bk) => bk + amount);
      toast({ description: `Deposited ${amount} ₪` });
    } else {
      setBalance((b) => b + amount);
      setBank((bk) => bk - amount);
      toast({ description: `Withdrew ${amount} ₪` });
    }
    // No time advance for bank
  }

  // Sailing always advances time by travel time in hours, allows multi-leg (e.g. 0.5d = 6hrs)
  function handleSail(dest: string, travelDays: number) {
    const travelHours = Math.round(travelDays * 12);
    // Only sail if arrival is before or at 20:00
    if (currentHour + travelHours > DAY_END_HOUR) {
      toast({ title: "Cannot Sail", description: "You can't arrive after 20:00. Please rest until the next day." });
      return;
    }
    const risk =
      Math.random() < (currentHour >= 18 ? 0.18 : 0.1)
        ? "Pirate"
        : null;

    setCountry(dest);
    setWeather(getRandomWeather());
    setPrices(generatePrices());
    advanceTime(travelHours);

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
    setCurrentHour(DAY_START_HOUR);
    setCountry("Turkey");
    setWeather(getRandomWeather());
    setBalance(INITIAL_BALANCE);
    setCargo([...INITIAL_CARGO]);
    setBank(0);
  }

  // Calculate goods for header (no JSX!)
  const cargoForHeader = [
    {
      type: "Wheat" as const,
      amount: cargoGood("Wheat").amount,
    },
    {
      type: "Olives" as const,
      amount: cargoGood("Olives").amount,
    },
    {
      type: "Copper" as const,
      amount: cargoGood("Copper").amount,
    },
  ];

  const isGameOver = day > 7;

  // For header and UI
  const formattedTime = formatTime(currentHour);

  return {
    // Game state
    day,
    currentHour,
    formattedTime,
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
    prices,
    dayStartHour: DAY_START_HOUR,
    dayEndHour: DAY_END_HOUR,
  };
}
