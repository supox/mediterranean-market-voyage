
import { useState } from "react";
import { getRandomWeather } from "@/utils/gameHelpers";
import { toast } from "@/hooks/use-toast";
import { generatePricesForAllCountries } from "@/utils/pricing";

export function useSailing({
  country,
  currentHour,
  setCountry,
  setWeather,
  advanceTime,
  setSailOpen,
  afterFinish, // optional callback after journey end (e.g. to reset defend ships)
  onSailSuccess, // optional callback when sailing completes without event
}: {
  country: string;
  currentHour: number;
  setCountry: (name: string) => void;
  setWeather: (weather: string) => void;
  advanceTime: (hours: number) => void;
  setSailOpen: (open: boolean) => void;
  afterFinish?: () => void;
  onSailSuccess?: (dest: string) => void;
}) {
  // Extend sailing state to include hasEventOccurred
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
    const risk = Math.random() < (currentHour >= 18 ? 0.7 : 0.5) ? "Pirate" : null;
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
    // Check if an event occurred during sailing; if not, trigger success event
    if (onSailSuccess && sailing && !sailing.hasEventOccurred) {
      onSailSuccess(dest);
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
