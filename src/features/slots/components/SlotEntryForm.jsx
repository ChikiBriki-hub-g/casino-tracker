import React from "react";
import { Layers, PlusCircle, Search } from "lucide-react";
import { formatInputWithCommas } from "../../../utils/casino";

export default function SlotEntryForm({
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
  setBonusCount,
  slotBonusWins,
  handleBonusWinChange,
  sessionTags,
  slotTags,
  setSlotTags,
  keepQuickContext,
  setKeepQuickContext,
  slotBalance,
  setSlotBalance,
}) {
  const quickSpinOptions = ["50", "100", "200", "300", "500"];
  const quickBonusOptions = [0, 1, 2, 3, 5];

  return (
    <>
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-slate-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-200">
              {editingSession ? "Редактировать запись" : "Новая запись"}
            </h3>
            <p className="text-xs text-slate-500">
              Внесите одну игровую запись без лишних шагов.
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateNewGroup}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-3 py-2.5 text-sm font-bold text-indigo-300 transition-colors shadow-sm shadow-indigo-900/20 hover:bg-indigo-600/30 sm:w-auto sm:justify-start sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs"
        >
          <PlusCircle size={14} />
          Новая сессия
        </button>
      </div>

      <div className="surface-card relative p-5">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs font-semibold text-slate-300">
          <span className="text-slate-500">Сейчас записываем в</span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-indigo-200">
            {slotGroups.find((group) => group.id === activeGroupId)?.name || ""}
          </span>
        </div>

        <form onSubmit={handleAddSlotSession} className="space-y-4">
          {editingSession && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-xs text-amber-200 sm:flex-row sm:items-center sm:justify-between">
              <span className="leading-5">
                Вы редактируете запись. Изменения сохранятся в текущей сессии.
              </span>
              <button
                type="button"
                onClick={resetSlotForm}
                className="rounded-lg bg-amber-500/20 px-3 py-2 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/30"
              >
                Отменить
              </button>
            </div>
          )}

          {lastSessionInActiveGroup && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
              <div className="flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="leading-5">
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
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleRepeatLastSlot}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Повторить слот
                </button>
                <button
                  type="button"
                  onClick={handleUseLastBet}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Повторить ставку
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateLastSession}
                  className="rounded-xl bg-indigo-600/20 px-3 py-2 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/30"
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
            <button
              type="button"
              onClick={() => setIsSlotSearchOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-slate-100 transition-colors hover:border-indigo-500"
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
            </button>
            {slotName && (
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
                <span className="text-slate-500">Выбрано:</span>{" "}
                <span className="font-semibold text-slate-200">{slotName}</span>
                {slotProvider && (
                  <>
                    {" · "}
                    <span className="text-slate-500">Провайдер:</span>{" "}
                    <span className="text-slate-300">{slotProvider}</span>
                  </>
                )}
              </div>
            )}
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
                onChange={(event) =>
                  setSlotBet(formatInputWithCommas(event.target.value))
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Например, 300"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {["100", "200", "300", "500", "1000"].map((betPreset) => (
                  <button
                    key={betPreset}
                    type="button"
                    onClick={() => setSlotBet(betPreset)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      slotBet === betPreset
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {betPreset}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Количество спинов
              </label>
              <input
                type="number"
                required
                value={slotSpins}
                onChange={(event) => setSlotSpins(event.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Например, 100"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quickSpinOptions.map((spinPreset) => (
                  <button
                    key={spinPreset}
                    type="button"
                    onClick={() => setSlotSpins(spinPreset)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      slotSpins === spinPreset
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {spinPreset}
                  </button>
                ))}
              </div>
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
              <div className="mt-2 flex flex-wrap gap-2">
                {quickBonusOptions.map((bonusPreset) => (
                  <button
                    key={bonusPreset}
                    type="button"
                    onClick={() => setBonusCount(bonusPreset)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      slotBonuses === String(bonusPreset)
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {bonusPreset}
                  </button>
                ))}
              </div>
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
                    onChange={(event) =>
                      handleBonusWinChange(index, event.target.value)
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

          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Теги сессии
            </label>
            <div className="flex flex-wrap gap-2">
              {sessionTags.map((tag) => {
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

          {!editingSession && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Быстрая запись
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-5">
                    После сохранения оставить слот, провайдера и ставку, чтобы
                    быстро добавлять похожие записи подряд.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setKeepQuickContext((prev) => !prev)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                    keepQuickContext
                      ? "bg-indigo-500/20 border-indigo-500/40"
                      : "bg-slate-800 border-slate-700"
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
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Итоговый баланс
            </label>
            <input
              type="text"
              required
              value={slotBalance}
              onChange={(event) =>
                setSlotBalance(formatInputWithCommas(event.target.value))
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Например, 7 980"
            />
          </div>

          {!editingSession && (
            <p className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-[11px] text-slate-500 leading-5">
              Совет: если вы играете одинаковой ставкой или похожими сериями,
              используйте быстрые кнопки выше и включайте быструю запись. Это
              заметно ускоряет добавление сессий.
            </p>
          )}

          <div className="sticky bottom-20 z-10 -mx-1 rounded-2xl border border-slate-800 bg-slate-950/90 p-3 shadow-2xl shadow-slate-950/40 backdrop-blur-md">
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-4 text-base font-semibold text-white transition-colors shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 active:bg-indigo-800"
            >
              {editingSession ? "Сохранить изменения" : "Добавить запись"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
