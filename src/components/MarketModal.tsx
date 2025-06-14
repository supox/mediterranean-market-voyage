
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Helper to get a random price between min and max (inclusive), rounded to nearest 5
function randomPrice(min: number, max: number) {
  const rand = Math.floor(Math.random() * ((max - min) / 5 + 1));
  return min + rand * 5;
}

const GOODS = [
  { type: "Wheat", icon: "🌾", hebrew: "חיטה" },
  { type: "Olives", icon: "🫒", hebrew: "זיתים" },
  { type: "Copper", icon: "🥉", hebrew: "נחושת" },
];

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  onTrade: (type: string, quantity: number, isBuy: boolean) => void;
  balance: number;
  cargo: { type: string; amount: number }[];
  prices: { Wheat: number; Olives: number; Copper: number };
  country: string;
}

const countryImages: { [key: string]: string } = {
  Turkey: "/lovable-uploads/555178aa-dd82-4f44-bd57-d4ac8d844432.png",
  Israel: "/lovable-uploads/267df53a-1764-4fa5-a07e-1e268627d5cc.png",
  Egypt: "/lovable-uploads/0213cf6c-2d82-4e47-915c-cb2d6d835374.png",
  Cyprus: "/lovable-uploads/a344e5b0-c4ac-472f-9051-d5dd76e757f5.png",
  Greece: "/lovable-uploads/a344e5b0-c4ac-472f-9051-d5dd76e757f5.png",
};

const MarketModal: React.FC<MarketModalProps> = ({
  open,
  onClose,
  onTrade,
  balance,
  cargo,
  prices,
  country,
}) => {
  const [type, setType] = useState("Wheat");
  const [quantity, setQuantity] = useState(0);
  const [isBuy, setIsBuy] = useState(true);

  const price = prices[type as keyof typeof prices];
  const cargoAmount = cargo.find((g) => g.type === type)?.amount || 0;
  const maxAffordable = isBuy
    ? Math.floor(balance / price)
    : cargoAmount;

  function handleTrade() {
    if (quantity > 0 && quantity <= maxAffordable) {
      onTrade(type, quantity, isBuy);
      setQuantity(0);
      onClose();
    }
  }

  function handleBuyAll() {
    setIsBuy(true);
    setQuantity(maxAffordable);
  }

  function handleSellAll() {
    setIsBuy(false);
    setQuantity(maxAffordable);
  }

  const marketImage = countryImages[country];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="w-full text-center">{isBuy ? "קנה סחורה" : "מכור סחורה"}</DialogTitle>
        </DialogHeader>
        {/* Larger, less-padded Image for Market popup */}
        <div className="flex justify-center items-center mb-1" style={{ background: "#f2e6c9", borderRadius: 12, minHeight: 0 }}>
          {marketImage ? (
            <img
              src={marketImage}
              alt={`שוק ב${country === "Israel" ? "ישראל" : country === "Turkey" ? "טורקיה" : country === "Egypt" ? "מצרים" : country}`}
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          ) : (
            <img
              src="/lovable-uploads/a344e5b0-c4ac-472f-9051-d5dd76e757f5.png"
              alt="איור שוק"
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          )}
        </div>
        <div className="flex gap-3 items-center mt-1 mb-2">
          {GOODS.map((g) => (
            <button
              key={g.type}
              onClick={() => setType(g.type)}
              className={`p-2 rounded-xl text-xl transition bg-white border ${
                type === g.type ? "border-blue-500 shadow" : "border-slate-100"
              } hover:bg-blue-50`}
            >
              <span role="img" aria-label={g.type}>
                {g.icon}
              </span>
              <span className="ml-2 text-base">{g.hebrew}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5 mb-2">
          <Label>מחיר:</Label>
          <span className="font-semibold">
            {price.toLocaleString()} ₪ / טון
          </span>
        </div>
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => setIsBuy(true)}
            className={`px-4 py-1 rounded-md border ${
              isBuy
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            קנייה
          </button>
          <button
            onClick={() => setIsBuy(false)}
            className={`px-4 py-1 rounded-md border ${
              !isBuy
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            מכירה
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">כמות (טון):</Label>
          <div className="flex items-center gap-2">
            <Input
              id="quantity"
              type="number"
              step={1}
              min={1}
              max={maxAffordable}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24"
            />
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition disabled:opacity-60"
              disabled={isBuy ? maxAffordable <= 0 : maxAffordable <= 0}
              onClick={isBuy ? handleBuyAll : handleSellAll}
            >
              {isBuy ? "קנה הכל" : "מכור הכל"}
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {isBuy
              ? `ניתן לקנות עד ${maxAffordable} טון`
              : `ניתן למכור עד ${maxAffordable} טון`}
          </span>
        </div>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 disabled:opacity-70"
          disabled={quantity < 1 || quantity > maxAffordable}
          onClick={handleTrade}
        >
          {isBuy ? "קנה" : "מכור"} {quantity > 0 && quantity} {GOODS.find(g => g.type === type)?.hebrew}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default MarketModal;
