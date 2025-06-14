
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bank</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 mb-3 mt-2">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`px-4 py-1 rounded-md border ${activeTab === "deposit" ? "bg-green-600 text-white border-green-600" : "bg-slate-50 border-slate-200"}`}
          >Deposit</button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`px-4 py-1 rounded-md border ${activeTab === "withdraw" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 border-slate-200"}`}
          >Withdraw</button>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bank-amount">{activeTab === "deposit" ? "Deposit Amount" : "Withdraw Amount"}:</Label>
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
              ? `Available: ${maxDeposit.toLocaleString()} ₤`
              : `In Bank: ${maxWithdraw.toLocaleString()} ₤`}
          </span>
        </div>
        <button
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 disabled:opacity-70"
          disabled={amount < 1 || (activeTab === "deposit" ? amount > maxDeposit : amount > maxWithdraw)}
          onClick={handleBank}
        >
          {activeTab === "deposit" ? "Deposit" : "Withdraw"} {amount > 0 && amount} ₤
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default BankModal;
