
import { toast } from "@/hooks/use-toast";

interface MarketTradeParams {
  cargo: Array<{ type: string; amount: number }>;
  setCargo: React.Dispatch<React.SetStateAction<Array<{ type: string; amount: number }>>>;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  pricesByCountry: any;
  country: string;
}

export function useMarketTrade({
  cargo,
  setCargo,
  balance,
  setBalance,
  pricesByCountry,
  country
}: MarketTradeParams) {
  function handleMarketTrade(type: string, quantity: number, isBuy: boolean) {
    const price = pricesByCountry[country][type as keyof typeof pricesByCountry[typeof country]];
    if (isBuy) {
      setBalance((b) => b - price * quantity);
      setCargo((prev) => {
        const found = prev.find((g) => g.type === type);
        if (found) {
          return prev.map((g) => g.type === type ? { ...g, amount: g.amount + quantity } : g);
        } else {
          return [...prev, { type, amount: quantity }];
        }
      });
      toast({ title: "עסקה הושלמה", description: `רכשת ${quantity} ${getTypeLabel(type)}.` });
    } else {
      setBalance((b) => b + price * quantity);
      setCargo((prev) =>
        prev.map((g) =>
          g.type === type ? { ...g, amount: Math.max(0, g.amount - quantity) } : g
        )
      );
      toast({ title: "עסקה הושלמה", description: `מכרת ${quantity} ${getTypeLabel(type)}.` });
    }
  }

  function getTypeLabel(type: string): string {
    switch (type) {
      case "Wheat":
        return "חיטה";
      case "Olives":
        return "זיתים";
      case "Copper":
        return "נחושת";
      default:
        return type;
    }
  }

  return {
    handleMarketTrade
  };
}

