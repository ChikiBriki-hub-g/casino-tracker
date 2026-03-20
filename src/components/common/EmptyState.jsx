import React from "react";
import { Dices } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
      <Dices size={30} className="mx-auto text-slate-700 mb-3" />
      <p className="text-slate-200 text-sm font-semibold">{title}</p>
      <p className="text-slate-500 text-xs mt-1 max-w-[260px] mx-auto">
        {description}
      </p>
    </div>
  );
}
