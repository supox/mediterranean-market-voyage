
import { Banknote, MapPin, Ship, Clock, Sun, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";

type Good = { type: "Wheat" | "Olives" | "Copper"; amount: number };

const countryFlags: Record<string, string> = {
  Turkey: "🇹🇷",
  Israel: "🇮🇱",
  Greece: "🇬🇷",
  Cyprus: "🇨🇾",
  Egypt: "🇪🇬",
};

const weatherIcons: Record<string, JSX.Element> = {
  Sunny: <Sun size={20} className="text-yellow-400" />,
  Stormy: <CloudRain size={20} className="text-blue-500" />,
  Overcast: <CloudRain size={20} className="text-gray-400" />,
};

// Use Hebrew day names, starting from Sunday
const DAY_NAMES = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "שבת"
];

function GoodIcon({ name }: { name: string }) {
  if (name === "Wheat") return <span className="text-xl">🌾</span>;
  if (name === "Olives") return <span className="text-xl">🫒</span>;
  if (name === "Copper") return <span className="text-xl">🥉</span>;
  return null;
}

interface GameHeaderProps {
  day: number;
  timeOfDay: string;
  country: string;
  weather: string;
  balance: number;
  cargo: Good[];
}

const GameHeader: React.FC<GameHeaderProps> = ({
  day,
  timeOfDay,
  country,
  weather,
  balance,
  cargo,
}) => {
  const dayIdx = ((day - 1) % 7 + 7) % 7; // ensure 0-based, handles edge cases
  const dayName = DAY_NAMES[dayIdx];
  return (
    <div
      className="w-full bg-gradient-to-b from-blue-100 via-blue-50 to-white border-b border-blue-300 py-2 px-4 flex flex-col md:flex-row items-center md:justify-between gap-4 shadow-sm sticky top-0 z-30"
      dir="rtl"
    >
      {/* Right now: Day & Time */}
      <div className="flex items-center gap-5 text-xl font-medium">
        <span className="flex items-center gap-2">
          <Clock size={20} className="text-blue-700" />
          {dayName}
        </span>
        <span className="flex items-center gap-2 pr-2">
          <Ship size={20} className="text-blue-700" />
          {timeOfDay}
        </span>
      </div>
      {/* Middle: Country & Weather */}
      <div className="flex items-center gap-6 text-lg">
        <span className="flex items-center gap-2 font-semibold">
          <span className="text-2xl" aria-label={country}>{countryFlags[country]}</span>
          <MapPin size={18} className="text-blue-700" />
          {country === "Turkey" ? "טורקיה" : country === "Israel" ? "ישראל" : country === "Egypt" ? "מצרים" : country}
        </span>
        <span className="flex items-center gap-2">
          {weatherIcons[weather] || <Sun size={18} className="text-yellow-300" />}
          <span className="text-base">{weather === "Sunny" ? "שמשי" : weather === "Stormy" ? "סוער" : weather === "Overcast" ? "מעונן" : weather}</span>
        </span>
      </div>
      {/* Left: Balance & Cargo */}
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1 text-green-700 font-bold text-lg">
          <Banknote size={19} />
          {balance.toLocaleString()} ₪
        </span>
        <div className="flex gap-1">
          {cargo.map((good) => (
            <span key={good.type} className="bg-white border border-blue-100 rounded-full px-2 py-0.5 flex items-center gap-1 text-sm shadow-sm">
              <GoodIcon name={good.type} />
              <span className={cn(
                "font-semibold",
                good.type === "Wheat" && "text-amber-700",
                good.type === "Olives" && "text-green-700",
                good.type === "Copper" && "text-orange-800"
              )}>
                {good.amount}
              </span>
              <span className="hidden md:inline">{good.type === "Wheat" ? "חיטה" : good.type === "Olives" ? "זיתים" : good.type === "Copper" ? "נחושת" : good.type}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
