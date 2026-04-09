import React from "react";
import {
  CheckCircle2,
  Copy,
  Gamepad2,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import EmptyState from "../../../components/common/EmptyState";
import { calculateX, parseAmount } from "../../../utils/casino";

export default function SlotGroupsPanel({
  slotGroups,
  activeGroupId,
  setActiveGroupId,
  pendingDelete,
  handleDeleteGroup,
  clearPendingDelete,
  handleRequestDeleteGroup,
  copiedGroupId,
  copyToClipboard,
  handleDeleteSlotSession,
  handleStartEditSession,
  handleRequestDeleteSession,
  currency,
  getSessionBadges,
  getMetricBadgeClass,
}) {
  return (
    <details className="pt-4 group" defaultOpen={false}>
      <summary className="list-none cursor-pointer select-none">
        <div className="surface-card-muted flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-slate-200">
            Сессии и записи
          </span>
          <span className="text-xs text-slate-500">{slotGroups.length}</span>
        </div>
      </summary>
      <div className="mt-4 space-y-6">
        {slotGroups.map((group) =>
          (() => {
            const groupItems = group.items;
            const totalSpins = groupItems.reduce(
              (sum, item) => sum + (Number(item.spins) || 0),
              0,
            );
            const totalBonuses = groupItems.reduce(
              (sum, item) => sum + (Number(item.bonuses) || 0),
              0,
            );
            const latestBalance = groupItems[0]?.balance;

            return (
              <div
                key={group.id}
                className={`surface-card rounded-2xl border ${
                  activeGroupId === group.id
                    ? "border-indigo-500/50"
                    : "border-slate-800"
                } overflow-hidden shadow-lg`}
              >
                <div
                  className={`flex items-center justify-between p-3 border-b ${
                    activeGroupId === group.id
                      ? "bg-indigo-950/20 border-indigo-500/30"
                      : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${
                          activeGroupId === group.id
                            ? "text-indigo-400"
                            : "text-slate-300"
                        }`}
                      >
                        {group.name}
                      </span>
                      {activeGroupId !== group.id && (
                        <button
                          onClick={() => setActiveGroupId(group.id)}
                          className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
                        >
                          Сделать активной
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-300">
                        {groupItems.length} записей
                      </span>
                      <span className="whitespace-nowrap rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-300">
                        {totalSpins} спинов
                      </span>
                      <span className="whitespace-nowrap rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-slate-300">
                        {totalBonuses} бонусов
                      </span>
                      {latestBalance && (
                        <span className="whitespace-nowrap rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-indigo-200">
                          Баланс {latestBalance}
                          {currency}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {group.items.length > 0 && (
                      <button
                        onClick={() => copyToClipboard(group.id)}
                        className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedGroupId === group.id ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Copy size={14} />
                        )}
                        {copiedGroupId === group.id
                          ? "Скопировано!"
                          : "Копировать"}
                      </button>
                    )}
                    {slotGroups.length > 1 && (
                      <>
                        {pendingDelete?.type === "group" &&
                        pendingDelete.groupId === group.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleDeleteGroup(group.id);
                                clearPendingDelete();
                              }}
                              className="text-[10px] font-semibold bg-rose-500/20 text-rose-200 px-2 py-1 rounded-lg hover:bg-rose-500/30"
                            >
                              Удалить
                            </button>
                            <button
                              onClick={clearPendingDelete}
                              className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-700"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestDeleteGroup(group.id)}
                            className="text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                            title="Удалить сессию целиком"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  {group.items.length === 0 ? (
                    <EmptyState title="Сессия пока пустая" />
                  ) : (
                    <div className="space-y-3">
                      {group.items.map((session, index) => {
                        const currentCurrency =
                          session.sessionCurrency || currency;
                        const prevSession = group.items[index + 1];
                        const currentBalance = parseAmount(session.balance);
                        const previousBalance = prevSession
                          ? parseAmount(prevSession.balance)
                          : null;

                        let balanceColorClass = "text-slate-200";
                        let TrendIcon = null;

                        if (
                          previousBalance !== null &&
                          !Number.isNaN(currentBalance) &&
                          !Number.isNaN(previousBalance)
                        ) {
                          if (currentBalance > previousBalance) {
                            balanceColorClass = "text-emerald-400";
                            TrendIcon = TrendingUp;
                          } else if (currentBalance < previousBalance) {
                            balanceColorClass = "text-rose-400";
                            TrendIcon = TrendingDown;
                          }
                        }

                        return (
                          <div
                            key={session.id}
                            className="surface-card-muted border border-slate-700/50 rounded-xl p-3 shadow-sm hover:border-slate-600 transition-colors relative"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                                  <Gamepad2
                                    size={14}
                                    className="shrink-0 text-indigo-400"
                                  />
                                  <span className="truncate">
                                    {session.name}
                                  </span>
                                </h4>
                                <p className="mt-1 text-[11px] text-slate-500">
                                  {session.provider || "Провайдер не указан"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                  Баланс
                                </p>
                                <p
                                  className={`mt-1 flex items-center justify-end gap-1 whitespace-nowrap text-sm font-bold ${balanceColorClass}`}
                                >
                                  {TrendIcon && <TrendIcon size={14} />}
                                  {session.balance}
                                  {currentCurrency}
                                </p>
                              </div>
                            </div>

                            <div className="mb-2 flex flex-wrap gap-1.5 text-[10px]">
                              {getSessionBadges(session).map((badge) => (
                                <span
                                  key={`${session.id}-${badge.id}`}
                                  className={`rounded-full px-2 py-0.5 ${getMetricBadgeClass(
                                    badge.tone,
                                  )}`}
                                >
                                  {badge.label}
                                </span>
                              ))}
                            </div>

                            {session.tags && session.tags.length > 0 && (
                              <div className="mb-2 flex flex-wrap gap-1.5 text-[10px]">
                                {(session.tags || []).map((tag) => (
                                  <span
                                    key={tag}
                                    className="whitespace-nowrap rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-indigo-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="surface-card-muted rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                  Ставка
                                </span>
                                <span className="whitespace-nowrap font-semibold text-slate-300 text-xs">
                                  {session.bet}
                                  {currentCurrency}
                                </span>
                              </div>
                              <div className="surface-card-muted rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                  Спины
                                </span>
                                <span className="font-semibold text-slate-300 text-xs">
                                  {session.spins}
                                </span>
                              </div>
                              <div className="surface-card-muted rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                  Бонуски
                                </span>
                                <span className="font-semibold text-slate-300 text-xs">
                                  {session.bonuses}
                                </span>
                              </div>
                            </div>

                            {session.bonusWins &&
                              session.bonusWins.length > 0 && (
                                <div className="mb-3 space-y-1.5">
                                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                                    Выигрыши:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {session.bonusWins.map((win, winIndex) => {
                                      const x = calculateX(win, session.bet);
                                      return (
                                        <div
                                          key={winIndex}
                                          className="flex items-center bg-indigo-950/30 border border-indigo-500/30 rounded-md overflow-hidden"
                                        >
                                          <span className="whitespace-nowrap px-2 py-0.5 text-xs font-medium text-indigo-100">
                                            {win}
                                            {currentCurrency}
                                          </span>
                                          {x && (
                                            <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border-l border-indigo-500/30">
                                              x{x}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                              {pendingDelete?.type === "session" &&
                              pendingDelete.groupId === group.id &&
                              pendingDelete.sessionId === session.id ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-rose-300">
                                    Удалить эту запись?
                                  </span>
                                  <button
                                    onClick={() => {
                                      handleDeleteSlotSession(
                                        group.id,
                                        session.id,
                                      );
                                      clearPendingDelete();
                                    }}
                                    className="text-[10px] font-semibold bg-rose-500/20 text-rose-200 px-2 py-1 rounded-md hover:bg-rose-500/30"
                                  >
                                    Удалить
                                  </button>
                                  <button
                                    onClick={clearPendingDelete}
                                    className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-700"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() =>
                                      handleStartEditSession(group.id, session)
                                    }
                                    className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30"
                                  >
                                    Редактировать
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRequestDeleteSession(
                                        group.id,
                                        session.id,
                                      )
                                    }
                                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-rose-300"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })(),
        )}
      </div>
    </details>
  );
}
