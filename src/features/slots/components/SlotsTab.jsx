import React from "react";
import SlotEntryForm from "./SlotEntryForm";
import RecentSessionsPanel from "./RecentSessionsPanel";
import SlotGroupsPanel from "./SlotGroupsPanel";

export default function SlotsTab(props) {
  const {
    hasManualDeposits,
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
    slotMode,
    setSlotMode,
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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <SlotEntryForm
        hasManualDeposits={hasManualDeposits}
        editingSession={editingSession}
        handleCreateNewGroup={handleCreateNewGroup}
        handleAddSlotSession={handleAddSlotSession}
        resetSlotForm={resetSlotForm}
        lastSessionInActiveGroup={lastSessionInActiveGroup}
        currency={currency}
        handleRepeatLastSlot={handleRepeatLastSlot}
        handleUseLastBet={handleUseLastBet}
        handleDuplicateLastSession={handleDuplicateLastSession}
        setIsSlotSearchOpen={setIsSlotSearchOpen}
        slotName={slotName}
        slotMode={slotMode}
        setSlotMode={setSlotMode}
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
