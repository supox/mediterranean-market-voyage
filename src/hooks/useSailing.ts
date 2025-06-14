
import { useState } from "react";
import { getRandomWeather } from "@/utils/gameHelpers";
import { toast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/utils/gameHelpers";

export function useSailing({
  country,
  currentHour,
  setCountry,
  setWeather,
  advanceTime,
  setSailOpen,
  afterFinish,
  onSailSuccess,
  cargo,
  shipCapacity,
}: {
  country: string;
  currentHour: number;
  setCountry: (name: string) => void;
  setWeather: (weather: string) => void;
  advanceTime: (hours: number) => void;
  setSailOpen: (open: boolean) => void;
  afterFinish?: () => void;
  onSailSuccess?: (dest: string, hadEvent: boolean) => void;
  cargo: Array<{ type: string; amount: number }>;
  shipCapacity: number;
}) {
  const [sailing, setSailingState] = useState<null | {
    from: string;
    to: string;
    travelTime: number;
    risk: string | null;
    hasEventOccurred?: boolean;
    navErrorTarget?: string | null;
  }>(null);
  const [sailingPaused, setSailingPausedState] = useState(false);

  function startSail(dest: string, travelDays: number) {
    const travelHours = Math.round(travelDays * 12);
    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    if (totalCargo > shipCapacity) {
      toast({ title: "Too Much Cargo", description: `Your ship can only hold ${shipCapacity} tons. Sell or store excess cargo before setting sail.` });
      return;
    }
    if (currentHour + travelHours > 20) {
      toast({ title: "Cannot Sail", description: "You can't arrive after 20:00. Please rest until the next day." });
      return;
    }

    // Event chances
    const pirateChance = currentHour >= 18 ? 0.3 : 0.2;
    const stormChance = totalCargo > 0 ? 0.2 : 0;
    const desertedShipsChance = 0.15;
    const navigationErrorChance = 0.05;

    const totalEventChance = pirateChance + stormChance + desertedShipsChance + navigationErrorChance;

    let risk = null;
    let navErrorTarget: string | null = null;

    if (Math.random() < totalEventChance) {
      // Determine which event occurs based on weighted probability
      const eventRoll = Math.random() * totalEventChance;
      if (eventRoll < pirateChance) {
        risk = "Pirate";
      } else if (eventRoll < pirateChance + stormChance) {
        risk = "Storm";
      } else if (eventRoll < pirateChance + stormChance + desertedShipsChance) {
        risk = "Deserted Ships";
      } else {
        // Navigation Error event: must reroute to one of the other countries
        risk = "Navigation Error";
        // Only consider the two countries different from the target
        const options = COUNTRIES.filter(c => c !== country && c !== dest);
        navErrorTarget = options[Math.floor(Math.random() * options.length)];
      }
    }

    setSailingState({ from: country, to: dest, travelTime: travelDays, risk, hasEventOccurred: false, navErrorTarget });
    setSailingPausedState(false);
    setSailOpen(false);
  }

  function setSailingHasEventOccurred(val: boolean) {
    setSailingState(sailing =>
      sailing ? { ...sailing, hasEventOccurred: val } : sailing
    );
  }

  function pauseSailing() {
    setSailingPausedState(true);
  }
  function resumeSailing() {
    setSailingPausedState(false);
  }
  function finishSail(dest: string, travelDays: number) {
    if (onSailSuccess && sailing) {
      onSailSuccess(dest, sailing.hasEventOccurred || false);
    }
    setCountry(dest);
    setWeather(getRandomWeather());
    advanceTime(Math.round(travelDays * 12));
    setSailingState(null);
    setSailingPausedState(false);
    if (afterFinish) afterFinish();
  }

  // New method: for nav error, update state so destination is replaced and continue
  function rerouteToNavErrorTarget() {
    setSailingState(sailing => {
      if (!sailing || !sailing.navErrorTarget) return sailing;
      // Update to point to navErrorTarget, but treat as full trip
      return {
        ...sailing,
        to: sailing.navErrorTarget,
        navErrorTarget: null, // clear
        // Optionally: re-use travelTime as full travel (so ship animates all the way)
      };
    });
  }

  return {
    sailing,
    sailingPaused,
    startSail,
    pauseSailing,
    resumeSailing,
    finishSail,
    setSailingHasEventOccurred,
    rerouteToNavErrorTarget, // for Navigation Error
  };
}

