import React from "react";
import {
  Gamepad2,
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
  transactionFilter,
  setTransactionFilter,
  formatDate,
  handleDeleteTransaction,
}) {
  const handleOpenModal = (type) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    openModal(type);
  };

  const filters = [
    { id: "all", label: "Все" },
    { id: "manual", label: "Ручные" },
    { id: "slots", label: "Из слотов" },
  ];

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
          className={`whitespace-nowrap text-4xl font-bold tracking-tight ${stats.isProfitable ? "text-emerald-400" : "text-rose-400"}`}
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
            <span className="whitespace-nowrap">
              {formatMoney(stats.totalDeposits)}
            </span>
          </p>
        </div>
        <div className="summary-card">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <PlusCircle size={18} />
            <span className="text-sm font-medium">Выводы</span>
          </div>
          <p className="text-xl font-semibold text-slate-200">
            <span className="whitespace-nowrap">
              {formatMoney(stats.totalWithdrawals)}
            </span>
          </p>
        </div>
        <div className="summary-card col-span-2">
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Gamepad2 size={18} />
            <span className="text-sm font-medium">Слоты</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p
              className={`whitespace-nowrap text-xl font-semibold ${stats.totalSlotResult >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {stats.totalSlotResult > 0 ? "+" : ""}
              {formatMoney(stats.totalSlotResult)}
            </p>
            <p className="whitespace-nowrap text-xs text-slate-500">
              +{formatMoney(stats.totalSlotWins)} / -
              {formatMoney(stats.totalSlotLosses)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={handleOpenModal("deposit")}
          className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-indigo-900/20"
        >
          <MinusCircle size={28} />
          <span className="font-semibold tracking-wide">Депозит</span>
        </button>
        <button
          type="button"
          onClick={handleOpenModal("withdraw")}
          className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <PlusCircle size={28} />
          <span className="font-semibold tracking-wide">Вывод</span>
        </button>
      </div>

      <div className="pt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="section-header">
            <History size={20} className="text-slate-400" />
            <h3 className="section-title">Операции</h3>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTransactionFilter(filter.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                  transactionFilter === filter.id
                    ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-200"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
                    className={`p-2 rounded-full ${
                      t.type === "deposit"
                        ? "bg-rose-500/10 text-rose-500"
                        : t.type === "withdraw"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : t.netAmount >= 0
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {t.type === "deposit" ? (
                      <TrendingDown size={18} />
                    ) : t.type === "withdraw" ? (
                      <TrendingUp size={18} />
                    ) : (
                      <Gamepad2 size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{t.note}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{formatDate(t.date)}</span>
                      {t.type === "slot" && (
                        <>
                          <span>·</span>
                          <span>{t.groupName}</span>
                          {t.provider && (
                            <>
                              <span>·</span>
                              <span>{t.provider}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-3">
                  <span
                    className={`whitespace-nowrap text-right font-bold ${
                      t.netAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {t.netAmount > 0 ? "+" : "-"}
                    {formatMoney(t.amount)}
                  </span>
                  {t.source === "manual" ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className="whitespace-nowrap rounded-full border border-slate-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Слоты
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
