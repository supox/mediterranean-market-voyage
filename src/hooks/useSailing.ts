
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
}) {
  const [sailing, setSailingState] = useState<null | {
    from: string;
    to: string;
    travelTime: number;
    risk: string | null;
  }>(null);
  const [sailingPaused, setSailingPausedState] = useState(false);

  function startSail(dest: string, travelDays: number) {
    const travelHours = Math.round(travelDays * 12);
    if (currentHour + travelHours > 20) {
      toast({ title: "Cannot Sail", description: "You can't arrive after 20:00. Please rest until the next day." });
      return;
    }
    const risk = Math.random() < (currentHour >= 18 ? 0.7 : 0.5) ? "Pirate" : null;
    setSailingState({ from: country, to: dest, travelTime: travelDays, risk });
    setSailingPausedState(false);
    setSailOpen(false);
  }

  function pauseSailing() {
    setSailingPausedState(true);
  }
  function resumeSailing() {
    setSailingPausedState(false);
  }
  function finishSail(dest: string, travelDays: number) {
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
  };
}
