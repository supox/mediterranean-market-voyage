import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BankModalProps {
  open: boolean;
  onClose: () => void;
  onBankAction: (type: "deposit" | "withdraw", amount: number) => void;
  maxDeposit: number;
  maxWithdraw: number;
}

const BankModal: React.FC<BankModalProps> = ({
  open,
  onClose,
  onBankAction,
  maxDeposit,
  maxWithdraw,
}) => {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState(0);

  function handleBank() {
    if (
      amount > 0 &&
      ((activeTab === "deposit" && amount <= maxDeposit) ||
        (activeTab === "withdraw" && amount <= maxWithdraw))
    ) {
      onBankAction(activeTab, amount);
      setAmount(0);
      onClose();
    }
  }

  function handleSetAll() {
    setAmount(activeTab === "deposit" ? maxDeposit : maxWithdraw);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="w-full text-center">בנק</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center mb-3">
          <img
            src="/lovable-uploads/f9e7c0ab-4cc9-4a12-ad8c-218d5fa32d0e.png"
            alt="איור בנק מימי הביניים"
            className="w-32 h-32 object-contain rounded-md shadow"
            style={{ background: "#e7dbb2" }}
          />
        </div>
        <div className="flex justify-center gap-3 mb-3 mt-2">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`px-4 py-1 rounded-md border ${activeTab === "deposit" ? "bg-green-600 text-white border-green-600" : "bg-slate-50 border-slate-200"}`}
          >הפקדה</button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`px-4 py-1 rounded-md border ${activeTab === "withdraw" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"}`}
          >משיכה</button>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bank-amount" className="flex items-center justify-between">
            {activeTab === "deposit" ? "סכום הפקדה" : "סכום משיכה"}:
            <button
              type="button"
              className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border ml-2"
              onClick={handleSetAll}
              disabled={
                (activeTab === "deposit" && maxDeposit === 0) ||
                (activeTab === "withdraw" && maxWithdraw === 0)
              }
            >
              הכל
            </button>
          </Label>
          <Input
            id="bank-amount"
            type="number"
            min={1}
            max={activeTab === "deposit" ? maxDeposit : maxWithdraw}
            step={1}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          <span className="text-xs text-gray-400">
            {activeTab === "deposit"
              ? `זמין: ${maxDeposit.toLocaleString()} ₪`
              : `בבנק: ${maxWithdraw.toLocaleString()} ₪`}
          </span>
        </div>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 disabled:opacity-70"
          disabled={amount < 1 || (activeTab === "deposit" ? amount > maxDeposit : amount > maxWithdraw)}
          onClick={handleBank}
        >
          {activeTab === "deposit" ? "הפקד" : "משוך"} {amount > 0 && amount} ₪
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default BankModal;
