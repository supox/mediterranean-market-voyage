import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { generatePricesForAllCountries } from "@/utils/pricing";
import {
  INITIAL_BALANCE,
  INITIAL_CARGO,
  WEATHER_TYPES,
  DAY_START_HOUR,
  DAY_END_HOUR,
  getRandomWeather,
  formatTime,
  COUNTRIES,
  SHIP_CAPACITY,
} from "@/utils/gameHelpers";
import { useSailing } from "./useSailing";

// Game constants
// const INITIAL_BALANCE = 5000;
// const INITIAL_CARGO = [
//   { type: "Wheat", amount: 0 },
//   { type: "Olives", amount: 0 },
//   { type: "Copper", amount: 0 },
// ];
// const WEATHER_TYPES = ["Sunny", "Stormy", "Overcast"];
// const DAY_START_HOUR = 8;
// const DAY_END_HOUR = 20;

// Helper to get random weather
// const getRandomWeather = () =>
//   WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

// Helper to format time as "HH:00"
// function formatTime(hour: number) {
//   return hour.toString().padStart(2, "0") + ":00";
// }

export function useGameLogic(options?: { onSailSuccess?: (dest: string, hadEvent: boolean) => void }) {
  const [day, setDay] = useState(1);
  // Instead of "Morning", "Midday", etc., use hour (integer, 8 - 20 inclusive)
  const [currentHour, setCurrentHour] = useState(DAY_START_HOUR);
  const [country, setCountry] = useState("Israel");
  const [weather, setWeather] = useState(getRandomWeather());
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [cargo, setCargo] = useState([...INITIAL_CARGO]);
  const [bank, setBank] = useState(0);

  // Store all country prices for the day
  const [pricesByCountry, setPricesByCountry] = useState(() => generatePricesForAllCountries(["Israel", "Turkey", "Greece", "Cyprus", "Egypt"]));

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

  // Add ship animation state
  // const [sailing, setSailing] = useState<null | {
  //   from: string;
  //   to: string;
  //   travelTime: number;
  //   risk: string | null; // event type, e.g. "Pirate", "Storm", etc.
  // }>(null);
  // const [sailingPaused, setSailingPaused] = useState(false);

  // Add defend ships per journey state:
  const [defendShips, setDefendShipsState] = useState(0);
  const [defendShipsModalOpen, setDefendShipsModalOpen] = useState(false);
  const [defendShipCost, setDefendShipCost] = useState(0);

  // SCORE utility: cargo value computation
  const cargoValue = cargo.reduce((acc, cur) => {
    const price = pricesByCountry[country]?.[cur.type] || 0;
    return acc + ((cur.amount || 0) * price);
  }, 0);

  // When player confirms defend ships rental before sailing:
  function setDefendShips(num: number, pricePerShip: number) {
    setDefendShipsState(num);
    setDefendShipCost(pricePerShip);
    // Charge upfront
    setBalance((bal) => bal - (num * pricePerShip));
  }

  // When sailing finishes or new journey: reset defend ship count
  function clearDefendShips() {
    setDefendShipsState(0);
    setDefendShipCost(0);
  }

  // Implement advanceTime function for handling time and days
  function advanceTime(param: number | "rest") {
    if (param === "rest") {
      // Next day, morning
      setDay((prev) => prev + 1);
      setCurrentHour(DAY_START_HOUR);
      // Regenerate prices for a new day
      setPricesByCountry(generatePricesForAllCountries(["Israel", "Turkey", "Greece", "Cyprus", "Egypt"]));
    } else {
      // Advance in-game clock by that many hours (e.g. hours spent sailing)
      setCurrentHour((prev) => {
        // Calculate if day should increment
        const nextHour = prev + param;
        if (nextHour > DAY_END_HOUR) {
          // Move to next day and carry over extra hours (rarely needed)
          setDay((d) => d + 1);
          setPricesByCountry(generatePricesForAllCountries(["Israel", "Turkey", "Greece", "Cyprus", "Egypt"]));
          return DAY_START_HOUR + (nextHour - DAY_END_HOUR);
        }
        return nextHour;
      });
    }
  }

  // Use sailing logic, and clear defend ships when journey ends
  const sailingLogic = useSailing({
    country,
    currentHour,
    setCountry,
    setWeather,
    advanceTime,
    setSailOpen,
    afterFinish: clearDefendShips,
    onSailSuccess: options?.onSailSuccess,
    cargo,
  });

  // Actions
  function handleMarketTrade(type: string, quantity: number, isBuy: boolean) {
    const price = pricesByCountry[country][type as keyof typeof pricesByCountry[typeof country]];

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

  // New: start ship animation instead of instantly moving country
  // function startSail(dest: string, travelDays: number) {
  //   // Only sail if arrival is before or at 20:00
  //   const travelHours = Math.round(travelDays * 12);
  //   if (currentHour + travelHours > DAY_END_HOUR) {
  //     toast({ title: "Cannot Sail", description: "You can't arrive after 20:00. Please rest until the next day." });
  //     return;
  //   }
  //   // Pirate risk: 70% chance at night (>=18:00), 50% by day (<18:00), for testing
  //   const risk =
  //     Math.random() < (currentHour >= 18 ? 0.7 : 0.5) ? "Pirate" : null;
  //   setSailing({ from: country, to: dest, travelTime: travelDays, risk });
  //   setSailingPaused(false); // ensure not paused at start
  //   setSailOpen(false); // Close the modal to animate map
  // }

  // function pauseSailing() {
  //   setSailingPaused(true);
  // }
  // function resumeSailing() {
  //   setSailingPaused(false);
  // }

  // // Called when animation finishes (or after event resolved)
  // function finishSail(dest: string, travelDays: number) {
  //   setCountry(dest);
  //   setWeather(getRandomWeather());
  //   advanceTime(Math.round(travelDays * 12));
  //   setSailing(null);
  //   setSailingPaused(false);
  // }

  // Called when event occurs during sailing
  function triggerEvent(risk: string) {
    if (risk === "Storm") {
      // Handle storm automatically without user options
      handleStormEvent();
      return;
    }
    
    if (risk === "Deserted Ships") {
      // Handle deserted ships automatically without user options
      handleDesertedShipsEvent();
      return;
    }
    
    let desc = "";
    let options = [];
    if (risk === "Pirate") {
      desc = "Pirate ships approach! Will you try to Escape, Negotiate, or Fight Back?";
      options = [
        { label: "Escape", value: "escape" },
        { label: "Negotiate", value: "negotiate" },
        { label: "Fight Back", value: "fight" },
      ];
    }
    
    setEventData({
      type: risk,
      description: desc,
      options,
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  function handleStormEvent() {
    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    if (totalCargo === 0) return; // Should not happen since storm chance is 0 with no cargo

    // Calculate cargo loss (10-30% of total cargo, minimum 1 ton)
    const lossPercentage = 0.1 + Math.random() * 0.2; // 10-30%
    const baseLoss = Math.floor(totalCargo * lossPercentage);
    const actualLoss = Math.max(1, baseLoss); // Ensure at least 1 ton is lost
    
    let cargoLost: Array<{ type: string; amount: number }> = [];
    let remainingToLose = actualLoss;
    
    // Calculate losses before updating state, distributing across available cargo
    const updatedCargo = cargo.map((good) => {
      if (remainingToLose > 0 && good.amount > 0) {
        const lostAmount = Math.min(good.amount, remainingToLose);
        if (lostAmount > 0) {
          cargoLost.push({ type: good.type, amount: lostAmount });
          remainingToLose -= lostAmount;
          return { ...good, amount: good.amount - lostAmount };
        }
      }
      return good;
    });

    // Update cargo state
    setCargo(updatedCargo);

    // Create description of what was lost
    const lostItems = cargoLost.map(item => `${item.amount} tons of ${item.type}`).join(", ");
    const description = `A violent storm hits your ship! Cargo is thrown overboard to keep the ship stable. You lose ${lostItems}.`;
    
    // Show storm result without options
    setEventData({
      type: "Storm",
      description,
      options: [], // No options for storm
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  function handleDesertedShipsEvent() {
    // New logic: gain is based on player's total value and is capped by ship capacity.
    const totalValue = balance + cargoValue;
    const gainPercentage = 0.05 + Math.random() * 0.15; // 5-20%
    const gainedValue = totalValue * gainPercentage;

    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    const availableSpace = SHIP_CAPACITY - totalCargo;

    if (availableSpace <= 0) {
      const description = `You discover a fleet of deserted ships, but your cargo hold is full! You have to leave the potential salvage behind.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const destination = sailingLogic.sailing?.to;
    if (!destination) {
      console.error("Sailing destination not found for deserted ships event");
      const description = `You spot deserted ships, but strong currents prevent you from getting close. You continue your journey.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const cargoTypes = ["Wheat", "Olives", "Copper"];
    const randomType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)] as keyof typeof prices;
    const price = pricesByCountry[destination]?.[randomType];

    if (!price || price <= 0) {
      console.error(`Price for ${randomType} in ${destination} not found or is zero.`);
      const description = `The deserted ships seem to have been picked clean. You find nothing of value.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    let gainAmount = Math.floor(gainedValue / price);
    gainAmount = Math.min(gainAmount, availableSpace);

    if (gainAmount <= 0) {
      const description = `You discover a fleet of deserted ships. After a search, you find some supplies but no significant cargo to add to your hold.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    setCargo((prev) => {
      const found = prev.find((g) => g.type === randomType);
      if (found) {
        return prev.map((g) =>
          g.type === randomType ? { ...g, amount: g.amount + gainAmount } : g
        );
      } else {
        return [...prev, { type: randomType, amount: gainAmount }];
      }
    });

    const description = `You discover a fleet of deserted ships drifting in the waters. After searching through them, you salvage ${gainAmount} tons of ${randomType} from their cargo holds.`;

    setEventData({
      type: "Deserted Ships",
      description,
      options: [],
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  // Return only the outcome string; do not toast here!
  function handleEventOption(val: string) {
    let desc = "";
    if (val === "escape") {
      // Each defend ship slightly increases escape success chance
      const chance = 0.45 + defendShips * 0.07;
      if (Math.random() < chance) {
        desc = "You escape using clever maneuvers and your hired escorts!";
      } else {
        desc = "Despite your best efforts, pirates catch up. Brace for battle!";
        // If no cargo, lose coins instead
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          const coinLoss = 200 + Math.floor(Math.random() * 300); // 200-500 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc += ` You pay ${coinLoss} ₪ to the pirates.`;
        }
      }
    }
    if (val === "negotiate") {
      const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
      if (totalCargo === 0) {
        // No cargo to give, pay coins instead
        const coinLoss = 150 + Math.floor(Math.random() * 200); // 150-350 coins
        setBalance(b => Math.max(0, b - coinLoss));
        desc = `You have no cargo to offer, so you pay ${coinLoss} ₪ as tribute. The pirates let you go.`;
      } else {
        // Each defend ship reduces the pirates' leverage, possibly lowering loss
        const lostGoods = Math.max(1, 3 - defendShips);
        
        // Calculate specific cargo loss before updating state
        let cargoLost: Array<{ type: string; amount: number }> = [];
        const updatedCargo = cargo.map(good => {
          if (lostGoods > 0 && good.amount > 0) {
            const lostAmount = Math.min(good.amount, lostGoods);
            if (lostAmount > 0) {
              cargoLost.push({ type: good.type, amount: lostAmount });
              return { ...good, amount: good.amount - lostAmount };
            }
          }
          return good;
        });
        
        // Update cargo state
        setCargo(updatedCargo);
        
        // Create description of what was lost
        const lostItems = cargoLost.map(item => `${item.amount} tons of ${item.type}`).join(", ");
        desc = `You accept paying tribute, losing ${lostItems}. The pirates let you go.`;
      }
    }
    if (val === "fight") {
      // Chance/reward scales by defend ships
      const winChance = 0.18 + defendShips * 0.16; // 18% base, each ship +16%
      if (Math.random() < winChance) {
        const base = 350;
        const extra = defendShips * 250;
        const plunder = base + Math.floor(Math.random() * 400) + extra;
        setBalance((b) => b + plunder);
        desc = `Battle ensues! Your fleet prevails, and you win, plundering ${plunder} ₪ from the pirates.`;
      } else {
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          // No cargo to lose, pay coins instead
          const coinLoss = 100 + Math.floor(Math.random() * 200); // 100-300 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc = `Despite your courage, the pirates overpower you. With no cargo to take, they demand ${coinLoss} ₪.`;
        } else {
          // Calculate specific cargo loss before updating state
          let cargoLost: Array<{ type: string; amount: number }> = [];
          const updatedCargo = cargo.map(good => {
            if (good.amount > 0) {
              const lostAmount = 1; // Lose 1 unit from each type that has cargo
              cargoLost.push({ type: good.type, amount: lostAmount });
              return { ...good, amount: Math.max(0, good.amount - lostAmount) };
            }
            return good;
          });
          
          // Update cargo state
          setCargo(updatedCargo);
          
          // Create description of what was lost
          const lostItems = cargoLost.map(item => `${item.amount} tons of ${item.type}`).join(", ");
          desc = `Despite your courage, the pirates overpower you. You lose ${lostItems}.`;
        }
      }
    }
    // --- STORM LOGIC ---
    if (val === "throw") {
      // Always lose 2-3 units (random), distributed among cargo
      const toLose = 2 + Math.floor(Math.random() * 2); // 2 or 3
      // Shuffle type order for some randomness
      const goodTypes = ["Wheat", "Olives", "Copper"].sort(() => Math.random() - 0.5);
      let left = toLose;
      setCargo((prev) =>
        prev.map((good) => {
          if (left > 0 && good.amount > 0) {
            const take = Math.min(good.amount, left);
            left -= take;
            return { ...good, amount: good.amount - take };
          }
          return good;
        })
      );
      desc = `In the chaos, you throw ${toLose} cargo units overboard to keep the ship afloat. You survive the storm.`;
    }
    if (val === "brave") {
      // If current weather is Stormy, risk is higher
      const stormy = weather === "Stormy";
      const lossChance = stormy ? 0.85 : 0.55;
      if (Math.random() < lossChance) {
        // Lose 3-5 units
        let toLose = 3 + Math.floor(Math.random() * 3); // 3,4,5
        const goodTypes = ["Wheat", "Olives", "Copper"].sort(() => Math.random() - 0.5);
        setCargo((prev) =>
          prev.map((good) => {
            if (toLose > 0 && good.amount > 0) {
              const take = Math.min(good.amount, toLose);
              toLose -= take;
              return { ...good, amount: good.amount - take };
            }
            return good;
          })
        );
        desc = stormy
          ? "The storm batters your ship! You lose a large portion of your cargo but survive."
          : "After a tense struggle, some cargo is lost but you make it through.";
      } else {
        desc = "You bravely endure the storm and come out unscathed!";
      }
    }
    return desc;
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

  // CURRENT country's prices for current day:
  const prices = pricesByCountry[country];

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
    handleSail: sailingLogic.startSail, // note: changed name for animation API
    finishSail: sailingLogic.finishSail,
    triggerEvent,
    sailing: sailingLogic.sailing, // new, for animation
    handleEventOption,
    handleRest,
    resetGame,

    // Game flags
    isGameOver,
    maxDeposit: balance,
    maxWithdraw: bank,
    prices, // current country
    pricesByCountry, // all countries
    dayStartHour: DAY_START_HOUR,
    dayEndHour: DAY_END_HOUR,
    sailingPaused: sailingLogic.sailingPaused, // <--------- NEW
    pauseSailing: sailingLogic.pauseSailing,
    resumeSailing: sailingLogic.resumeSailing,

    // Defend ships modal controls
    defendShipsModalOpen,
    setDefendShipsModalOpen,
    setDefendShips,
    defendShips,
    cargoValue,
    // Add setSailingHasEventOccurred so it is available to consumers (like Index.tsx)
    setSailingHasEventOccurred: sailingLogic.setSailingHasEventOccurred,
  };
}

// NOTE: This file is now over 300 lines and should be refactored soon!
