import React from "react";
import SlotEntryForm from "./SlotEntryForm";
import RecentSessionsPanel from "./RecentSessionsPanel";
import SlotGroupsPanel from "./SlotGroupsPanel";

export default function SlotsTab(props) {
  const {
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
    SESSION_TAGS,
    slotTags,
    setSlotTags,
    keepQuickContext,
    setKeepQuickContext,
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
  } = props;
  const activeGroup = slotGroups.find((group) => group.id === activeGroupId);
  const activeGroupItems = activeGroup?.items || [];
  const latestSession = activeGroupItems[0];
  const totalRecords = slotGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Активная сессия
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {activeGroup?.name || "Не выбрана"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Записей в ней: {activeGroupItems.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Последний слот
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {latestSession?.name || "Пока пусто"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {latestSession?.provider || "Провайдер появится после записи"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Режим ввода
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-100">
            {editingSession
              ? "Редактирование"
              : keepQuickContext
                ? "Быстрая запись"
                : "Обычная запись"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Всего записей: {totalRecords}
          </p>
        </div>
      </div>

      <SlotEntryForm
        editingSession={editingSession}
        handleCreateNewGroup={handleCreateNewGroup}
        slotGroups={slotGroups}
        activeGroupId={activeGroupId}
        handleAddSlotSession={handleAddSlotSession}
        resetSlotForm={resetSlotForm}
        lastSessionInActiveGroup={lastSessionInActiveGroup}
        currency={currency}
        handleRepeatLastSlot={handleRepeatLastSlot}
        handleUseLastBet={handleUseLastBet}
        handleDuplicateLastSession={handleDuplicateLastSession}
        setIsSlotSearchOpen={setIsSlotSearchOpen}
        slotName={slotName}
        slotProvider={slotProvider}
        slotBet={slotBet}
        setSlotBet={setSlotBet}
        slotSpins={slotSpins}
        setSlotSpins={setSlotSpins}
        slotBonuses={slotBonuses}
        handleBonusesChange={handleBonusesChange}
        setBonusCount={setBonusCount}
        slotBonusWins={slotBonusWins}
        handleBonusWinChange={handleBonusWinChange}
        sessionTags={SESSION_TAGS}
        slotTags={slotTags}
        setSlotTags={setSlotTags}
        keepQuickContext={keepQuickContext}
        setKeepQuickContext={setKeepQuickContext}
        slotBalance={slotBalance}
        setSlotBalance={setSlotBalance}
      />

      <RecentSessionsPanel
        recentSessions={recentSessions}
        maxRecentSessions={MAX_RECENT_SESSIONS}
        currency={currency}
        formatDate={formatDate}
        getSessionBadges={getSessionBadges}
        getMetricBadgeClass={getMetricBadgeClass}
        applySessionToForm={applySessionToForm}
        handleStartEditSession={handleStartEditSession}
        handleDuplicateSession={handleDuplicateSession}
      />

      <SlotGroupsPanel
        slotGroups={slotGroups}
        activeGroupId={activeGroupId}
        setActiveGroupId={setActiveGroupId}
        pendingDelete={pendingDelete}
        handleDeleteGroup={handleDeleteGroup}
        clearPendingDelete={clearPendingDelete}
        handleRequestDeleteGroup={handleRequestDeleteGroup}
        copiedGroupId={copiedGroupId}
        copyToClipboard={copyToClipboard}
        handleDeleteSlotSession={handleDeleteSlotSession}
        handleStartEditSession={handleStartEditSession}
        handleRequestDeleteSession={handleRequestDeleteSession}
        currency={currency}
        getSessionBadges={getSessionBadges}
        getMetricBadgeClass={getMetricBadgeClass}
      />
    </div>
  );
}
