
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
  { type: "Wheat", icon: "🌾" },
  { type: "Olives", icon: "🫒" },
  { type: "Copper", icon: "🥉" },
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
  Turkey: "/lovable-uploads/b04ca857-7db0-4cc0-b5f5-5a56f7541f3a.png",
  Israel: "/lovable-uploads/bb13a525-8f06-4c12-92fb-2a415ea252d7.png", // <-- Updated Israel image
  Egypt: "/lovable-uploads/23ac5e36-2a0e-4ee3-9659-01a0cbe024f9.png",
  // Add more here as you upload for other countries
};

const MarketModal: React.FC<MarketModalProps> = ({ open, onClose, onTrade, balance, cargo, prices, country }) => {
  const [type, setType] = useState("Wheat");
  const [quantity, setQuantity] = useState(0);
  const [isBuy, setIsBuy] = useState(true);

  const price = prices[type as keyof typeof prices];
  const cargoAmount = cargo.find(g => g.type === type)?.amount || 0;
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

  const marketImage = countryImages[country];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isBuy ? "Buy" : "Sell"} Goods</DialogTitle>
        </DialogHeader>
        {/* Larger, less-padded Image for Market popup */}
        <div className="flex justify-center items-center mb-1" style={{ background: "#f2e6c9", borderRadius: 12, minHeight: 0 }}>
          {marketImage ? (
            <img
              src={marketImage}
              alt={`Marketplace in ${country}`}
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          ) : (
            <img
              src="/lovable-uploads/b9972723-2bb9-4b5c-a63c-fff1ab433467.png"
              alt="Marketplace Illustration"
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          )}
        </div>
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
            {isBuy
              ? `You can buy up to ${maxAffordable} tons`
              : `You can sell up to ${maxAffordable} tons`}
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

