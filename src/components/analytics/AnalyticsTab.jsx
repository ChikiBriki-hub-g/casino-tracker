import React from "react";
import { Sparkles } from "lucide-react";
import LineChart from "../charts/LineChart";

export default function AnalyticsTab({
  PERIOD_FILTERS,
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
  formatNumber,
  formatMoneyWithCurrency,
  getMetricToneClass,
  balanceSeries,
  plSeries,
  analyticsInsights,
  periodComparison,
  slotTops,
  slotAnalytics,
  providerAnalytics,
  analyticsReportText,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-200">Аналитика</h3>
          </div>
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
          {PERIOD_FILTERS.map((period) => (
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
              onChange={(e) => setAnalyticsProvider(e.target.value)}
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
              onChange={(e) => setAnalyticsCurrency(e.target.value)}
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

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
              Сессии
            </p>
            <p className="text-lg font-semibold text-slate-100">
              {analyticsSummary.totalSessions}
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
              Спины
            </p>
            <p className="text-lg font-semibold text-slate-100">
              {formatNumber(analyticsSummary.totalSpins)}
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
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
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
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
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200">
                График баланса
              </h4>
              <span className="text-[10px] text-slate-500">
                {analyticsCurrency === "all"
                  ? "Все валюты"
                  : `Валюта: ${analyticsCurrency}`}
              </span>
            </div>
            <LineChart series={balanceSeries} color="#818cf8" />
          </div>
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-200">
                P/L по дням
              </h4>
              <span className="text-[10px] text-slate-500">
                {analyticsCurrency === "all"
                  ? "Все валюты"
                  : `Валюта: ${analyticsCurrency}`}
              </span>
            </div>
            <LineChart series={plSeries} color="#22c55e" />
          </div>
        </div>

        <details
          className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30"
          defaultOpen={false}
        >
          <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Расширенная аналитика
            </span>
            <span className="text-xs text-slate-500">
              Выводы, сравнение, топы, отчёт
            </span>
          </summary>

          <div className="px-4 pb-4">
            <div className="mt-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                Ключевые выводы
              </h4>
              <div className="space-y-2">
                {analyticsInsights.map((insight, index) => (
                  <div
                    key={`${index}-${insight}`}
                    className="text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2"
                  >
                    {index + 1}. {insight}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                Сравнение периодов
              </h4>
              {periodComparison ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                    <p className="text-slate-500 uppercase tracking-wider mb-2">
                      Текущий
                    </p>
                    <p className="text-slate-200">
                      Сессии: {periodComparison.current.sessions}
                    </p>
                    <p className="text-slate-200">
                      Спины: {formatNumber(periodComparison.current.spins)}
                    </p>
                    <p
                      className={getMetricToneClass(
                        periodComparison.current.totalResult,
                      )}
                    >
                      P/L: {formatNumber(periodComparison.current.totalResult)}
                    </p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                    <p className="text-slate-500 uppercase tracking-wider mb-2">
                      Предыдущий
                    </p>
                    <p className="text-slate-200">
                      Сессии: {periodComparison.previous.sessions}
                    </p>
                    <p className="text-slate-200">
                      Спины: {formatNumber(periodComparison.previous.spins)}
                    </p>
                    <p
                      className={getMetricToneClass(
                        periodComparison.previous.totalResult,
                      )}
                    >
                      P/L: {formatNumber(periodComparison.previous.totalResult)}
                    </p>
                  </div>
                  <div className="col-span-2 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                    <p className="text-slate-500 uppercase tracking-wider mb-2">
                      Дельта
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <p
                        className={getMetricToneClass(
                          periodComparison.diff.sessions,
                        )}
                      >
                        Сессии: {periodComparison.diff.sessions > 0 ? "+" : ""}
                        {periodComparison.diff.sessions}
                      </p>
                      <p
                        className={getMetricToneClass(
                          periodComparison.diff.spins,
                        )}
                      >
                        Спины: {periodComparison.diff.spins > 0 ? "+" : ""}
                        {formatNumber(periodComparison.diff.spins)}
                      </p>
                      <p
                        className={getMetricToneClass(
                          periodComparison.diff.totalResult,
                        )}
                      >
                        P/L: {periodComparison.diff.totalResult > 0 ? "+" : ""}
                        {formatNumber(periodComparison.diff.totalResult)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Для сравнения выберите период Сегодня / 7 дней / 30 дней.
                </p>
              )}
            </div>

            <div className="mt-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                Топы
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Лучшие слоты (ROI)
                  </p>
                  {slotTops.bestSlots.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Нет данных по фильтру.
                    </p>
                  ) : (
                    slotTops.bestSlots.map((slot) => (
                      <p
                        key={`best-${slot.slot}`}
                        className="text-xs text-slate-200"
                      >
                        {slot.slot} · {slot.roi?.toFixed(2)}%
                      </p>
                    ))
                  )}
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Худшие слоты (ROI)
                  </p>
                  {slotTops.worstSlots.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Нет данных по фильтру.
                    </p>
                  ) : (
                    slotTops.worstSlots.map((slot) => (
                      <p
                        key={`worst-${slot.slot}`}
                        className="text-xs text-slate-200"
                      >
                        {slot.slot} · {slot.roi?.toFixed(2)}%
                      </p>
                    ))
                  )}
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Самые частые
                  </p>
                  {slotTops.mostFrequent.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Нет данных по фильтру.
                    </p>
                  ) : (
                    slotTops.mostFrequent.map((slot) => (
                      <p
                        key={`freq-${slot.slot}`}
                        className="text-xs text-slate-200"
                      >
                        {slot.slot} · {slot.sessions} сесс.
                      </p>
                    ))
                  )}
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Лучшие по x
                  </p>
                  {slotTops.bestByX.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Нет данных по фильтру.
                    </p>
                  ) : (
                    slotTops.bestByX.map((slot) => (
                      <p
                        key={`x-${slot.slot}`}
                        className="text-xs text-slate-200"
                      >
                        {slot.slot} · x{slot.bestX}
                      </p>
                    ))
                  )}
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                    Лучшие по прибыли
                  </p>
                  {slotTops.bestByProfit.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Нет данных по фильтру.
                    </p>
                  ) : (
                    slotTops.bestByProfit.map((slot) => (
                      <p
                        key={`profit-${slot.slot}`}
                        className={`text-xs ${getMetricToneClass(slot.totalResult)}`}
                      >
                        {slot.slot} · {formatNumber(slot.totalResult)}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                Сводка по слотам
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {slotAnalytics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Нет записей для выбранных фильтров.
                  </p>
                ) : (
                  slotAnalytics.map((slot) => (
                    <div
                      key={`slot-metrics-${slot.slot}`}
                      className="bg-slate-900/60 border border-slate-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-100">
                          {slot.slot}
                        </p>
                        <p
                          className={`text-xs font-semibold ${getMetricToneClass(
                            slot.totalResult,
                          )}`}
                        >
                          {formatNumber(slot.totalResult)}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <p>Сессии: {slot.sessions}</p>
                        <p>Спины: {formatNumber(slot.spins)}</p>
                        <p>Бонусы: {slot.bonuses}</p>
                        <p>Ср. ставка: {formatNumber(slot.averageBet)}</p>
                        <p>
                          Ср. бонус:{" "}
                          {slot.averageBonusWin
                            ? formatNumber(slot.averageBonusWin)
                            : "—"}
                        </p>
                        <p>Лучший x: x{slot.bestX || 0}</p>
                        <p>
                          ROI:{" "}
                          {slot.roi !== null ? `${slot.roi.toFixed(2)}%` : "—"}
                        </p>
                        <p>
                          Хитрейт:{" "}
                          {slot.bonusHitRate !== null
                            ? `${slot.bonusHitRate.toFixed(2)}%`
                            : "—"}
                        </p>
                        <p>
                          Спины/бонус:{" "}
                          {slot.averageSpinsToBonus
                            ? slot.averageSpinsToBonus.toFixed(1)
                            : "—"}
                        </p>
                        <p>
                          Лучший win:{" "}
                          {slot.bestWin ? formatNumber(slot.bestWin) : "—"}
                        </p>
                        <p>
                          Лучшая сессия:{" "}
                          {slot.bestSession
                            ? formatNumber(slot.bestSession.value)
                            : "—"}
                        </p>
                        <p>
                          Худшая сессия:{" "}
                          {slot.worstSession
                            ? formatNumber(slot.worstSession.value)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">
                Провайдеры
              </h4>
              <div className="space-y-2">
                {providerAnalytics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Нет записей для выбранных фильтров.
                  </p>
                ) : (
                  providerAnalytics.map((provider) => (
                    <div
                      key={`provider-${provider.provider}`}
                      className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {provider.provider}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {provider.sessions} сесс. ·{" "}
                          {formatNumber(provider.spins)} спинов
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className={getMetricToneClass(provider.totalResult)}>
                          {formatNumber(provider.totalResult)}
                        </p>
                        <p className="text-slate-400">
                          ROI{" "}
                          {provider.roi !== null
                            ? `${provider.roi.toFixed(2)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-slate-200">Отчет</h4>
                <span className="text-[10px] text-slate-500">
                  Короткий текст за выбранный период
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-300 font-sans">
                {analyticsReportText}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
