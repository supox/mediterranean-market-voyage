
import { useState } from "react";
import { getRandomWeather } from "@/utils/gameHelpers";
import { toast } from "@/hooks/use-toast";

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
}) {
  const [sailing, setSailingState] = useState<null | {
    from: string;
    to: string;
    travelTime: number;
    risk: string | null;
    hasEventOccurred?: boolean;
  }>(null);
  const [sailingPaused, setSailingPausedState] = useState(false);

  function startSail(dest: string, travelDays: number) {
    const travelHours = Math.round(travelDays * 12);
    if (currentHour + travelHours > 20) {
      toast({ title: "Cannot Sail", description: "You can't arrive after 20:00. Please rest until the next day." });
      return;
    }
    
    // Calculate risk probabilities
    const pirateChance = currentHour >= 18 ? 0.3 : 0.2; // 30% at night, 20% during day
    
    // Storm chance is 0 if no cargo, otherwise 20%
    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    const stormChance = totalCargo > 0 ? 0.2 : 0;
    
    // Deserted ships chance is 15%
    const desertedShipsChance = 0.15;
    
    const totalEventChance = pirateChance + stormChance + desertedShipsChance;
    
    let risk = null;
    if (Math.random() < totalEventChance) {
      // Determine which event occurs based on weighted probability
      const eventRoll = Math.random() * totalEventChance;
      if (eventRoll < pirateChance) {
        risk = "Pirate";
      } else if (eventRoll < pirateChance + stormChance) {
        risk = "Storm";
      } else {
        risk = "Deserted Ships";
      }
    }
    
    setSailingState({ from: country, to: dest, travelTime: travelDays, risk, hasEventOccurred: false });
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
    // Call onSailSuccess and pass the actual hasEventOccurred status
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

  return {
    sailing,
    sailingPaused,
    startSail,
    pauseSailing,
    resumeSailing,
    finishSail,
    setSailingHasEventOccurred,
  };
}
