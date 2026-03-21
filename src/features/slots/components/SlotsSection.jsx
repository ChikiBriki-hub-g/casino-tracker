import React from "react";
import { MAX_RECENT_SESSIONS, SESSION_TAGS } from "../constants";
import SlotSearchModal from "./SlotSearchModal";
import SlotsTab from "./SlotsTab";

export default function SlotsSection({ slots, analytics, currency }) {
  return (
    <>
      <SlotsTab
        editingSession={slots.editingSession}
        handleCreateNewGroup={slots.handleCreateNewGroup}
        slotGroups={slots.slotGroups}
        activeGroupId={slots.activeGroupId}
        handleAddSlotSession={slots.handleAddSlotSession}
        resetSlotForm={slots.resetSlotForm}
        lastSessionInActiveGroup={slots.lastSessionInActiveGroup}
        currency={currency}
        handleRepeatLastSlot={slots.handleRepeatLastSlot}
        handleUseLastBet={slots.handleUseLastBet}
        handleDuplicateLastSession={slots.handleDuplicateLastSession}
        setIsSlotSearchOpen={slots.setIsSlotSearchOpen}
        slotName={slots.slotName}
        slotProvider={slots.slotProvider}
        slotBet={slots.slotBet}
        setSlotBet={slots.setSlotBet}
        slotSpins={slots.slotSpins}
        setSlotSpins={slots.setSlotSpins}
        slotBonuses={slots.slotBonuses}
        handleBonusesChange={slots.handleBonusesChange}
        setBonusCount={slots.setBonusCount}
        slotBonusWins={slots.slotBonusWins}
        handleBonusWinChange={slots.handleBonusWinChange}
        SESSION_TAGS={SESSION_TAGS}
        slotTags={slots.slotTags}
        setSlotTags={slots.setSlotTags}
        keepQuickContext={slots.keepQuickContext}
        setKeepQuickContext={slots.setKeepQuickContext}
        slotBalance={slots.slotBalance}
        setSlotBalance={slots.setSlotBalance}
        recentSessions={slots.recentSessions}
        MAX_RECENT_SESSIONS={MAX_RECENT_SESSIONS}
        formatDate={slots.formatDate}
        getSessionBadges={analytics.getSessionBadges}
        getMetricBadgeClass={analytics.getMetricBadgeClass}
        applySessionToForm={slots.applySessionToForm}
        handleStartEditSession={slots.handleStartEditSession}
        handleDuplicateSession={slots.handleDuplicateSession}
        pendingDelete={slots.pendingDelete}
        handleDeleteGroup={slots.handleDeleteGroup}
        clearPendingDelete={slots.clearPendingDelete}
        handleRequestDeleteGroup={slots.handleRequestDeleteGroup}
        copiedGroupId={slots.copiedGroupId}
        copyToClipboard={slots.copyToClipboard}
        setActiveGroupId={slots.setActiveGroupId}
        handleDeleteSlotSession={slots.handleDeleteSlotSession}
        handleRequestDeleteSession={slots.handleRequestDeleteSession}
      />
      <SlotSearchModal slots={slots} />
    </>
  );
}
