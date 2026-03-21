import React from "react";
import LineChart from "../../../components/charts/LineChart";

export default function AnalyticsOverview({
  periodFilters,
  analyticsActionState,
  handleExportCsv,
  handleCopyReport,
  handleDownloadReport,
  analyticsPeriod,
  setAnalyticsPeriod,
  analyticsProvider,
  setAnalyticsProvider,
  providerOptions,
  currencyOptions,
  analyticsCurrency,
  setAnalyticsCurrency,
  filterFavoritesOnly,
  setFilterFavoritesOnly,
  filterCustomOnly,
  setFilterCustomOnly,
  analyticsSummary,
  analyticsHighlights,
  slotTops,
  providerAnalytics,
  periodComparison,
  formatNumber,
  formatMoneyWithCurrency,
  getMetricToneClass,
  balanceSeries,
}) {
  const topSlot = analyticsHighlights.topSlot;
  const bestSlot = slotTops.bestByProfit[0];
  const topProvider = providerAnalytics[0];
  const resultTrendText =
    analyticsSummary.totalResult > 0
      ? "Период в плюсе"
      : analyticsSummary.totalResult < 0
        ? "Период в минусе"
        : "Пока без изменений";
  const comparisonText = periodComparison
    ? periodComparison.diff.totalResult > 0
      ? `Лучше прошлого периода на ${formatNumber(
          Math.abs(periodComparison.diff.totalResult),
        )}`
      : periodComparison.diff.totalResult < 0
        ? `Слабее прошлого периода на ${formatNumber(
            Math.abs(periodComparison.diff.totalResult),
          )}`
        : "Почти как прошлый период"
    : "Сравнение появится для периодов 1 / 7 / 30 дней";

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
          >
            {analyticsActionState === "csv" ? "CSV готов" : "Экспорт CSV"}
          </button>
          <button
            type="button"
            onClick={handleCopyReport}
            className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-[11px] font-semibold text-indigo-200 hover:bg-indigo-600/30"
          >
            {analyticsActionState === "report"
              ? "Отчет скопирован"
              : "Текстовый отчет"}
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
          >
            {analyticsActionState === "report-file"
              ? "TXT готов"
              : "Скачать TXT"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {periodFilters.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => setAnalyticsPeriod(period.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              analyticsPeriod === period.id
                ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Провайдер
          </label>
          <select
            value={analyticsProvider}
            onChange={(event) => setAnalyticsProvider(event.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все провайдеры</option>
            {providerOptions.map((provider) => (
              <option key={provider} value={provider.toLowerCase()}>
                {provider}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Валюта
          </label>
          <select
            value={analyticsCurrency}
            onChange={(event) => setAnalyticsCurrency(event.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Все валюты</option>
            {currencyOptions.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilterFavoritesOnly((prev) => !prev)}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
            filterFavoritesOnly
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
          }`}
        >
          Только избранные
        </button>
        <button
          type="button"
          onClick={() => setFilterCustomOnly((prev) => !prev)}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
            filterCustomOnly
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
          }`}
        >
          Только мои слоты
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-5">
        <div className="summary-card">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Итог за период
          </p>
          <p
            className={`mt-2 text-2xl font-semibold ${getMetricToneClass(
              analyticsSummary.totalResult,
            )}`}
          >
            {analyticsCurrency === "all"
              ? formatNumber(analyticsSummary.totalResult)
              : formatMoneyWithCurrency(
                  analyticsSummary.totalResult,
                  analyticsCurrency,
                )}
          </p>
          <p className="mt-1 text-xs text-slate-500">{resultTrendText}</p>
        </div>

        <div className="summary-card">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Играли чаще всего
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {topSlot ? topSlot[0] : "Пока нет данных"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {topSlot ? `${topSlot[1]} сесс.` : "Добавьте записи за период"}
          </p>
        </div>

        <div className="summary-card">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Лучший слот
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {bestSlot ? bestSlot.slot : "Пока нет данных"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {bestSlot
              ? `Результат ${formatNumber(bestSlot.totalResult)}`
              : "Появится после нескольких записей"}
          </p>
        </div>

        <div className="summary-card">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Главный провайдер
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {topProvider ? topProvider.provider : "Пока нет данных"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {topProvider
              ? `${topProvider.sessions} сесс.`
              : "Станет виден позже"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="summary-card p-3">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Сессии
          </p>
          <p className="text-lg font-semibold text-slate-100">
            {analyticsSummary.totalSessions}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Сколько игровых записей попало в период
          </p>
        </div>
        <div className="summary-card p-3">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Спины
          </p>
          <p className="text-lg font-semibold text-slate-100">
            {formatNumber(analyticsSummary.totalSpins)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Общее количество прокруток
          </p>
        </div>
        <div className="summary-card p-3">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Средняя ставка
          </p>
          <p className="text-lg font-semibold text-slate-200">
            {analyticsCurrency === "all"
              ? formatNumber(analyticsSummary.avgBet)
              : formatMoneyWithCurrency(
                  analyticsSummary.avgBet,
                  analyticsCurrency,
                )}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Средний размер ставки по выбранным сессиям
          </p>
        </div>
        <div className="summary-card p-3">
          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
            Последний баланс
          </p>
          <p
            className={`text-lg font-semibold ${getMetricToneClass(
              analyticsSummary.lastBalance,
            )}`}
          >
            {analyticsCurrency === "all"
              ? formatNumber(analyticsSummary.lastBalance)
              : formatMoneyWithCurrency(
                  analyticsSummary.lastBalance,
                  analyticsCurrency,
                )}
          </p>
          <p className="mt-1 text-xs text-slate-500">{comparisonText}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="surface-card-muted p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Как менялся баланс
              </h4>
              <p className="text-[11px] text-slate-500">
                Если линия растёт, период идёт лучше. Если падает, баланс
                проседает.
              </p>
            </div>
            <span className="text-[10px] text-slate-500">
              {analyticsCurrency === "all"
                ? "Все валюты"
                : `Валюта: ${analyticsCurrency}`}
            </span>
          </div>
          <LineChart series={balanceSeries} color="#818cf8" />
        </div>
      </div>
    </>
  );
}
