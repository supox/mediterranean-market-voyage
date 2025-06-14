
import { Banknote, Ship, Store, Clock } from "lucide-react";

// Hebrew country names for reference
const COUNTRY_LABELS: Record<string, string> = {
  Turkey: "טורקיה",
  Israel: "ישראל",
  Egypt: "מצרים",
};

interface ActionPanelProps {
  onMarket: () => void;
  onBank: () => void;
  onSail: () => void;
  onRest: () => void;
  disabled?: boolean;
  country: string;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  onMarket,
  onBank,
  onSail,
  onRest,
  disabled,
  country,
}) => {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mt-4" dir="rtl">
      <button
        onClick={onMarket}
        className="flex flex-col items-center p-5 bg-gradient-to-b from-yellow-50 to-white border border-yellow-100 rounded-xl shadow hover:scale-[1.03] focus:ring-2 focus:ring-blue-200 transition-all duration-150"
        disabled={disabled}
      >
        <Store size={34} className="mb-2 text-yellow-700" />
        <span className="font-semibold text-lg">לך לשוק</span>
      </button>
      <button
        onClick={onBank}
        className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-green-50 to-white border border-green-100 rounded-xl shadow hover:scale-[1.03] focus:ring-2 focus:ring-green-200 transition-all duration-150"
        disabled={disabled}
      >
        <Banknote size={34} className="mb-2 text-green-700" />
        <span className="font-semibold text-lg">בנק</span>
      </button>
      <button
        onClick={onSail}
        className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-xl shadow hover:scale-[1.03] focus:ring-2 focus:ring-blue-200 transition-all duration-150"
        disabled={disabled}
      >
        <Ship size={34} className="mb-2 text-blue-700" />
        <span className="font-semibold text-lg">הפלג</span>
      </button>
      <button
        onClick={onRest}
        className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-xl shadow hover:scale-[1.03] focus:ring-2 focus:ring-gray-200 transition-all duration-150"
        disabled={disabled}
      >
        <Clock size={34} className="mb-2 text-gray-600" />
        <span className="font-semibold text-lg">לנוח עד למחרת</span>
      </button>
    </div>
  );
};

export default ActionPanel;
