import React from "react";
import { History } from "lucide-react";
import EmptyState from "../../../components/common/EmptyState";

export default function RecentSessionsPanel({
  recentSessions,
  maxRecentSessions,
  currency,
  formatDate,
  getSessionBadges,
  getMetricBadgeClass,
  applySessionToForm,
  handleStartEditSession,
  handleDuplicateSession,
}) {
  return (
    <details className="pt-4 group" defaultOpen={false}>
      <summary className="list-none cursor-pointer select-none">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-200">
              Недавние записи
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {Math.min(recentSessions.length, maxRecentSessions)}
          </span>
        </div>
      </summary>
      <div className="mt-4">
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.slice(0, maxRecentSessions).map((session) => (
              <div
                key={`${session.id}-recent`}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {session.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {session.groupName} · {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    ставка {session.bet}
                    {session.sessionCurrency || currency}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  {getSessionBadges(session).map((badge) => (
                    <span
                      key={badge.id}
                      className={`rounded-full px-2 py-0.5 ${getMetricBadgeClass(
                        badge.tone,
                      )}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                {(session.provider || (session.tags || []).length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {session.provider && (
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">
                        {session.provider}
                      </span>
                    )}
                    {(session.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-500/10 px-2 py-1 text-indigo-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applySessionToForm(session)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Повторить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEditSession(session.groupId, session)}
                    className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateSession(session)}
                    className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/30"
                  >
                    Дублировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Недавних записей нет"
            description="Добавьте первую запись в сессию. Здесь появятся быстрые действия и статусы."
          />
        )}
      </div>
    </details>
  );
}
