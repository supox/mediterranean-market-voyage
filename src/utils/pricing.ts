
// Utility for reproducible prices in the correct ranges, always multiples of 5

const PRICE_RANGE = {
  Wheat: { min: 35, max: 200 },
  Olives: { min: 70, max: 400 },
  Copper: { min: 150, max: 1000 },
};

export function generatePricesForCountry() {
  function priceForGood(good: keyof typeof PRICE_RANGE) {
    const { min, max } = PRICE_RANGE[good];
    const steps = Math.floor((max - min) / 5) + 1;
    return min + Math.floor(Math.random() * steps) * 5;
  }
  return {
    Wheat: priceForGood("Wheat"),
    Olives: priceForGood("Olives"),
    Copper: priceForGood("Copper"),
  };
}

// Returns prices for all countries in the format { [country]: {good: price, ...}, ... }
export function generatePricesForAllCountries(
  countries: string[] = ["Israel", "Turkey", "Greece", "Cyprus", "Egypt"]
) {
  const result: Record<string, { Wheat: number; Olives: number; Copper: number }> = {};
  for (const country of countries) {
    result[country] = generatePricesForCountry();
  }
  return result;
}
