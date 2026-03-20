import React from "react";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  History,
  Trash2,
  Gamepad2,
  Copy,
  CheckCircle2,
  Search,
  Layers,
} from "lucide-react";
import EmptyState from "../common/EmptyState";
import {
  formatInputWithCommas,
  parseAmount,
  calculateX,
} from "../../utils/casino";

export default function SlotsTab({
  editingSession,
  handleCreateNewGroup,
  slotGroups,
  activeGroupId,
  handleAddSlotSession,
  resetSlotForm,
  lastSessionInActiveGroup,
  currency,
  handleRepeatLastSlot,
  handleUseLastBet,
  handleDuplicateLastSession,
  setIsSlotSearchOpen,
  slotName,
  slotProvider,
  slotBet,
  setSlotBet,
  slotSpins,
  setSlotSpins,
  slotBonuses,
  handleBonusesChange,
  slotBonusWins,
  handleBonusWinChange,
  SESSION_TAGS,
  slotTags,
  setSlotTags,
  slotBalance,
  setSlotBalance,
  recentSessions,
  MAX_RECENT_SESSIONS,
  formatDate,
  getSessionBadges,
  getMetricBadgeClass,
  applySessionToForm,
  handleStartEditSession,
  handleDuplicateSession,
  pendingDelete,
  handleDeleteGroup,
  clearPendingDelete,
  handleRequestDeleteGroup,
  copiedGroupId,
  copyToClipboard,
  setActiveGroupId,
  handleDeleteSlotSession,
  handleRequestDeleteSession,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-200">
            {editingSession ? "Редактировать запись" : "Новая запись"}
          </h3>
        </div>
        <button
          onClick={handleCreateNewGroup}
          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-indigo-900/20"
        >
          <PlusCircle size={14} />
          Новая сессия
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative">
        <div className="absolute top-0 right-5 -translate-y-1/2 bg-slate-800 border border-slate-700 text-xs font-semibold px-3 py-1 rounded-full text-slate-300 flex gap-2 shadow-md">
          В сессию:{" "}
          <span className="text-indigo-400">
            {slotGroups.find((g) => g.id === activeGroupId)?.name || ""}
          </span>
        </div>

        <form onSubmit={handleAddSlotSession} className="space-y-4 mt-2">
          {editingSession && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <span>
                Вы редактируете запись. Изменения сохранятся в текущей сессии.
              </span>
              <button
                type="button"
                onClick={resetSlotForm}
                className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/30"
              >
                Отменить
              </button>
            </div>
          )}

          {lastSessionInActiveGroup && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  Последняя запись:{" "}
                  <span className="font-semibold text-slate-200">
                    {lastSessionInActiveGroup.name}
                  </span>
                </span>
                <span className="text-[11px]">
                  ставка {lastSessionInActiveGroup.bet}
                  {lastSessionInActiveGroup.sessionCurrency || currency}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRepeatLastSlot}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Повторить слот
                </button>
                <button
                  type="button"
                  onClick={handleUseLastBet}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Повторить ставку
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateLastSession}
                  className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/30"
                >
                  Дублировать сессию
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Слот{" "}
              {slotProvider && (
                <span className="normal-case tracking-normal text-[11px] text-slate-500 font-medium ml-1">
                  {slotProvider}
                </span>
              )}
            </label>
            <div
              onClick={() => setIsSlotSearchOpen(true)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div className="min-w-0">
                <span
                  className={slotName ? "text-slate-100" : "text-slate-500"}
                >
                  {slotName || "Выберите слот"}
                </span>
                {slotName && slotProvider && (
                  <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                    {slotProvider}
                  </p>
                )}
              </div>
              <Search size={18} className="text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Размер ставки
              </label>
              <input
                type="text"
                required
                value={slotBet}
                onChange={(e) =>
                  setSlotBet(formatInputWithCommas(e.target.value))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Например, 300"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Количество спинов
              </label>
              <input
                type="number"
                required
                value={slotSpins}
                onChange={(e) => setSlotSpins(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Например, 100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 items-start sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Количество бонусных игр
              </label>
              <input
                type="number"
                value={slotBonuses}
                onChange={handleBonusesChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Например, 3"
              />
            </div>

            {slotBonusWins.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Выигрыши по бонусам
                </label>
                {slotBonusWins.map((win, index) => (
                  <input
                    key={index}
                    type="text"
                    value={win}
                    onChange={(e) =>
                      handleBonusWinChange(index, e.target.value)
                    }
                    className="w-full bg-slate-950 border border-indigo-900/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 bg-indigo-950/20"
                    placeholder={
                      slotBonusWins.length > 1
                        ? `Бонус ${index + 1}`
                        : "Сумма выигрыша"
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Теги сессии
            </label>
            <div className="flex flex-wrap gap-2">
              {SESSION_TAGS.map((tag) => {
                const active = slotTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSlotTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((item) => item !== tag)
                          : [...prev, tag],
                      )
                    }
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      active
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Итоговый баланс
            </label>
            <input
              type="text"
              required
              value={slotBalance}
              onChange={(e) =>
                setSlotBalance(formatInputWithCommas(e.target.value))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Например, 7 980"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-900/20"
          >
            {editingSession ? "Сохранить" : "Добавить запись"}
          </button>
        </form>
      </div>

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
              {Math.min(recentSessions.length, MAX_RECENT_SESSIONS)}
            </span>
          </div>
        </summary>
        <div className="mt-4">
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.slice(0, MAX_RECENT_SESSIONS).map((session) => (
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
                      onClick={() =>
                        handleStartEditSession(session.groupId, session)
                      }
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

      <details className="pt-4 group" defaultOpen={false}>
        <summary className="list-none cursor-pointer select-none">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <span className="text-sm font-semibold text-slate-200">
              Сессии и записи
            </span>
            <span className="text-xs text-slate-500">{slotGroups.length}</span>
          </div>
        </summary>
        <div className="mt-4 space-y-6">
          {slotGroups.map((group) => (
            <div
              key={group.id}
              className={`bg-[#0f172a] rounded-2xl border ${activeGroupId === group.id ? "border-indigo-500/50" : "border-slate-800"} overflow-hidden shadow-lg`}
            >
              <div
                className={`flex items-center justify-between p-3 border-b ${activeGroupId === group.id ? "bg-indigo-950/20 border-indigo-500/30" : "bg-slate-900/50 border-slate-800"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${activeGroupId === group.id ? "text-indigo-400" : "text-slate-300"}`}
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

                <div className="flex items-center gap-2">
                  {group.items.length > 0 && (
                    <button
                      onClick={() => copyToClipboard(group.id)}
                      className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copiedGroupId === group.id ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
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
                  <EmptyState
                    title="Сессия пока пустая"
                    description="Нажмите «Добавить запись» выше и внесите первую игру в эту сессию."
                  />
                ) : (
                  <div className="space-y-3">
                    {group.items.map((session, index) => {
                      const cur = session.sessionCurrency || currency;
                      const prevSession = group.items[index + 1];
                      const currBal = parseAmount(session.balance);
                      const prevBal = prevSession
                        ? parseAmount(prevSession.balance)
                        : null;

                      let balColorClass = "text-slate-200";
                      let TrendIcon = null;

                      if (
                        prevBal !== null &&
                        !isNaN(currBal) &&
                        !isNaN(prevBal)
                      ) {
                        if (currBal > prevBal) {
                          balColorClass = "text-emerald-400";
                          TrendIcon = TrendingUp;
                        } else if (currBal < prevBal) {
                          balColorClass = "text-rose-400";
                          TrendIcon = TrendingDown;
                        }
                      }

                      return (
                        <div
                          key={session.id}
                          className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-3 shadow-sm hover:border-slate-600 transition-colors relative group/item"
                        >
                          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                            {pendingDelete?.type === "session" &&
                            pendingDelete.groupId === group.id &&
                            pendingDelete.sessionId === session.id ? (
                              <>
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
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleStartEditSession(group.id, session)
                                  }
                                  className="text-[10px] font-semibold bg-amber-500/20 text-amber-200 px-2 py-1 rounded-md hover:bg-amber-500/30"
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
                                  className="text-slate-500 hover:text-rose-400 transition-all p-1 bg-slate-900/50 rounded-md"
                                  title="Удалить запись"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-2 text-sm">
                            <Gamepad2 size={14} className="text-indigo-400" />
                            {session.name}
                          </h4>

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

                          {(session.provider ||
                            (session.tags && session.tags.length > 0)) && (
                            <div className="mb-2 flex flex-wrap gap-1.5 text-[10px]">
                              {session.provider && (
                                <span className="rounded-full bg-slate-900/60 border border-slate-700 px-2 py-0.5 text-slate-200">
                                  {session.provider}
                                </span>
                              )}
                              {(session.tags || []).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-indigo-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-slate-900/50 rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
                              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                Ставка
                              </span>
                              <span className="font-semibold text-slate-300 text-xs">
                                {session.bet}
                                {cur}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
                              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                Спины
                              </span>
                              <span className="font-semibold text-slate-300 text-xs">
                                {session.spins}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg py-1.5 flex flex-col items-center justify-center border border-slate-800/50">
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
                                  {session.bonusWins.map((win, i) => {
                                    const x = calculateX(win, session.bet);
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center bg-indigo-950/30 border border-indigo-500/30 rounded-md overflow-hidden"
                                      >
                                        <span className="px-2 py-0.5 text-xs font-medium text-indigo-100">
                                          {win}
                                          {cur}
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

                          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">
                              Баланс:
                            </span>
                            <span
                              className={`font-bold text-sm flex items-center gap-1 ${balColorClass}`}
                            >
                              {TrendIcon && <TrendIcon size={14} />}
                              {session.balance}
                              {cur}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
