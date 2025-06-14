
import { Ship } from "lucide-react";
import { LOCATIONS } from "@/utils/mapConfig";

type MapShipProps = {
  from: string;
  to: string;
  animProgress: number;
  country?: string;
};

export default function MapShip({ from, to, animProgress, country }: MapShipProps) {
  if (!from || !to) return null;
  const src = LOCATIONS[from];
  const dest = LOCATIONS[to];
  if (!src || !dest) return null;
  const mx = (src.x + dest.x) / 2;
  const my = (src.y + dest.y) / 2 - 55;
  const t = animProgress;
  const x = (1 - t) * (1 - t) * src.x + 2 * (1 - t) * t * mx + t * t * dest.x;
  const y = (1 - t) * (1 - t) * src.y + 2 * (1 - t) * t * my + t * t * dest.y;

  return (
    <g>
      <circle cx={x} cy={y - 21} r={23} fill="#e9fbf5CC" opacity={0.54} />
      <foreignObject x={x - 17} y={y - 38} width="34" height="34">
        <div className="flex justify-center items-center w-full h-full animate-pulse">
          <Ship size={28} color="#2563eb" style={{ strokeWidth: 2.5 }} />
        </div>
      </foreignObject>
    </g>
  );
}
