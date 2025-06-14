
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const COUNTRIES = ["Israel", "Turkey", "Greece", "Cyprus", "Egypt"];
const GOODS = [
  { name: "Wheat", emoji: "🌾" },
  { name: "Olives", emoji: "🫒" },
  { name: "Copper", emoji: "🥉" },
];

// Prices are static by country for now – you can adjust these as needed
const BASE_PRICES: Record<string, Record<string, number>> = {
  Israel:   { Wheat: 10, Olives: 25, Copper: 55 },
  Turkey:   { Wheat: 9,  Olives: 27, Copper: 58 },
  Greece:   { Wheat: 8,  Olives: 28, Copper: 53 },
  Cyprus:   { Wheat: 11, Olives: 26, Copper: 54 },
  Egypt:    { Wheat: 7,  Olives: 23, Copper: 60 },
};

export default function PricesTable() {
  return (
    <div className="my-8 w-full max-w-xl mx-auto animate-fade-in">
      <h3 className="font-semibold text-blue-900 mb-2 text-lg text-center">
        Market Prices — by Country & Good
      </h3>
      <Table className="bg-white/60 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Good</TableHead>
            {COUNTRIES.map((country) => (
              <TableHead key={country}>{country}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {GOODS.map((good) => (
            <TableRow key={good.name}>
              <TableCell>
                <span className="text-xl">{good.emoji}</span>
                <span className="ml-2">{good.name}</span>
              </TableCell>
              {COUNTRIES.map((country) => (
                <TableCell key={country}>
                  {BASE_PRICES[country][good.name].toLocaleString()} <span className="text-green-600 font-semibold">₪</span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
