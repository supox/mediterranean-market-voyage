
const PRICE_RANGE = {
  Wheat: { min: 35, max: 300, step: 5 },
  Olives: { min: 250, max: 750, step: 10 },
  Copper: { min: 1500, max: 5500, step: 100 },
};

export function generatePricesForCountry() {
  function priceForGood(good: keyof typeof PRICE_RANGE) {
    const { min, max, step } = PRICE_RANGE[good];
    const steps = Math.floor((max - min) / step) + 1;
    return min + Math.floor(Math.random() * steps) * step;
  }
  return {
    Wheat: priceForGood("Wheat"),
    Olives: priceForGood("Olives"),
    Copper: priceForGood("Copper"),
  };
}

// Only generate prices for Egypt, Israel, Turkey by default
export function generatePricesForAllCountries(
  countries: string[] = ["Israel", "Turkey", "Egypt"]
) {
  const result: Record<string, { Wheat: number; Olives: number; Copper: number }> = {};
  for (const country of countries) {
    result[country] = generatePricesForCountry();
  }
  return result;
}
