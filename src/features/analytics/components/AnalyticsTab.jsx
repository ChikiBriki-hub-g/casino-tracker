import React from "react";
import AnalyticsAdvanced from "./AnalyticsAdvanced";
import AnalyticsOverview from "./AnalyticsOverview";

export default function AnalyticsTab(props) {
  const {
    PERIOD_FILTERS,
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
    financeOverview,
    analyticsInsights,
    slotAnalytics,
    analyticsReportText,
    handleCopyReport,
    analyticsActionState,
  } = props;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
        <AnalyticsOverview
          periodFilters={PERIOD_FILTERS}
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
          financeOverview={financeOverview}
        />

        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleCopyReport}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
          >
            {analyticsActionState === "report"
              ? "Отчёт скопирован"
              : "Скопировать отчёт"}
          </button>
        </div>

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
      </div>
    </div>
  );
}
