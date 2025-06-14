
export const INITIAL_BALANCE = 5000;
export const INITIAL_CARGO = [
  { type: "Wheat", amount: 0 },
  { type: "Olives", amount: 0 },
  { type: "Copper", amount: 0 },
];
export const WEATHER_TYPES = ["Sunny", "Stormy", "Overcast"];
export const COUNTRIES = ["Israel", "Turkey", "Egypt"];
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

// use "BASE_SHIP_CAPACITY" for the original... game will now dynamically set ship capacity using state
export const SHIP_CAPACITY = 100;

export function getRandomWeather() {
  return WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
}

export function formatTime(hour: number) {
  return hour.toString().padStart(2, "0") + ":00";
}
