import React, { useEffect, useState } from "react";
import AnalyticsAdvanced from "./AnalyticsAdvanced";
import AnalyticsOverview from "./AnalyticsOverview";

export default function AnalyticsTab(props) {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "simple";
    const savedViewMode = window.localStorage.getItem(
      "casino-manager-analytics-view-mode",
    );
    return savedViewMode === "advanced" ? "advanced" : "simple";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("casino-manager-analytics-view-mode", viewMode);
  }, [viewMode]);

  const {
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
    analyticsHighlights,
    slotTops,
    providerAnalytics,
    periodComparison,
    formatNumber,
    formatMoneyWithCurrency,
    getMetricToneClass,
    balanceSeries,
    plSeries,
    analyticsInsights,
    slotAnalytics,
    analyticsReportText,
  } = props;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-sm font-semibold text-slate-200">
            Режим аналитики
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-1">
            <button
              type="button"
              onClick={() => setViewMode("simple")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "simple"
                  ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Простой
            </button>
            <button
              type="button"
              onClick={() => setViewMode("advanced")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "advanced"
                  ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Продвинутый
            </button>
          </div>
        </div>

        <AnalyticsOverview
          periodFilters={PERIOD_FILTERS}
          analyticsActionState={analyticsActionState}
          handleExportCsv={handleExportCsv}
          handleCopyReport={handleCopyReport}
          handleDownloadReport={handleDownloadReport}
          analyticsPeriod={analyticsPeriod}
          setAnalyticsPeriod={setAnalyticsPeriod}
          analyticsProvider={analyticsProvider}
          setAnalyticsProvider={setAnalyticsProvider}
          providerOptions={providerOptions}
          currencyOptions={currencyOptions}
          analyticsCurrency={analyticsCurrency}
          setAnalyticsCurrency={setAnalyticsCurrency}
          filterFavoritesOnly={filterFavoritesOnly}
          setFilterFavoritesOnly={setFilterFavoritesOnly}
          filterCustomOnly={filterCustomOnly}
          setFilterCustomOnly={setFilterCustomOnly}
          analyticsSummary={analyticsSummary}
          analyticsHighlights={analyticsHighlights}
          slotTops={slotTops}
          providerAnalytics={providerAnalytics}
          periodComparison={periodComparison}
          formatNumber={formatNumber}
          formatMoneyWithCurrency={formatMoneyWithCurrency}
          getMetricToneClass={getMetricToneClass}
          balanceSeries={balanceSeries}
          plSeries={plSeries}
        />

        {viewMode === "advanced" && (
          <AnalyticsAdvanced
            analyticsInsights={analyticsInsights}
            periodComparison={periodComparison}
            slotTops={slotTops}
            slotAnalytics={slotAnalytics}
            providerAnalytics={providerAnalytics}
            analyticsReportText={analyticsReportText}
            formatNumber={formatNumber}
            getMetricToneClass={getMetricToneClass}
          />
        )}
      </div>
    </div>
  );
}
