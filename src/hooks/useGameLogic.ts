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
  SHIP_CAPACITY as BASE_SHIP_CAPACITY,
} from "@/utils/gameHelpers";
import { useSailing } from "./useSailing";
import { useCargoExpansion } from "./useCargoExpansion";
import { useEventHandlers } from "./useEventHandlers";
import { useDefendShips } from "./useDefendShips";
import { useMarketTrade } from "./useMarketTrade";

// Main game logic hook refactored!
export function useGameLogic(options?: { onSailSuccess?: (dest: string, hadEvent: boolean) => void }) {
  const [day, setDay] = useState(1);
  const [currentHour, setCurrentHour] = useState(DAY_START_HOUR);
  const [country, setCountry] = useState("Israel");
  const [weather, setWeather] = useState(getRandomWeather());
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [cargo, setCargo] = useState([...INITIAL_CARGO]);
  const [bank, setBank] = useState(0);
  const [pricesByCountry, setPricesByCountry] = useState(() => generatePricesForAllCountries(COUNTRIES));
  const [marketOpen, setMarketOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [sailOpen, setSailOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [eventData, setEventData] = useState<{ type: string; description: string; options?: { label: string; value: string }[] }>({ type: "", description: "", options: [] });

  // --- Hook state splits ---
  const [shipCapacity, setShipCapacity] = useState(BASE_SHIP_CAPACITY);
  const cargoExpansion = useCargoExpansion({ balance, shipCapacity, setShipCapacity });
  const defendShips = useDefendShips();

  // Helper: find cargo good (by type)
  const cargoGood = (type: string) => cargo.find((g) => g.type === type) || { type, amount: 0 };

  const cargoValue = cargo.reduce((acc, cur) => {
    const price = pricesByCountry[country]?.[cur.type] || 0;
    return acc + ((cur.amount || 0) * price);
  }, 0);

  // --- CARGO EXPANSION --- moved offer logic to hook, called here:
  function advanceTime(param: number | "rest") {
    if (param === "rest") {
      setDay((prev) => {
        const newDay = prev + 1;
        cargoExpansion.maybeShowCargoExpansion(newDay);
        setShowDayStartModal(true);
        setJustStartedDay(newDay);
        setNewDayWeather(weather); // weather is set before prices/advance
        return newDay;
      });
      setCurrentHour(DAY_START_HOUR);
      setPricesByCountry(generatePricesForAllCountries(COUNTRIES));
    } else {
      setCurrentHour((prev) => {
        const nextHour = prev + param;
        if (nextHour > DAY_END_HOUR) {
          setDay((d) => {
            const newD = d + 1;
            cargoExpansion.maybeShowCargoExpansion(newD);
            setShowDayStartModal(true);
            setJustStartedDay(newD);
            setNewDayWeather(weather);
            return newD;
          });
          setPricesByCountry(generatePricesForAllCountries(COUNTRIES));
          return DAY_START_HOUR + (nextHour - DAY_END_HOUR);
        }
        return nextHour;
      });
    }
  }

  const sailingLogic = useSailing({
    country,
    currentHour,
    setCountry,
    setWeather,
    advanceTime,
    setSailOpen,
    afterFinish: defendShips.clearDefendShips,
    onSailSuccess: options?.onSailSuccess,
    cargo,
    shipCapacity, // pass shipCapacity to sailing logic
  });

  // Event and market logic into hooks
  const eventHandlers = useEventHandlers({
    cargo,
    setCargo,
    setBalance,
    setEventData,
    setEventOpen,
    sailingLogic,
    pricesByCountry,
    country,
    weather,
    cargoValue,
    shipCapacity,
    balance,
  });

  // --- MARKET TRADE (moved to its own hook) ---
  const { handleMarketTrade } = useMarketTrade({
    cargo,
    setCargo,
    balance,
    setBalance,
    pricesByCountry,
    country
  });

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
  }

  function handleRest() {
    advanceTime("rest");
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

  const cargoForHeader = [
    { type: "Wheat" as const, amount: cargoGood("Wheat").amount },
    { type: "Olives" as const, amount: cargoGood("Olives").amount },
    { type: "Copper" as const, amount: cargoGood("Copper").amount },
  ];

  const isGameOver = day > 7;
  const formattedTime = formatTime(currentHour);
  const prices = pricesByCountry[country];

  // --- Handle Navigation Error event display ---
  // hijack eventHandler to show modal & auto-reroute if Navigation Error triggers
  function triggerEvent(eventType: string) {
    if (eventType === "Navigation Error" && sailingLogic.sailing && sailingLogic.sailing.navErrorTarget) {
      // Special handling: Navigation Error
      const navTarget = sailingLogic.sailing.navErrorTarget;
      setEventData({
        type: "Navigation Error",
        description: `Lost at sea! Strong winds and poor navigation send your ship off course... You end up arriving at ${navTarget} instead!`,
        options: [], // No options, just show OK
      });
      setEventOpen(true);
      // The rest is handled in onEventClose (Index.tsx will call reroute)
      return;
    }
    // regular event logic
    eventHandlers.triggerEvent(eventType);
  }

  // --- New: track when a new day starts ---
  const [showDayStartModal, setShowDayStartModal] = useState(false);
  const [justStartedDay, setJustStartedDay] = useState<number | null>(null);
  const [newDayWeather, setNewDayWeather] = useState<string>("");

  function closeDayStartModal() {
    setShowDayStartModal(false);
    setTimeout(() => {
      // After modal closes, update weather "for the new day"
      setWeather(getRandomWeather());
    }, 300); // Let modal close before weather "changes"
    setJustStartedDay(null);
  }

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
    handleSail: sailingLogic.startSail,
    finishSail: sailingLogic.finishSail,
    triggerEvent, // updated to handle Navigation Error
    sailing: sailingLogic.sailing,
    handleEventOption: eventHandlers.handleEventOption,
    handleRest,
    resetGame,

    isGameOver,
    maxDeposit: balance,
    maxWithdraw: bank,
    prices,
    pricesByCountry,
    dayStartHour: DAY_START_HOUR,
    dayEndHour: DAY_END_HOUR,
    sailingPaused: sailingLogic.sailingPaused,
    pauseSailing: sailingLogic.pauseSailing,
    resumeSailing: sailingLogic.resumeSailing,

    // Defend ships modal controls
    defendShipsModalOpen: defendShips.defendShipsModalOpen,
    setDefendShipsModalOpen: defendShips.setDefendShipsModalOpen,
    setDefendShips: (num: number, pricePerShip: number) => defendShips.setDefendShips(num, pricePerShip, setBalance),
    defendShips: defendShips.defendShips,
    cargoValue,

    setSailingHasEventOccurred: sailingLogic.setSailingHasEventOccurred,

    // New for cargo expansion modal
    shipCapacity,
    cargoExpansionModalOpen: cargoExpansion.cargoExpansionModalOpen,
    setCargoExpansionModalOpen: cargoExpansion.setCargoExpansionModalOpen,
    cargoExpansionOffer: cargoExpansion.cargoExpansionOffer,
    acceptCargoExpansion: () => {
      if (cargoExpansion.cargoExpansionOffer) {
        setBalance(b => b - cargoExpansion.cargoExpansionOffer!.price);
      }
      cargoExpansion.acceptCargoExpansion();
    },
    declineCargoExpansion: cargoExpansion.declineCargoExpansion,

    // Also export rerouteToNavErrorTarget so Index.tsx can use it
    rerouteToNavErrorTarget: sailingLogic.rerouteToNavErrorTarget,

    // New: track when a new day starts
    showDayStartModal,
    justStartedDay,
    newDayWeather: newDayWeather || weather,
    closeDayStartModal,
  };
}
