import React from "react";

export default function AnalyticsAdvanced({
  analyticsInsights,
  periodComparison,
  slotTops,
  slotAnalytics,
  providerAnalytics,
  analyticsReportText,
  formatNumber,
  getMetricToneClass,
}) {
  return (
    <details className="surface-card-muted mt-4 rounded-xl" defaultOpen={false}>
      <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">
          Продвинутая аналитика
        </span>
      </summary>

      <div className="px-4 pb-4 space-y-4">
        <div className="surface-card-muted rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            Что видно по игре
          </h4>
          <div className="space-y-2">
            {analyticsInsights.map((insight, index) => (
              <div
                key={`${index}-${insight}`}
                className="surface-card rounded-lg px-3 py-2 text-xs text-slate-300"
              >
                {index + 1}. {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card-muted rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            По сравнению с прошлым периодом
          </h4>
          {periodComparison ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="surface-card rounded-lg p-3">
                <p className="text-slate-500 uppercase tracking-wider mb-2">
                  Сейчас
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
                  Итог: {formatNumber(periodComparison.current.totalResult)}
                </p>
              </div>
              <div className="surface-card rounded-lg p-3">
                <p className="text-slate-500 uppercase tracking-wider mb-2">
                  До этого
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
                  Итог: {formatNumber(periodComparison.previous.totalResult)}
                </p>
              </div>
              <div className="surface-card rounded-lg p-3">
                <p className="text-slate-500 uppercase tracking-wider mb-2">
                  Разница
                </p>
                <p
                  className={getMetricToneClass(periodComparison.diff.sessions)}
                >
                  Сессии: {periodComparison.diff.sessions > 0 ? "+" : ""}
                  {periodComparison.diff.sessions}
                </p>
                <p className={getMetricToneClass(periodComparison.diff.spins)}>
                  Спины: {periodComparison.diff.spins > 0 ? "+" : ""}
                  {formatNumber(periodComparison.diff.spins)}
                </p>
                <p
                  className={getMetricToneClass(
                    periodComparison.diff.totalResult,
                  )}
                >
                  Итог: {periodComparison.diff.totalResult > 0 ? "+" : ""}
                  {formatNumber(periodComparison.diff.totalResult)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Сравнение недоступно</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="surface-card-muted rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Что выглядит сильнее
            </h4>
            <div className="space-y-2">
              {slotTops.bestByProfit.length === 0 ? (
                <p className="text-xs text-slate-500">Нет данных по фильтру.</p>
              ) : (
                slotTops.bestByProfit.map((slot) => (
                  <div
                    key={`profit-${slot.slot}`}
                    className="surface-card rounded-lg px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-slate-100">
                      {slot.slot}
                    </p>
                    <p
                      className={`text-xs ${getMetricToneClass(slot.totalResult)}`}
                    >
                      Итог: {formatNumber(slot.totalResult)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface-card-muted rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Что тянуло вниз
            </h4>
            <div className="space-y-2">
              {slotTops.worstSlots.length === 0 ? (
                <p className="text-xs text-slate-500">Нет данных по фильтру.</p>
              ) : (
                slotTops.worstSlots.map((slot) => (
                  <div
                    key={`weak-${slot.slot}`}
                    className="surface-card rounded-lg px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-slate-100">
                      {slot.slot}
                    </p>
                    <p className="text-xs text-slate-400">
                      Эффективность:{" "}
                      {slot.roi !== null ? `${slot.roi.toFixed(2)}%` : "—"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="surface-card-muted rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            По провайдерам
          </h4>
          <div className="space-y-2">
            {providerAnalytics.length === 0 ? (
              <p className="text-xs text-slate-500">
                Нет записей для выбранных фильтров.
              </p>
            ) : (
              providerAnalytics.slice(0, 5).map((provider) => (
                <div
                  key={`provider-${provider.provider}`}
                  className="surface-card rounded-lg p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {provider.provider}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {provider.sessions} сесс. · {formatNumber(provider.spins)}{" "}
                      спинов
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p
                      className={`whitespace-nowrap ${getMetricToneClass(provider.totalResult)}`}
                    >
                      {formatNumber(provider.totalResult)}
                    </p>
                    <p className="text-slate-400">
                      Эффективность{" "}
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

        <details className="surface-card-muted rounded-xl">
          <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Полная таблица по слотам
            </span>
          </summary>
          <div className="px-4 pb-4">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {slotAnalytics.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Нет записей для выбранных фильтров.
                </p>
              ) : (
                slotAnalytics.map((slot) => (
                  <div
                    key={`slot-metrics-${slot.slot}`}
                    className="surface-card rounded-lg p-3"
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
                      <p>Средняя ставка: {formatNumber(slot.averageBet)}</p>
                      <p>
                        Средний бонус:{" "}
                        {slot.averageBonusWin
                          ? formatNumber(slot.averageBonusWin)
                          : "—"}
                      </p>
                      <p>Лучший x: x{slot.bestX || 0}</p>
                      <p>
                        Эффективность:{" "}
                        {slot.roi !== null ? `${slot.roi.toFixed(2)}%` : "—"}
                      </p>
                      <p>
                        Хитрейт бонуса:{" "}
                        {slot.bonusHitRate !== null
                          ? `${slot.bonusHitRate.toFixed(2)}%`
                          : "—"}
                      </p>
                      <p>
                        Спины до бонуса:{" "}
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
        </details>

        <details className="surface-card-muted rounded-xl">
          <summary className="list-none cursor-pointer select-none px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Текстовый отчёт
            </span>
          </summary>
          <div className="px-4 pb-4">
            <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-300 font-sans">
              {analyticsReportText}
            </pre>
          </div>
        </details>
      </div>
    </details>
  );
}
