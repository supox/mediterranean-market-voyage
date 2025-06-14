

// Utility for reproducible prices in the correct ranges, always multiples of 5
export function generatePrices() {
  // Wheat: 35-200, Olives: 70-400, Copper: 150-1000 (all multiples of 5)
  function price(min: number, max: number) {
    const steps = Math.floor((max - min) / 5) + 1;
    const value = min + Math.floor(Math.random() * steps) * 5;
    return value;
  }

  return {
    Wheat: price(35, 200),
    Olives: price(70, 400),
    Copper: price(150, 1000),
  };
}

