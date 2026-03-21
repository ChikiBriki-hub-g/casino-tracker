import React from "react";
import { Dices } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="surface-card-muted border-dashed px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80">
        <Dices size={26} className="text-slate-600" />
      </div>
      <p className="text-slate-200 text-sm font-semibold">{title}</p>
      {description && (
        <p className="text-slate-500 text-xs mt-1 max-w-[280px] mx-auto leading-5">
          {description}
        </p>
      )}
    </div>
  );
}
