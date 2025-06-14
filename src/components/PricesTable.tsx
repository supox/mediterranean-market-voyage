
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface PricesTableProps {
  pricesByCountry: Record<string, { Wheat: number; Olives: number; Copper: number }>;
  country: string;
}

const COUNTRIES = ["Israel", "Turkey", "Egypt"];
const GOODS = [
  { name: "Wheat", emoji: "🌾", hebrew: "חיטה" },
  { name: "Olives", emoji: "🫒", hebrew: "זיתים" },
  { name: "Copper", emoji: "🥉", hebrew: "נחושת" },
];

export default function PricesTable({ pricesByCountry, country }: PricesTableProps) {
  return (
    <div className="my-8 w-full max-w-xl mx-auto animate-fade-in" dir="rtl">
      <h3 className="font-semibold text-blue-900 mb-2 text-lg text-center">
        מחירי שוק — לפי מדינה ומוצר
      </h3>
      <Table className="bg-white/60 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">מוצר</TableHead>
            {COUNTRIES.map((c) => (
              <TableHead key={c} className="text-center">
                {c === "Israel" ? "ישראל" : c === "Turkey" ? "טורקיה" : c === "Egypt" ? "מצרים" : c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {GOODS.map((good) => (
            <TableRow key={good.name}>
              <TableCell>
                <span className="text-xl">{good.emoji}</span>
                <span className="ml-2">{good.hebrew}</span>
              </TableCell>
              {COUNTRIES.map((c) => (
                <TableCell
                  key={c}
                  className={
                    country === c
                      ? "bg-blue-100 font-bold text-blue-900 text-center"
                      : "text-center text-gray-600"
                  }
                >
                  {pricesByCountry[c][good.name as "Wheat" | "Olives" | "Copper"].toLocaleString()} ₪
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
