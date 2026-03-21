import React from "react";
import AnalyticsTab from "./AnalyticsTab";
import { CURRENCY_OPTIONS, PERIOD_FILTERS } from "../constants";

export default function AnalyticsSection({ analytics, providerOptions }) {
  return (
    <AnalyticsTab
      PERIOD_FILTERS={PERIOD_FILTERS}
      analyticsActionState={analytics.analyticsActionState}
      handleExportCsv={analytics.handleExportCsv}
      handleCopyReport={analytics.handleCopyReport}
      handleDownloadReport={analytics.handleDownloadReport}
      analyticsPeriod={analytics.analyticsPeriod}
      setAnalyticsPeriod={analytics.setAnalyticsPeriod}
      analyticsProvider={analytics.analyticsProvider}
      setAnalyticsProvider={analytics.setAnalyticsProvider}
      providerOptions={providerOptions}
      currencyOptions={CURRENCY_OPTIONS}
      analyticsCurrency={analytics.analyticsCurrency}
      setAnalyticsCurrency={analytics.setAnalyticsCurrency}
      filterFavoritesOnly={analytics.filterFavoritesOnly}
      setFilterFavoritesOnly={analytics.setFilterFavoritesOnly}
      filterCustomOnly={analytics.filterCustomOnly}
      setFilterCustomOnly={analytics.setFilterCustomOnly}
      analyticsSummary={analytics.analyticsSummary}
      analyticsHighlights={analytics.analyticsHighlights}
      slotTops={analytics.slotTops}
      providerAnalytics={analytics.providerAnalytics}
      periodComparison={analytics.periodComparison}
      formatNumber={analytics.formatNumber}
      formatMoneyWithCurrency={analytics.formatMoneyWithCurrency}
      getMetricToneClass={analytics.getMetricToneClass}
      balanceSeries={analytics.balanceSeries}
      plSeries={analytics.plSeries}
      analyticsInsights={analytics.analyticsInsights}
      slotAnalytics={analytics.slotAnalytics}
      analyticsReportText={analytics.analyticsReportText}
    />
  );
}
