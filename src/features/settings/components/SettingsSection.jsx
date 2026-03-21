import React, { useRef, useState } from "react";
import {
  Cloud,
  Download,
  Upload,
  RefreshCcw,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

function StatCard({ label, value, hint }) {
  return (
    <div className="summary-card">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function SettingsSection({
  currency,
  setCurrency,
  currencyOptions,
  theme,
  setTheme,
  keepQuickContext,
  setKeepQuickContext,
  saveStatus,
  financeCount,
  sessionGroupCount,
  slotRecordCount,
  customSlotCount,
  favoriteSlotCount,
  providerCount,
  handleExportData,
  handleImportData,
  handleResetAllData,
  importStatus,
}) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-indigo-400" />
          <h3 className="text-base font-semibold text-slate-100">Поведение</h3>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Тема приложения
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  theme === "dark"
                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600"
                }`}
              >
                Тёмная
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  theme === "light"
                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600"
                }`}
              >
                Светлая
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
              Валюта приложения
            </label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {currencyOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Быстрая запись слотов
                </p>
              </div>
              <button
                type="button"
                onClick={() => setKeepQuickContext((prev) => !prev)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                  keepQuickContext
                    ? "border-indigo-500/40 bg-indigo-500/20"
                    : "border-slate-700 bg-slate-800"
                }`}
                aria-pressed={keepQuickContext}
                aria-label="Переключить быструю запись"
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    keepQuickContext ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-indigo-400" />
          <h3 className="text-base font-semibold text-slate-100">Данные</h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard label="Операции" value={financeCount} hint="Финансы" />
          <StatCard
            label="Сессии"
            value={sessionGroupCount}
            hint={`${slotRecordCount} записей`}
          />
          <StatCard
            label="Избранные слоты"
            value={favoriteSlotCount}
            hint={`${customSlotCount} своих`}
          />
          <StatCard
            label="Провайдеры"
            value={providerCount}
            hint={
              saveStatus === "saved"
                ? "Изменения сохранены в облако"
                : saveStatus === "saving"
                  ? "Идёт сохранение"
                  : "Есть проблема с сохранением"
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-400" />
          <h3 className="text-base font-semibold text-slate-100">
            Резерв и очистка
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleExportData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-950/70"
          >
            <p className="text-sm font-semibold text-slate-100">
              Экспортировать данные
            </p>
            <Download size={18} className="text-slate-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportData}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-left transition-colors hover:border-slate-700 hover:bg-slate-950/70"
          >
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Импортировать резервную копию
              </p>
              {importStatus !== "idle" && (
                <p
                  className={`mt-1 text-[11px] ${
                    importStatus === "success"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {importStatus === "success"
                    ? "Данные импортированы"
                    : "Не удалось импортировать файл"}
                </p>
              )}
            </div>
            <Upload size={18} className="text-slate-400" />
          </button>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-rose-200">
                  Сбросить все данные
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen((prev) => !prev)}
                className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
              >
                {isResetConfirmOpen ? "Скрыть" : "Открыть"}
              </button>
            </div>

            {isResetConfirmOpen && (
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-slate-950/50 p-3">
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
                  >
                    <RefreshCcw size={14} />
                    Сбросить данные
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
