
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NameInputModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  balance: number;
}

const NameInputModal: React.FC<NameInputModalProps> = ({ open, onSubmit, onCancel, balance }) => {
  const [name, setName] = useState("");
  const [dirty, setDirty] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDirty(true);
    if (name.trim().length < 1) return;
    onSubmit(name.trim());
    setName("");
    setDirty(false);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-lg w-full text-center font-bold text-blue-800">הצלחת להיכנס לעשרת הגדולים!</DialogTitle>
        </DialogHeader>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col gap-2 items-center justify-center">
            <span className="text-base">הזן את שמך ללוח התוצאות:</span>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="שם מלא"
              autoFocus
              maxLength={24}
              dir="rtl"
            />
            {dirty && !name.trim() && (
              <span className="text-xs text-red-500">יש להזין שם.</span>
            )}
            <Button type="submit" className="w-full mt-2" disabled={!name.trim()}>
              שמור והצג תוצאות
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NameInputModal;
