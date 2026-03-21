import { useCallback, useMemo, useState } from "react";
import {
  calculateX,
  formatDisplayMoney,
  formatInputWithCommas,
  formatShortDateTime,
  includesSlotQuery,
  mergeUniqueSlots,
  normalizeSlotName,
  parseAmount,
  parseValidDate,
} from "../../../utils/casino";

const useSlots = ({
  currency,
  popularSlots,
  popularSlotProviderMap,
  maxRecentSlots,
}) => {
  const [slotGroups, setSlotGroups] = useState([
    { id: crypto.randomUUID(), name: "Сессия 1", items: [] },
  ]);
  const [activeGroupId, setActiveGroupId] = useState(slotGroups[0].id);
  const [slotName, setSlotName] = useState("");
  const [slotBet, setSlotBet] = useState("");
  const [slotSpins, setSlotSpins] = useState("");
  const [slotBonuses, setSlotBonuses] = useState("");
  const [slotBonusWins, setSlotBonusWins] = useState([]);
  const [slotBalance, setSlotBalance] = useState("");
  const [slotProvider, setSlotProvider] = useState("");
  const [slotTags, setSlotTags] = useState([]);
  const [keepQuickContext, setKeepQuickContext] = useState(true);
  const [copiedGroupId, setCopiedGroupId] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isSlotSearchOpen, setIsSlotSearchOpen] = useState(false);
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [customSlots, setCustomSlots] = useState([]);
  const [favoriteSlots, setFavoriteSlots] = useState([]);
  const [slotProviders, setSlotProviders] = useState({});
  const [newSlotProvider, setNewSlotProvider] = useState("");

  const allSlots = useMemo(
    () => mergeUniqueSlots([...popularSlots, ...customSlots, ...favoriteSlots]),
    [customSlots, favoriteSlots, popularSlots],
  );
  const normalizedSlotSearchQuery = normalizeSlotName(slotSearchQuery);
  const favoriteSlotSet = useMemo(
    () => new Set(favoriteSlots.map((slot) => slot.toLowerCase())),
    [favoriteSlots],
  );
  const customSlotSet = useMemo(
    () => new Set(customSlots.map((slot) => slot.toLowerCase())),
    [customSlots],
  );
  const hasExactSlotMatch = useMemo(
    () =>
      allSlots.some(
        (slot) =>
          slot.toLowerCase() === normalizedSlotSearchQuery.toLowerCase(),
      ),
    [allSlots, normalizedSlotSearchQuery],
  );

  const recentSessions = useMemo(() => {
    const all = slotGroups.flatMap((group) =>
      group.items.map((item, index) => {
        const prevItem = group.items[index + 1];
        const balance = parseAmount(item.balance);
        const prevBalance = prevItem
          ? parseAmount(prevItem.balance)
          : Number.NaN;
        const hasDelta = !Number.isNaN(balance) && !Number.isNaN(prevBalance);
        const sessionDelta = hasDelta ? balance - prevBalance : null;
        const stake = parseAmount(item.bet) * (parseInt(item.spins, 10) || 0);
        const roi =
          hasDelta && !Number.isNaN(stake) && stake > 0
            ? (sessionDelta / stake) * 100
            : null;
        const bestX = Math.max(
          0,
          ...(item.bonusWins || []).map(
            (win) => Number(calculateX(win, item.bet)) || 0,
          ),
        );

        return {
          ...item,
          groupId: group.id,
          groupName: group.name,
          sessionDelta,
          hasDelta,
          roi,
          bestX,
        };
      }),
    );

    return all.slice().sort((a, b) => {
      const aTime = parseValidDate(a.date)?.getTime() ?? 0;
      const bTime = parseValidDate(b.date)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [slotGroups]);

  const recentSlots = useMemo(() => {
    const unique = [];
    const seen = new Set();

    recentSessions.forEach((session) => {
      const normalized = normalizeSlotName(session.name || "");
      const key = normalized.toLowerCase();
      if (!normalized || seen.has(key)) return;
      seen.add(key);
      unique.push(normalized);
    });

    return unique.slice(0, maxRecentSlots);
  }, [maxRecentSlots, recentSessions]);

  const providerBySlot = useMemo(() => {
    const map = new Map();

    Object.entries(popularSlotProviderMap).forEach(([slot, provider]) => {
      const normalizedSlot = normalizeSlotName(slot);
      const normalizedProvider = (provider || "").trim();
      if (!normalizedSlot || !normalizedProvider) return;
      map.set(normalizedSlot.toLowerCase(), normalizedProvider);
    });

    const seenSessionProviders = new Set();
    recentSessions.forEach((session) => {
      const slot = normalizeSlotName(session.name || "");
      const provider = (session.provider || "").trim();
      if (!slot || !provider) return;
      const key = slot.toLowerCase();
      if (seenSessionProviders.has(key)) return;
      seenSessionProviders.add(key);
      map.set(key, provider);
    });

    Object.entries(slotProviders).forEach(([slotKey, provider]) => {
      const normalizedSlotKey = normalizeSlotName(slotKey).toLowerCase();
      const normalizedProvider = (provider || "").trim();
      if (!normalizedSlotKey || !normalizedProvider) return;
      map.set(normalizedSlotKey, normalizedProvider);
    });

    return map;
  }, [popularSlotProviderMap, recentSessions, slotProviders]);

  const providerOptions = useMemo(() => {
    const unique = new Set(providerBySlot.values());
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [providerBySlot]);

  const slotSections = useMemo(() => {
    const recent = recentSlots.filter((slot) =>
      includesSlotQuery(slot, normalizedSlotSearchQuery),
    );
    const favorites = favoriteSlots.filter((slot) =>
      includesSlotQuery(slot, normalizedSlotSearchQuery),
    );
    const custom = customSlots.filter(
      (slot) =>
        !favoriteSlotSet.has(slot.toLowerCase()) &&
        includesSlotQuery(slot, normalizedSlotSearchQuery),
    );
    const popular = popularSlots.filter(
      (slot) =>
        !favoriteSlotSet.has(slot.toLowerCase()) &&
        includesSlotQuery(slot, normalizedSlotSearchQuery),
    );

    return [
      {
        id: "recent",
        title: "Недавние",
        emptyText: "Недавние слоты появятся после первых сессий.",
        items: recent,
      },
      {
        id: "favorites",
        title: "Избранные",
        emptyText: "Добавляйте слоты в избранное по звездочке.",
        items: favorites,
      },
      {
        id: "custom",
        title: "Ваши слоты",
        emptyText: "Здесь появятся слоты, которые вы добавили сами.",
        items: custom,
      },
      {
        id: "popular",
        title: "Популярные",
        emptyText: "Популярные слоты не найдены по вашему запросу.",
        items: popular,
      },
    ];
  }, [
    customSlots,
    favoriteSlotSet,
    favoriteSlots,
    normalizedSlotSearchQuery,
    popularSlots,
    recentSlots,
  ]);

  const activeGroup = useMemo(
    () => slotGroups.find((group) => group.id === activeGroupId),
    [activeGroupId, slotGroups],
  );
  const lastSessionInActiveGroup = activeGroup?.items?.[0] || null;

  const resetSlotForm = (options = {}) => {
    const { preserveQuickContext = false } = options;
    if (!preserveQuickContext) {
      setSlotName("");
      setSlotBet("");
      setSlotProvider("");
      setSlotTags([]);
    }
    setSlotBonuses("");
    setSlotBonusWins([]);
    setSlotSpins("");
    setSlotBalance("");
    setEditingSession(null);
  };

  const applySessionToForm = (session, options = {}) => {
    const { setEdit = false, forceGroupId } = options;
    if (forceGroupId) setActiveGroupId(forceGroupId);
    setSlotName(session.name || "");
    setSlotBet(session.bet || "");
    setSlotSpins(session.spins || "");
    setSlotBonuses(session.bonuses || "");
    setSlotBonusWins(session.bonusWins || []);
    setSlotBalance(session.balance || "");
    setSlotProvider(session.provider || "");
    setSlotTags(session.tags || []);
    setEditingSession(
      setEdit
        ? { groupId: session.groupId || forceGroupId, sessionId: session.id }
        : null,
    );
  };

  const rememberSlotProvider = (slot, provider) => {
    const normalizedSlot = normalizeSlotName(slot || "");
    const normalizedProvider = (provider || "").trim();
    if (!normalizedSlot || !normalizedProvider) return;

    setSlotProviders((prev) => ({
      ...prev,
      [normalizedSlot.toLowerCase()]: normalizedProvider,
    }));
  };

  const closeSlotSearch = () => {
    setIsSlotSearchOpen(false);
    setSlotSearchQuery("");
    setNewSlotProvider("");
  };

  const handleSlotSearchQueryChange = (value) => {
    setSlotSearchQuery(value);

    const normalized = normalizeSlotName(value);
    if (!normalized) {
      setNewSlotProvider("");
      return;
    }

    const hasMatch = allSlots.some(
      (slot) => slot.toLowerCase() === normalized.toLowerCase(),
    );

    setNewSlotProvider(
      hasMatch ? "" : providerBySlot.get(normalized.toLowerCase()) || "",
    );
  };

  const handleSelectSlot = (slot) => {
    setSlotName(slot);
    setSlotProvider(providerBySlot.get(slot.toLowerCase()) || "");
    closeSlotSearch();
  };

  const handleToggleFavoriteSlot = (slot) => {
    const normalized = normalizeSlotName(slot);
    if (!normalized) return;

    setFavoriteSlots((prev) => {
      const exists = prev.some(
        (favoriteSlot) =>
          favoriteSlot.toLowerCase() === normalized.toLowerCase(),
      );

      if (exists) {
        return prev.filter(
          (favoriteSlot) =>
            favoriteSlot.toLowerCase() !== normalized.toLowerCase(),
        );
      }

      return mergeUniqueSlots([...prev, normalized]);
    });
  };

  const handleAddCustomSlot = () => {
    if (!normalizedSlotSearchQuery) return;
    const provider = newSlotProvider.trim();

    setCustomSlots((prev) => {
      const existingSlots = mergeUniqueSlots([...popularSlots, ...prev]);
      const exists = existingSlots.some(
        (slot) =>
          slot.toLowerCase() === normalizedSlotSearchQuery.toLowerCase(),
      );

      if (exists) return prev;
      return mergeUniqueSlots([...prev, normalizedSlotSearchQuery]);
    });

    if (provider) {
      rememberSlotProvider(normalizedSlotSearchQuery, provider);
    }

    setSlotName(normalizedSlotSearchQuery);
    setSlotProvider(
      provider ||
        providerBySlot.get(normalizedSlotSearchQuery.toLowerCase()) ||
        "",
    );
    closeSlotSearch();
  };

  const handleBonusesChange = (event) => {
    const value = event.target.value;
    setSlotBonuses(value);

    const count = parseInt(value, 10) || 0;
    if (count > 0 && count <= 50) {
      setSlotBonusWins((prev) => {
        const nextWins = [...prev];
        while (nextWins.length < count) nextWins.push("");
        return nextWins.slice(0, count);
      });
      return;
    }

    setSlotBonusWins([]);
  };

  const handleBonusWinChange = (index, value) => {
    const nextWins = [...slotBonusWins];
    nextWins[index] = formatInputWithCommas(value);
    setSlotBonusWins(nextWins);
  };

  const setBonusCount = (count) => {
    const normalizedCount = Math.max(0, Number(count) || 0);
    setSlotBonuses(String(normalizedCount));

    if (normalizedCount > 0 && normalizedCount <= 50) {
      setSlotBonusWins((prev) => {
        const nextWins = [...prev];
        while (nextWins.length < normalizedCount) nextWins.push("");
        return nextWins.slice(0, normalizedCount);
      });
      return;
    }

    setSlotBonusWins([]);
  };

  const handleAddSlotSession = (event) => {
    event.preventDefault();
    if (!slotName || !slotBet || !slotSpins || !slotBalance) return;

    const baseSession = {
      name: slotName.trim(),
      bet: slotBet.trim(),
      spins: slotSpins.trim(),
      bonuses: slotBonuses.trim() || "0",
      bonusWins: slotBonusWins.map((win) => win.trim()).filter(Boolean),
      balance: slotBalance.trim(),
      provider: slotProvider.trim(),
      tags: slotTags,
      sessionCurrency: currency,
    };

    if (baseSession.provider) {
      rememberSlotProvider(baseSession.name, baseSession.provider);
    }

    if (editingSession) {
      setSlotGroups((prev) =>
        prev.map((group) =>
          group.id === editingSession.groupId
            ? {
                ...group,
                items: group.items.map((item) =>
                  item.id === editingSession.sessionId
                    ? { ...item, ...baseSession }
                    : item,
                ),
              }
            : group,
        ),
      );
      resetSlotForm();
      return;
    }

    const newSession = {
      ...baseSession,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    setSlotGroups((prev) =>
      prev.map((group) =>
        group.id === activeGroupId
          ? { ...group, items: [newSession, ...group.items] }
          : group,
      ),
    );
    resetSlotForm({ preserveQuickContext: keepQuickContext });
  };

  const handleRepeatLastSlot = () => {
    if (!lastSessionInActiveGroup) return;
    setSlotName(lastSessionInActiveGroup.name || "");
    setSlotProvider(lastSessionInActiveGroup.provider || "");
    setEditingSession(null);
  };

  const handleUseLastBet = () => {
    if (!lastSessionInActiveGroup) return;
    setSlotBet(lastSessionInActiveGroup.bet || "");
    setEditingSession(null);
  };

  const handleDuplicateLastSession = () => {
    if (!lastSessionInActiveGroup) return;
    const duplicate = {
      ...lastSessionInActiveGroup,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    setSlotGroups((prev) =>
      prev.map((group) =>
        group.id === activeGroupId
          ? { ...group, items: [duplicate, ...group.items] }
          : group,
      ),
    );
  };

  const handleStartEditSession = (groupId, session) => {
    applySessionToForm(
      { ...session, groupId },
      { setEdit: true, forceGroupId: groupId },
    );
  };

  const handleDuplicateSession = (session, targetGroupId = activeGroupId) => {
    if (!targetGroupId) return;

    const rest = { ...session };
    delete rest.groupId;
    delete rest.groupName;

    const duplicate = {
      ...rest,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      sessionCurrency: rest.sessionCurrency || currency,
    };

    setSlotGroups((prev) =>
      prev.map((group) =>
        group.id === targetGroupId
          ? { ...group, items: [duplicate, ...group.items] }
          : group,
      ),
    );
  };

  const handleDeleteSlotSession = (groupId, sessionId) => {
    setSlotGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: group.items.filter((session) => session.id !== sessionId),
            }
          : group,
      ),
    );
  };

  const handleRequestDeleteSession = (groupId, sessionId) => {
    setPendingDelete({ type: "session", groupId, sessionId });
  };

  const handleRequestDeleteGroup = (groupId) => {
    setPendingDelete({ type: "group", groupId });
  };

  const clearPendingDelete = () => setPendingDelete(null);

  const handleCreateNewGroup = () => {
    const newId = crypto.randomUUID();
    setSlotGroups((prev) => [
      { id: newId, name: `Сессия ${prev.length + 1}`, items: [] },
      ...prev,
    ]);
    setActiveGroupId(newId);
  };

  const handleDeleteGroup = (groupId) => {
    if (slotGroups.length <= 1) return;
    const filtered = slotGroups.filter((group) => group.id !== groupId);
    setSlotGroups(filtered);
    if (activeGroupId === groupId) {
      setActiveGroupId(filtered[0].id);
    }
  };

  const getBonusWord = (num) => {
    const normalized = Math.abs(num) % 100;
    const lastDigit = normalized % 10;
    if (normalized > 10 && normalized < 20) return "бонусок";
    if (lastDigit > 1 && lastDigit < 5) return "бонуски";
    if (lastDigit === 1) return "бонуска";
    return "бонусок";
  };

  const formatSlotText = (session) => {
    const sessionCurrency = session.sessionCurrency || currency;
    let text = `${session.name} - ставка ${session.bet}${sessionCurrency} - ${session.spins} спинов`;
    const bonusesCount = Number(session.bonuses);

    text += ` - ${bonusesCount} ${getBonusWord(bonusesCount)}`;

    if (bonusesCount > 0 && session.bonusWins && session.bonusWins.length > 0) {
      const winsWithX = session.bonusWins.map((win) => {
        const x = calculateX(win, session.bet);
        return x
          ? `${win}${sessionCurrency} (x${x})`
          : `${win}${sessionCurrency}`;
      });
      const winsText = winsWithX.join(" + ");
      if (winsText) {
        text += ` (${winsText})`;
      }
    }

    text += ` - Баланс: ${session.balance}${sessionCurrency}`;
    if (session.provider) text += ` - Провайдер: ${session.provider}`;
    if (session.tags && session.tags.length > 0) {
      text += ` - Теги: ${session.tags.join(", ")}`;
    }
    return text;
  };

  const copyToClipboard = async (groupId) => {
    const group = slotGroups.find((item) => item.id === groupId);
    if (!group || group.items.length === 0) return;

    const textToCopy = [...group.items]
      .reverse()
      .map(formatSlotText)
      .join("\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedGroupId(groupId);
      window.setTimeout(() => setCopiedGroupId(null), 2000);
    } catch (error) {
      console.error("Ошибка копирования", error);
    }
  };

  const hydrate = useCallback(({ groups, custom, favorites, providers }) => {
    if (Array.isArray(groups) && groups.length > 0) {
      setSlotGroups(groups);
      setActiveGroupId(groups[0].id);
    }
    if (Array.isArray(custom)) setCustomSlots(custom);
    if (Array.isArray(favorites)) setFavoriteSlots(favorites);
    if (
      providers &&
      typeof providers === "object" &&
      !Array.isArray(providers)
    ) {
      setSlotProviders(providers);
    }
  }, []);

  const resetAllSlotsData = useCallback(() => {
    const nextGroup = {
      id: crypto.randomUUID(),
      name: "Сессия 1",
      items: [],
    };

    setSlotGroups([nextGroup]);
    setActiveGroupId(nextGroup.id);
    setCustomSlots([]);
    setFavoriteSlots([]);
    setSlotProviders({});
    setSlotSearchQuery("");
    setNewSlotProvider("");
    closeSlotSearch();
    resetSlotForm();
    setKeepQuickContext(true);
    setCopiedGroupId(null);
    setPendingDelete(null);
  }, []);

  return {
    slotGroups,
    setSlotGroups,
    activeGroupId,
    setActiveGroupId,
    slotName,
    slotBet,
    slotSpins,
    slotBonuses,
    slotBonusWins,
    slotBalance,
    slotProvider,
    slotTags,
    keepQuickContext,
    copiedGroupId,
    editingSession,
    pendingDelete,
    isSlotSearchOpen,
    slotSearchQuery,
    customSlots,
    favoriteSlots,
    favoriteSlotSet,
    customSlotSet,
    slotProviders,
    newSlotProvider,
    allSlots,
    recentSessions,
    recentSlots,
    providerBySlot,
    providerOptions,
    slotSections,
    activeGroup,
    lastSessionInActiveGroup,
    normalizedSlotSearchQuery,
    hasExactSlotMatch,
    setIsSlotSearchOpen,
    setSlotSearchQuery: handleSlotSearchQueryChange,
    setSlotBet: (value) => setSlotBet(formatInputWithCommas(value)),
    setSlotSpins,
    setSlotBalance: (value) => setSlotBalance(formatInputWithCommas(value)),
    setSlotTags,
    setKeepQuickContext,
    setNewSlotProvider,
    handleBonusesChange,
    setBonusCount,
    handleBonusWinChange,
    handleAddSlotSession,
    resetSlotForm,
    applySessionToForm,
    handleRepeatLastSlot,
    handleUseLastBet,
    handleDuplicateLastSession,
    handleStartEditSession,
    handleDuplicateSession,
    handleDeleteSlotSession,
    handleRequestDeleteSession,
    handleRequestDeleteGroup,
    handleDeleteGroup,
    clearPendingDelete,
    handleCreateNewGroup,
    handleSelectSlot,
    handleToggleFavoriteSlot,
    handleAddCustomSlot,
    closeSlotSearch,
    copyToClipboard,
    formatDate: formatShortDateTime,
    formatMoney: (value) => formatDisplayMoney(value, currency),
    hydrate,
    resetAllSlotsData,
  };
};

export default useSlots;
