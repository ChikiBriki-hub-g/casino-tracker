import React from "react";
import FinanceTab from "./FinanceTab";

export default function FinanceSection({ finance, currency }) {
  return (
    <>
      <FinanceTab
        stats={finance.stats}
        formatMoney={finance.formatMoney}
        openModal={finance.openModal}
        transactions={finance.visibleTransactions}
        transactionFilter={finance.transactionFilter}
        setTransactionFilter={finance.setTransactionFilter}
        formatDate={finance.formatDate}
        handleDeleteTransaction={finance.handleDeleteTransaction}
      />

      {finance.isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={finance.closeModal}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`p-4 text-center font-bold text-lg ${
                finance.transactionType === "deposit"
                  ? "bg-rose-900/30 text-rose-400 border-b border-rose-900/50"
                  : "bg-emerald-900/30 text-emerald-400 border-b border-emerald-900/50"
              }`}
            >
              {finance.transactionType === "deposit"
                ? "Новый депозит"
                : "Новый вывод"}
            </div>
            <form
              onSubmit={finance.handleAddTransaction}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Сумма ({currency})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  value={finance.amount}
                  onChange={(event) => finance.setAmount(event.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  placeholder="Например, 5,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Заметка (Опционально)
                </label>
                <input
                  type="text"
                  value={finance.note}
                  onChange={(event) => finance.setNote(event.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  placeholder="Название проекта или слота"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={finance.closeModal}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors ${
                    finance.transactionType === "deposit"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
