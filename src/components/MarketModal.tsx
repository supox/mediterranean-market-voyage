
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const MOCK_PRICES = {
  Wheat: Math.floor(Math.random() * 10 + 8),
  Olives: Math.floor(Math.random() * 25 + 18),
  Copper: Math.floor(Math.random() * 55 + 44),
};

const GOODS = [
  { type: "Wheat", icon: "🌾" },
  { type: "Olives", icon: "🫒" },
  { type: "Copper", icon: "🥉" },
];

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
  onTrade: (type: string, quantity: number, isBuy: boolean) => void;
  balance: number;
}

const MarketModal: React.FC<MarketModalProps> = ({ open, onClose, onTrade, balance }) => {
  const [type, setType] = useState("Wheat");
  const [quantity, setQuantity] = useState(0);
  const [isBuy, setIsBuy] = useState(true);

  const price = MOCK_PRICES[type as keyof typeof MOCK_PRICES];
  const maxAffordable = isBuy ? Math.floor(balance / price) : 99;

  function handleTrade() {
    if (quantity > 0 && quantity <= maxAffordable) {
      onTrade(type, quantity, isBuy);
      setQuantity(0);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isBuy ? "Buy" : "Sell"} Goods</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 items-center mt-1 mb-2">
          {GOODS.map(g => (
            <button
              key={g.type}
              onClick={() => setType(g.type)}
              className={`p-2 rounded-xl text-xl transition bg-white border ${type === g.type ? "border-blue-500 shadow" : "border-slate-100"} hover:bg-blue-50`}
            >
              <span role="img" aria-label={g.type}>{g.icon}</span>
              <span className="ml-2 text-base">{g.type}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5 mb-2">
          <Label>Price:</Label>
          <span className="font-semibold">{price.toLocaleString()} ₤ / ton</span>
        </div>
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => setIsBuy(true)}
            className={`px-4 py-1 rounded-md border ${isBuy ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"}`}
          >Buy</button>
          <button
            onClick={() => setIsBuy(false)}
            className={`px-4 py-1 rounded-md border ${!isBuy ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"}`}
          >Sell</button>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">Amount (tons):</Label>
          <Input
            id="quantity"
            type="number"
            step={1}
            min={1}
            max={maxAffordable}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-gray-400">
            {isBuy ? `You can buy up to ${maxAffordable} tons` : `Max sell: ${maxAffordable} tons`}
          </span>
        </div>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 disabled:opacity-70"
          disabled={quantity < 1 || quantity > maxAffordable}
          onClick={handleTrade}
        >
          {isBuy ? "Buy" : "Sell"} {quantity > 0 && quantity} {type}
        </button>
      </DialogContent>
    </Dialog>
  )
}

export default MarketModal;
