import React from "react";
import {
  MinusCircle,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  History,
  Trash2,
} from "lucide-react";
import EmptyState from "../../../components/common/EmptyState";

export default function FinanceTab({
  stats,
  formatMoney,
  openModal,
  transactions,
  formatDate,
  handleDeleteTransaction,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${stats.isProfitable ? "bg-emerald-900/20 border border-emerald-500/30" : "bg-rose-900/20 border border-rose-500/30"}`}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          {stats.isProfitable ? (
            <TrendingUp size={100} />
          ) : (
            <TrendingDown size={100} />
          )}
        </div>
        <p className="text-sm font-medium text-slate-400 mb-1">
          Чистая прибыль (Профит)
        </p>
        <h2
          className={`text-4xl font-bold tracking-tight ${stats.isProfitable ? "text-emerald-400" : "text-rose-400"}`}
        >
          {stats.netProfit > 0 ? "+" : ""}
          {formatMoney(stats.netProfit)}
        </h2>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">ROI:</span>
            <span
              className={`font-semibold ${stats.isProfitable ? "text-emerald-400" : "text-rose-400"}`}
            >
              {stats.roi}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="summary-card">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <MinusCircle size={18} />
            <span className="text-sm font-medium">Депозиты</span>
          </div>
          <p className="text-xl font-semibold text-slate-200">
            {formatMoney(stats.totalDeposits)}
          </p>
        </div>
        <div className="summary-card">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <PlusCircle size={18} />
            <span className="text-sm font-medium">Выводы</span>
          </div>
          <p className="text-xl font-semibold text-slate-200">
            {formatMoney(stats.totalWithdrawals)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={() => openModal("deposit")}
          className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-indigo-900/20"
        >
          <MinusCircle size={28} />
          <span className="font-semibold tracking-wide">Депозит</span>
        </button>
        <button
          onClick={() => openModal("withdraw")}
          className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <PlusCircle size={28} />
          <span className="font-semibold tracking-wide">Вывод</span>
        </button>
      </div>

      <div className="pt-4">
        <div className="section-header mb-4">
          <History size={20} className="text-slate-400" />
          <h3 className="section-title">Операции</h3>
        </div>
        {transactions.length === 0 ? (
          <EmptyState title="Операций пока нет" />
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="surface-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${t.type === "deposit" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                  >
                    {t.type === "deposit" ? (
                      <TrendingDown size={18} />
                    ) : (
                      <TrendingUp size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{t.note}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-bold ${t.type === "deposit" ? "text-rose-400" : "text-emerald-400"}`}
                  >
                    {t.type === "deposit" ? "-" : "+"}
                    {formatMoney(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
