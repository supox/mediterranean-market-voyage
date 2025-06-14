
export const LOCATIONS = {
  Turkey:  { x: 395, y: 80 },
  Greece:  { x: 68, y: 82 },
  Cyprus:  { x: 287, y: 168 },
  Israel:  { x: 347, y: 236 },
  Egypt:   { x: 163, y: 303 },
};

export const FLAG = {
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Cyprus: "🇨🇾",
  Israel: "🇮🇱",
  Egypt: "🇪🇬",
};

export function getCurve(from: {x:number, y:number}, to: {x:number, y:number}) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 55;
  return `M ${from.x} ${from.y} Q ${mx} ${my}, ${to.x} ${to.y}`;
}
