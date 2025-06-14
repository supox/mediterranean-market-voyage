
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

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
  Turkey: "/lovable-uploads/6ce58ef6-0bf0-4ddc-8d1a-850b6bcbbc58.png",
  Israel: "/lovable-uploads/6478bfa7-c4ed-43da-83f1-bea9efc387b2.png",
  Egypt: "/lovable-uploads/dff27eb7-df59-4f2e-a825-83b43f2606fe.png",
  Cyprus: "/lovable-uploads/6ce58ef6-0bf0-4ddc-8d1a-850b6bcbbc58.png",
  Greece: "/lovable-uploads/6478bfa7-c4ed-43da-83f1-bea9efc387b2.png",
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
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const price = prices[type as keyof typeof prices];
  const cargoAmount = cargo.find((g) => g.type === type)?.amount || 0;
  const maxAffordable = isBuy
    ? Math.floor(balance / price)
    : cargoAmount;

  const marketImage = countryImages[country];

  useEffect(() => {
    if (open && marketImage && !processedImageUrl) {
      processBackgroundRemoval();
    }
  }, [open, marketImage, processedImageUrl]);

  const processBackgroundRemoval = async () => {
    if (!marketImage || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Load the image
      const response = await fetch(marketImage);
      const blob = await response.blob();
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      const url = URL.createObjectURL(processedBlob);
      setProcessedImageUrl(url);
      
      console.log('Background removal completed successfully');
    } catch (error) {
      console.error('Background removal failed:', error);
      // Keep the original image if processing fails
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [processedImageUrl]);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="w-full text-center">{isBuy ? "קנה סחורה" : "מכור סחורה"}</DialogTitle>
        </DialogHeader>
        {/* Larger, less-padded Image for Market popup */}
        <div className="flex justify-center items-center mb-1">
          {(processedImageUrl || marketImage) ? (
            <img
              src={processedImageUrl || marketImage}
              alt={`שוק ב${country === "Israel" ? "ישראל" : country === "Turkey" ? "טורקיה" : country === "Egypt" ? "מצרים" : country}`}
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          ) : (
            <img
              src="/lovable-uploads/6ce58ef6-0bf0-4ddc-8d1a-850b6bcbbc58.png"
              alt="איור שוק"
              className="w-60 h-44 object-cover rounded-md shadow border"
              style={{ margin: 0, padding: 0 }}
            />
          )}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-md">
              <div className="text-white text-sm">מעבד תמונה...</div>
            </div>
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
