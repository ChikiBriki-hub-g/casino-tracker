import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  PlusCircle,
  Wallet,
  Activity,
  Loader2,
  Gamepad2,
  CheckCircle2,
  Search,
  X,
  Star,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { POPULAR_SLOTS } from "./constants/slots";
import {
  SESSION_TAGS,
  MAX_RECENT_SLOTS,
  MAX_RECENT_SESSIONS,
  PERIOD_FILTERS,
  CURRENCY_OPTIONS,
} from "./constants/analytics";
import AnalyticsTab from "./components/analytics/AnalyticsTab";
import FinanceTab from "./components/finance/FinanceTab";
import SlotsTab from "./components/slots/SlotsTab";
import {
  formatInputWithCommas,
  parseAmount,
  calculateX,
  normalizeSlotName,
  mergeUniqueSlots,
  includesSlotQuery,
  parseValidDate,
} from "./utils/casino";

export default function App() {
  // --- ИДЕНТИФИКАЦИЯ ТЕЛЕГРАМ ---
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
  const isProd = process.env.NODE_ENV === "production";
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    "",
  );
  const initData = tg?.initData || "";

  const [authState, setAuthState] = useState({
    status: "checking", // 'checking' | 'ok' | 'error'
    userId: null,
    error: "",
  });

  useEffect(() => {
    tg?.ready?.();
  }, [tg]);

  useEffect(() => {
    let isMounted = true;

    const setError = (message) => {
      if (!isMounted) return;
      setAuthState({ status: "error", userId: null, error: message });
    };

    const verify = async () => {
      if (!initData) {
        if (!isProd) {
          setAuthState({
            status: "ok",
            userId: "local_test_user",
            error: "",
          });
          return;
        }
        setError("Откройте приложение через Telegram.");
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/tma/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (!response.ok) throw new Error("verify_failed");
        const data = await response.json();
        if (!data?.ok || !data?.user?.id) {
          throw new Error("verify_invalid");
        }
        if (!isMounted) return;
        setAuthState({
          status: "ok",
          userId: data.user.id.toString(),
          error: "",
        });
      } catch (error) {
        setError(
          "Не удалось проверить авторизацию Telegram. Попробуйте позже.",
        );
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [tg, isProd, apiBase, initData]);

  const userId = authState.userId;

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const skipInitialSave = useRef(true); // Предотвращает перезапись базы при первой загрузке
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'error'

  // --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ---
  const [currency, setCurrency] = useState("₽");

  // --- СОСТОЯНИЕ НАВИГАЦИИ ---
  const [activeTab, setActiveTab] = useState("finance"); // 'finance' | 'slots' | 'analytics'

  // --- СОСТОЯНИЕ ФИНАНСОВ ---
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // --- СОСТОЯНИЕ СЛОТОВ (СЕССИИ) ---
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
  const [copiedGroupId, setCopiedGroupId] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [analyticsActionState, setAnalyticsActionState] = useState("");

  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");
  const [analyticsProvider, setAnalyticsProvider] = useState("all");
  const [analyticsCurrency, setAnalyticsCurrency] = useState("all");
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [filterCustomOnly, setFilterCustomOnly] = useState(false);

  // --- СОСТОЯНИЕ ПОИСКА СЛОТОВ ---
  const [isSlotSearchOpen, setIsSlotSearchOpen] = useState(false);
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [customSlots, setCustomSlots] = useState([]);
  const [favoriteSlots, setFavoriteSlots] = useState([]);

  const allSlots = useMemo(
    () =>
      mergeUniqueSlots([...POPULAR_SLOTS, ...customSlots, ...favoriteSlots]),
    [customSlots, favoriteSlots],
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
        const prevBalance = prevItem ? parseAmount(prevItem.balance) : NaN;
        const hasDelta = !isNaN(balance) && !isNaN(prevBalance);
        const sessionDelta = hasDelta ? balance - prevBalance : null;
        const stake = parseAmount(item.bet) * (parseInt(item.spins, 10) || 0);
        const roi =
          hasDelta && !isNaN(stake) && stake > 0
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
    return unique.slice(0, MAX_RECENT_SLOTS);
  }, [recentSessions]);

  const providerBySlot = useMemo(() => {
    const map = new Map();
    recentSessions.forEach((session) => {
      const slot = normalizeSlotName(session.name || "");
      const provider = (session.provider || "").trim();
      if (!slot || !provider) return;
      const key = slot.toLowerCase();
      if (!map.has(key)) map.set(key, provider);
    });
    return map;
  }, [recentSessions]);

  const providerOptions = useMemo(() => {
    const unique = new Set();
    recentSessions.forEach((session) => {
      const provider = (session.provider || "").trim();
      if (provider) unique.add(provider);
    });
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [recentSessions]);

  // Фильтрация слотов по поиску
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
    const popular = POPULAR_SLOTS.filter(
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
    recentSlots,
    customSlots,
    favoriteSlotSet,
    favoriteSlots,
    normalizedSlotSearchQuery,
  ]);

  const activeGroup = useMemo(
    () => slotGroups.find((group) => group.id === activeGroupId),
    [slotGroups, activeGroupId],
  );
  const lastSessionInActiveGroup = activeGroup?.items?.[0] || null;

  // --- ЗАГРУЗКА И СОХРАНЕНИЕ В FIREBASE ---
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const loadData = async () => {
      try {
        skipInitialSave.current = true;
        setIsDataLoaded(false);
        const response = await fetch(`${apiBase}/api/user/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (!response.ok) throw new Error("load_failed");
        const data = await response.json();
        if (!data?.ok) throw new Error("load_invalid");

        const payload = data.data || {};
        if (!isMounted) return;
        if (payload.transactions) setTransactions(payload.transactions);
        if (payload.slotGroups && payload.slotGroups.length > 0) {
          setSlotGroups(payload.slotGroups);
          setActiveGroupId(payload.slotGroups[0].id);
        }
        if (payload.customSlots) setCustomSlots(payload.customSlots);
        if (payload.favoriteSlots) setFavoriteSlots(payload.favoriteSlots);
        if (payload.currency) setCurrency(payload.currency);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        if (isMounted) setIsDataLoaded(true);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId, apiBase, initData]);

  // Умное моментальное автосохранение
  useEffect(() => {
    if (!isDataLoaded || !userId) return;

    // Пропускаем самый первый рендер после загрузки, чтобы не перезаписать базу
    if (skipInitialSave.current) {
      skipInitialSave.current = false;
      return;
    }

    const saveData = async () => {
      setSaveStatus("saving");
      try {
        const response = await fetch(`${apiBase}/api/user/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData,
            data: {
              transactions,
              slotGroups,
              customSlots,
              favoriteSlots,
              currency,
            },
          }),
        });
        if (!response.ok) throw new Error("save_failed");
        const data = await response.json();
        if (!data?.ok) throw new Error("save_invalid");
        setSaveStatus("saved");
      } catch (error) {
        console.error("Ошибка сохранения данных:", error);
        setSaveStatus("error");
      }
    };

    saveData();
  }, [
    transactions,
    slotGroups,
    customSlots,
    favoriteSlots,
    currency,
    isDataLoaded,
    userId,
    apiBase,
    initData,
  ]);

  // --- ВЫЧИСЛЕНИЯ ФИНАНСОВ ---
  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach((t) => {
      if (t.type === "deposit") {
        totalDeposits += t.amount;
      } else if (t.type === "withdraw") {
        totalWithdrawals += t.amount;
      }
    });

    const netProfit = totalWithdrawals - totalDeposits;
    const roi =
      totalDeposits > 0 ? ((netProfit / totalDeposits) * 100).toFixed(1) : 0;
    const isProfitable = netProfit >= 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netProfit,
      roi,
      isProfitable,
    };
  }, [transactions]);

  // --- ОБРАБОТЧИКИ ФИНАНСОВ ---
  const openModal = (type) => {
    setTransactionType(type);
    setAmount("");
    setNote("");
    setIsModalOpen(true);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTransaction = {
      id: crypto.randomUUID(),
      type: transactionType,
      amount: parsedAmount,
      note:
        note.trim() || (transactionType === "deposit" ? "Депозит" : "Вывод"),
      date: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // --- ОБРАБОТЧИКИ СЛОТОВ ---
  const handleBonusesChange = (e) => {
    const val = e.target.value;
    setSlotBonuses(val);

    const count = parseInt(val, 10) || 0;
    if (count > 0 && count <= 50) {
      setSlotBonusWins((prev) => {
        const newWins = [...prev];
        while (newWins.length < count) newWins.push("");
        return newWins.slice(0, count);
      });
    } else {
      setSlotBonusWins([]);
    }
  };

  const handleBonusWinChange = (index, value) => {
    const newWins = [...slotBonusWins];
    newWins[index] = formatInputWithCommas(value);
    setSlotBonusWins(newWins);
  };

  const resetSlotForm = () => {
    setSlotName("");
    setSlotBet("");
    setSlotBonuses("");
    setSlotBonusWins([]);
    setSlotSpins("");
    setSlotBalance("");
    setSlotProvider("");
    setSlotTags([]);
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

  const closeSlotSearch = () => {
    setIsSlotSearchOpen(false);
    setSlotSearchQuery("");
  };

  const handleSelectSlot = (slot) => {
    setSlotName(slot);
    const provider = providerBySlot.get(slot.toLowerCase());
    setSlotProvider(provider || "");
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

    setCustomSlots((prev) => {
      const existingSlots = mergeUniqueSlots([...POPULAR_SLOTS, ...prev]);
      const exists = existingSlots.some(
        (slot) =>
          slot.toLowerCase() === normalizedSlotSearchQuery.toLowerCase(),
      );

      if (exists) return prev;
      return mergeUniqueSlots([...prev, normalizedSlotSearchQuery]);
    });

    handleSelectSlot(normalizedSlotSearchQuery);
  };

  const renderSlotOption = (slot) => {
    const isFavorite = favoriteSlotSet.has(slot.toLowerCase());

    return (
      <div
        key={slot}
        className="flex items-center gap-2 rounded-xl hover:bg-slate-800 transition-colors"
      >
        <button
          type="button"
          onClick={() => handleSelectSlot(slot)}
          className="flex-1 text-left px-4 py-3 text-slate-200"
        >
          {slot}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleToggleFavoriteSlot(slot);
          }}
          className="mr-2 rounded-lg p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-700 transition-colors"
          aria-label={
            isFavorite
              ? `Убрать ${slot} из избранного`
              : `Добавить ${slot} в избранное`
          }
          title={isFavorite ? "Убрать из избранного" : "В избранное"}
        >
          <Star
            size={18}
            className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
          />
        </button>
      </div>
    );
  };

  const renderSlotSection = (section) => {
    const showEmptyState =
      !normalizedSlotSearchQuery &&
      section.id !== "popular" &&
      section.items.length === 0;

    if (section.items.length === 0 && !showEmptyState) {
      return null;
    }

    return (
      <section key={section.id} className="space-y-2">
        <div className="px-2 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {section.title}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
          {section.items.length > 0 ? (
            section.items.map(renderSlotOption)
          ) : (
            <div className="px-4 py-4 text-sm text-slate-500">
              {section.emptyText}
            </div>
          )}
        </div>
      </section>
    );
  };

  const handleAddSlotSession = (e) => {
    e.preventDefault();
    if (!slotName || !slotBet || !slotSpins || !slotBalance) return;

    const baseSession = {
      name: slotName.trim(),
      bet: slotBet.trim(),
      spins: slotSpins.trim(),
      bonuses: slotBonuses.trim() || "0",
      bonusWins: slotBonusWins.map((w) => w.trim()).filter((w) => w !== ""),
      balance: slotBalance.trim(),
      provider: slotProvider.trim(),
      tags: slotTags,
      sessionCurrency: currency,
    };

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

    // Добавляем лог в АКТИВНУЮ сессию
    setSlotGroups((prev) =>
      prev.map((group) =>
        group.id === activeGroupId
          ? { ...group, items: [newSession, ...group.items] }
          : group,
      ),
    );

    resetSlotForm();
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
    const { groupId, groupName, ...rest } = session;
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
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            items: g.items.filter((s) => s.id !== sessionId),
          };
        }
        return g;
      }),
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
    if (slotGroups.length <= 1) return; // Не удаляем последнюю сессию
    const filtered = slotGroups.filter((g) => g.id !== groupId);
    setSlotGroups(filtered);
    if (activeGroupId === groupId) {
      setActiveGroupId(filtered[0].id);
    }
  };

  // Склонение слова "бонуска"
  const getBonusWord = (num) => {
    const n = Math.abs(num) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return "бонусок";
    if (n1 > 1 && n1 < 5) return "бонуски";
    if (n1 === 1) return "бонуска";
    return "бонусок";
  };

  const formatSlotText = (session) => {
    const cur = session.sessionCurrency || currency;
    let text = `${session.name} - ставка ${session.bet}${cur} - ${session.spins} спинов`;
    const bonusesCount = Number(session.bonuses);

    text += ` - ${bonusesCount} ${getBonusWord(bonusesCount)}`;

    if (bonusesCount > 0 && session.bonusWins && session.bonusWins.length > 0) {
      const winsWithX = session.bonusWins.map((win) => {
        const x = calculateX(win, session.bet);
        return x ? `${win}${cur} (x${x})` : `${win}${cur}`;
      });
      const winsText = winsWithX.join(" + ");
      if (winsText) {
        text += ` (${winsText})`;
      }
    }

    text += ` - Баланс: ${session.balance}${cur}`;
    if (session.provider) {
      text += ` - Провайдер: ${session.provider}`;
    }
    if (session.tags && session.tags.length > 0) {
      text += ` - Теги: ${session.tags.join(", ")}`;
    }
    return text;
  };

  const copyToClipboard = (groupId) => {
    const group = slotGroups.find((g) => g.id === groupId);
    if (!group || group.items.length === 0) return;

    const textToCopy = [...group.items]
      .reverse()
      .map(formatSlotText)
      .join("\n");
    copyPlainText(textToCopy, "").then((ok) => {
      if (!ok) return;
      setCopiedGroupId(groupId);
      window.setTimeout(() => setCopiedGroupId(null), 2000);
    });
  };

  // --- УТИЛИТЫ ---
  const formatMoney = (val) => {
    const formatted = Math.round(val).toLocaleString("en-US"); // формат с запятыми 1,000
    return `${formatted} ${currency}`;
  };

  const formatMoneyWithCurrency = (val, cur) => {
    const formatted = Math.round(val).toLocaleString("en-US");
    return `${formatted} ${cur}`;
  };

  const formatNumber = (val) => Math.round(val).toLocaleString("en-US");

  const getPeriodStart = (periodId) => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (periodId === "today") return startOfToday;
    if (periodId === "7d") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      return start;
    }
    if (periodId === "30d") {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return start;
    }
    return null;
  };

  const getPeriodDays = (periodId) => {
    if (periodId === "today") return 1;
    if (periodId === "7d") return 7;
    if (periodId === "30d") return 30;
    return null;
  };

  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  const getMetricToneClass = (value) => {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-rose-400";
    return "text-slate-200";
  };

  const getMetricBadgeClass = (tone) => {
    if (tone === "positive") {
      return "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30";
    }
    if (tone === "negative") {
      return "bg-rose-500/10 text-rose-200 border border-rose-500/30";
    }
    if (tone === "accent") {
      return "bg-indigo-500/10 text-indigo-200 border border-indigo-500/30";
    }
    if (tone === "warning") {
      return "bg-amber-500/10 text-amber-200 border border-amber-500/30";
    }
    return "bg-slate-800 text-slate-200 border border-slate-700";
  };

  const copyPlainText = async (value, successState) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setAnalyticsActionState(successState);
      window.setTimeout(() => setAnalyticsActionState(""), 2000);
      return true;
    } catch (error) {
      console.error("Ошибка копирования", error);
      return false;
    }
  };

  const downloadTextFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sessionsForAnalyticsScope = useMemo(() => {
    const providerFilter = analyticsProvider.trim().toLowerCase();
    const currencyFilter = analyticsCurrency;
    const useFavorites = filterFavoritesOnly;
    const useCustom = filterCustomOnly;

    return recentSessions.filter((session) => {
      const sessionCurrency = session.sessionCurrency || currency;
      if (currencyFilter !== "all" && sessionCurrency !== currencyFilter) {
        return false;
      }
      if (
        providerFilter !== "all" &&
        providerFilter &&
        (session.provider || "").trim().toLowerCase() !== providerFilter
      ) {
        return false;
      }
      if (useFavorites || useCustom) {
        const slotKey = (session.name || "").toLowerCase();
        const isFavorite = favoriteSlotSet.has(slotKey);
        const isCustom = customSlotSet.has(slotKey);
        return (useFavorites && isFavorite) || (useCustom && isCustom);
      }
      return true;
    });
  }, [
    analyticsProvider,
    analyticsCurrency,
    filterFavoritesOnly,
    filterCustomOnly,
    recentSessions,
    favoriteSlotSet,
    customSlotSet,
    currency,
  ]);

  const filteredSessions = useMemo(() => {
    const periodStart = getPeriodStart(analyticsPeriod);
    if (!periodStart) return sessionsForAnalyticsScope;

    return sessionsForAnalyticsScope.filter((session) => {
      const sessionDate = parseValidDate(session.date);
      return sessionDate ? sessionDate >= periodStart : false;
    });
  }, [analyticsPeriod, sessionsForAnalyticsScope]);

  const analyticsSummary = useMemo(() => {
    const bets = filteredSessions
      .map((s) => parseAmount(s.bet))
      .filter((val) => !isNaN(val));
    const balances = filteredSessions
      .map((s) => parseAmount(s.balance))
      .filter((val) => !isNaN(val));
    const spins = filteredSessions
      .map((s) => parseInt(s.spins, 10))
      .filter((val) => !isNaN(val));

    const totalSessions = filteredSessions.length;
    const totalSpins = spins.reduce((sum, val) => sum + val, 0);
    const avgBet =
      bets.length > 0
        ? bets.reduce((sum, val) => sum + val, 0) / bets.length
        : 0;
    const lastBalance = balances.length > 0 ? balances[0] : 0;

    return {
      totalSessions,
      totalSpins,
      avgBet,
      lastBalance,
    };
  }, [filteredSessions]);

  const balanceSeries = useMemo(() => {
    const sorted = [...filteredSessions].sort(
      (a, b) =>
        new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
    );
    return sorted
      .map((session) => ({
        date: session.date,
        value: parseAmount(session.balance),
      }))
      .filter((point) => !isNaN(point.value));
  }, [filteredSessions]);

  const plSeries = useMemo(() => {
    if (balanceSeries.length < 2) return [];
    const dayMap = new Map();

    for (let i = 1; i < balanceSeries.length; i += 1) {
      const prev = balanceSeries[i - 1];
      const curr = balanceSeries[i];
      if (!prev?.date || !curr?.date) continue;
      const delta = curr.value - prev.value;
      const dayKey = new Date(curr.date).toISOString().slice(0, 10);
      dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + delta);
    }

    return Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, value]) => ({ day, value }));
  }, [balanceSeries]);

  const analyticsHighlights = useMemo(() => {
    const bestX = filteredSessions.reduce(
      (max, session) => Math.max(max, session.bestX || 0),
      0,
    );
    const topRoi = filteredSessions.reduce(
      (max, session) =>
        session.roi !== null && session.roi > max ? session.roi : max,
      Number.NEGATIVE_INFINITY,
    );
    const newestCutoff = Date.now() - 1000 * 60 * 60 * 24 * 3;

    const slotCounts = new Map();
    filteredSessions.forEach((session) => {
      const key = session.name || "Без названия";
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
    });

    const topSlot = [...slotCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const bestDay = [...plSeries].sort((a, b) => b.value - a.value)[0];

    return {
      bestX,
      topRoi: Number.isFinite(topRoi) ? topRoi : null,
      newestCutoff,
      topSlot,
      bestDay,
    };
  }, [filteredSessions, plSeries]);

  const slotAnalytics = useMemo(() => {
    const map = new Map();

    filteredSessions.forEach((session) => {
      const key = normalizeSlotName(session.name || "Без названия");
      const prev = map.get(key) || {
        slot: key,
        provider: session.provider || "",
        sessions: 0,
        totalResult: 0,
        betSum: 0,
        betCount: 0,
        turnover: 0,
        spins: 0,
        bonuses: 0,
        bonusWinsSum: 0,
        bonusWinsCount: 0,
        bestWin: 0,
        bestX: 0,
        bestSession: null,
        worstSession: null,
      };

      const bet = parseAmount(session.bet);
      const spins = parseInt(session.spins, 10) || 0;
      const bonuses = parseInt(session.bonuses, 10) || 0;
      const sessionDelta =
        session.hasDelta && typeof session.sessionDelta === "number"
          ? session.sessionDelta
          : null;
      const wins = (session.bonusWins || [])
        .map((win) => parseAmount(win))
        .filter((value) => !isNaN(value));

      prev.sessions += 1;
      if (sessionDelta !== null) {
        prev.totalResult += sessionDelta;
      }
      prev.spins += spins;
      prev.bonuses += bonuses;
      prev.bestX = Math.max(prev.bestX, session.bestX || 0);

      if (!isNaN(bet)) {
        prev.betSum += bet;
        prev.betCount += 1;
        prev.turnover += bet * spins;
      }
      if (wins.length > 0) {
        prev.bonusWinsSum += wins.reduce((sum, value) => sum + value, 0);
        prev.bonusWinsCount += wins.length;
        prev.bestWin = Math.max(prev.bestWin, ...wins);
      }

      if (
        sessionDelta !== null &&
        (!prev.bestSession || sessionDelta > prev.bestSession.value)
      ) {
        prev.bestSession = {
          id: session.id,
          value: sessionDelta,
          date: session.date,
          groupName: session.groupName,
        };
      }
      if (
        sessionDelta !== null &&
        (!prev.worstSession || sessionDelta < prev.worstSession.value)
      ) {
        prev.worstSession = {
          id: session.id,
          value: sessionDelta,
          date: session.date,
          groupName: session.groupName,
        };
      }

      map.set(key, prev);
    });

    return [...map.values()]
      .map((item) => ({
        ...item,
        averageBet: item.betCount > 0 ? item.betSum / item.betCount : 0,
        roi:
          item.turnover > 0 ? (item.totalResult / item.turnover) * 100 : null,
        bonusHitRate: item.spins > 0 ? (item.bonuses / item.spins) * 100 : null,
        averageBonusWin:
          item.bonusWinsCount > 0
            ? item.bonusWinsSum / item.bonusWinsCount
            : null,
        averageSpinsToBonus:
          item.bonuses > 0 ? item.spins / item.bonuses : null,
      }))
      .sort((a, b) => b.totalResult - a.totalResult);
  }, [filteredSessions]);

  const slotTops = useMemo(() => {
    const byRoiDesc = [...slotAnalytics]
      .filter((item) => item.roi !== null)
      .sort((a, b) => b.roi - a.roi);
    const byRoiAsc = [...slotAnalytics]
      .filter((item) => item.roi !== null)
      .sort((a, b) => a.roi - b.roi);
    const byFreq = [...slotAnalytics].sort((a, b) => b.sessions - a.sessions);
    const byX = [...slotAnalytics].sort((a, b) => b.bestX - a.bestX);
    const byProfit = [...slotAnalytics].sort(
      (a, b) => b.totalResult - a.totalResult,
    );

    return {
      bestSlots: byRoiDesc.slice(0, 5),
      worstSlots: byRoiAsc.slice(0, 5),
      mostFrequent: byFreq.slice(0, 5),
      bestByX: byX.slice(0, 5),
      bestByProfit: byProfit.slice(0, 5),
    };
  }, [slotAnalytics]);

  const providerAnalytics = useMemo(() => {
    const map = new Map();

    filteredSessions.forEach((session) => {
      const provider = (session.provider || "Без провайдера").trim();
      const prev = map.get(provider) || {
        provider,
        sessions: 0,
        spins: 0,
        bonuses: 0,
        totalResult: 0,
        turnover: 0,
        bestX: 0,
      };

      const bet = parseAmount(session.bet);
      const spins = parseInt(session.spins, 10) || 0;
      const bonuses = parseInt(session.bonuses, 10) || 0;
      const sessionDelta =
        session.hasDelta && typeof session.sessionDelta === "number"
          ? session.sessionDelta
          : null;

      prev.sessions += 1;
      prev.spins += spins;
      prev.bonuses += bonuses;
      if (sessionDelta !== null) {
        prev.totalResult += sessionDelta;
      }
      prev.bestX = Math.max(prev.bestX, session.bestX || 0);
      if (!isNaN(bet)) prev.turnover += bet * spins;

      map.set(provider, prev);
    });

    return [...map.values()]
      .map((item) => ({
        ...item,
        roi:
          item.turnover > 0 ? (item.totalResult / item.turnover) * 100 : null,
      }))
      .sort((a, b) => b.totalResult - a.totalResult);
  }, [filteredSessions]);

  const periodComparison = useMemo(() => {
    const days = getPeriodDays(analyticsPeriod);
    const currentStart = getPeriodStart(analyticsPeriod);
    if (!days || !currentStart) return null;

    const currentEnd = new Date();
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);

    const collect = (start, end) =>
      sessionsForAnalyticsScope.filter((session) => {
        const date = parseValidDate(session.date);
        if (!date) return false;
        return date >= start && date <= end;
      });

    const summarize = (sessions) => {
      const spins = sessions.reduce(
        (sum, session) => sum + (parseInt(session.spins, 10) || 0),
        0,
      );
      const bonuses = sessions.reduce(
        (sum, session) => sum + (parseInt(session.bonuses, 10) || 0),
        0,
      );
      const totalResult = sessions.reduce(
        (sum, session) =>
          sum +
          (session.hasDelta && typeof session.sessionDelta === "number"
            ? session.sessionDelta
            : 0),
        0,
      );
      return {
        sessions: sessions.length,
        spins,
        bonuses,
        totalResult,
      };
    };

    const current = summarize(collect(currentStart, currentEnd));
    const previous = summarize(collect(previousStart, previousEnd));

    return {
      days,
      current,
      previous,
      diff: {
        sessions: current.sessions - previous.sessions,
        spins: current.spins - previous.spins,
        bonuses: current.bonuses - previous.bonuses,
        totalResult: current.totalResult - previous.totalResult,
      },
    };
  }, [analyticsPeriod, sessionsForAnalyticsScope]);

  const analyticsInsights = useMemo(() => {
    if (filteredSessions.length === 0) {
      return [
        "Нет данных за выбранный период. Добавьте записи или ослабьте фильтры.",
      ];
    }

    const insights = [];
    if (slotTops.bestByProfit[0]) {
      const top = slotTops.bestByProfit[0];
      insights.push(
        `Лидер по прибыли: ${top.slot} (${formatNumber(top.totalResult)}).`,
      );
    }
    if (slotTops.worstSlots[0]) {
      const weak = slotTops.worstSlots[0];
      if (weak.roi !== null) {
        insights.push(
          `Слабое место по ROI: ${weak.slot} (${weak.roi.toFixed(2)}%).`,
        );
      }
    }
    if (providerAnalytics[0]) {
      const provider = providerAnalytics[0];
      insights.push(
        `Топ провайдер периода: ${provider.provider} (${provider.sessions} сесс.).`,
      );
    }
    if (periodComparison) {
      const trend = periodComparison.diff.totalResult >= 0 ? "лучше" : "хуже";
      insights.push(
        `К предыдущему периоду результат ${trend} на ${formatNumber(
          Math.abs(periodComparison.diff.totalResult),
        )}.`,
      );
    }
    return insights;
  }, [filteredSessions, slotTops, providerAnalytics, periodComparison]);

  const getSessionBadges = (session) => {
    const badges = [];
    const slotKey = (session.name || "").toLowerCase();

    if (
      (session.bestX || 0) > 0 &&
      session.bestX === analyticsHighlights.bestX
    ) {
      badges.push({
        id: "best-x",
        label: `best x x${session.bestX}`,
        tone: "warning",
      });
    }
    if (favoriteSlotSet.has(slotKey)) {
      badges.push({ id: "favorite", label: "favorite", tone: "accent" });
    }
    if (
      session.date &&
      new Date(session.date).getTime() >= analyticsHighlights.newestCutoff
    ) {
      badges.push({ id: "new", label: "new", tone: "neutral" });
    }
    if (
      analyticsHighlights.topRoi !== null &&
      session.roi !== null &&
      session.roi === analyticsHighlights.topRoi
    ) {
      badges.push({ id: "top-roi", label: "top ROI", tone: "positive" });
    }

    return badges;
  };

  const analyticsReportText = useMemo(() => {
    const filters = [
      PERIOD_FILTERS.find((period) => period.id === analyticsPeriod)?.label ||
        "Все время",
      analyticsProvider === "all"
        ? "Все провайдеры"
        : `Провайдер: ${analyticsProvider}`,
      analyticsCurrency === "all"
        ? "Все валюты"
        : `Валюта: ${analyticsCurrency}`,
      filterFavoritesOnly ? "Только избранные" : null,
      filterCustomOnly ? "Только мои слоты" : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const lines = [
      "CASINO TRACKER",
      "ОТЧЕТ ЗА ПЕРИОД",
      "------------------------------",
      filters,
      "",
      `Сессии: ${analyticsSummary.totalSessions}`,
      `Спины: ${formatNumber(analyticsSummary.totalSpins)}`,
      `Средняя ставка: ${
        analyticsCurrency === "all"
          ? formatNumber(analyticsSummary.avgBet)
          : formatMoneyWithCurrency(analyticsSummary.avgBet, analyticsCurrency)
      }`,
      `Последний баланс: ${
        analyticsCurrency === "all"
          ? formatNumber(analyticsSummary.lastBalance)
          : formatMoneyWithCurrency(
              analyticsSummary.lastBalance,
              analyticsCurrency,
            )
      }`,
    ];

    if (analyticsHighlights.topSlot) {
      lines.push(
        `Самый частый слот: ${analyticsHighlights.topSlot[0]} (${analyticsHighlights.topSlot[1]} сесс.)`,
      );
    }
    if (analyticsHighlights.bestX > 0) {
      lines.push(`Лучший x: x${analyticsHighlights.bestX}`);
    }
    if (analyticsHighlights.bestDay) {
      lines.push(
        `Лучший день P/L: ${analyticsHighlights.bestDay.day} (${formatNumber(
          analyticsHighlights.bestDay.value,
        )})`,
      );
    }

    lines.push("", "КЛЮЧЕВЫЕ ВЫВОДЫ");
    lines.push("------------------------------");
    analyticsInsights.forEach((insight, index) => {
      lines.push(`${index + 1}. ${insight}`);
    });

    return lines.join("\n");
  }, [
    analyticsPeriod,
    analyticsProvider,
    analyticsCurrency,
    filterFavoritesOnly,
    filterCustomOnly,
    analyticsSummary,
    analyticsHighlights,
    filteredSessions,
    analyticsInsights,
  ]);

  const handleExportCsv = () => {
    const rows = [
      [
        "date",
        "group",
        "slot",
        "provider",
        "bet",
        "spins",
        "bonuses",
        "balance",
        "currency",
        "best_x",
        "delta",
        "roi",
        "tags",
      ],
      ...filteredSessions.map((session) => [
        session.date || "",
        session.groupName || "",
        session.name || "",
        session.provider || "",
        session.bet || "",
        session.spins || "",
        session.bonuses || "",
        session.balance || "",
        session.sessionCurrency || currency,
        session.bestX || "",
        session.sessionDelta ?? "",
        session.roi !== null ? session.roi.toFixed(2) : "",
        (session.tags || []).join("|"),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadTextFile(
      "casino-analytics.csv",
      `\uFEFF${csv}`,
      "text/csv;charset=utf-8;",
    );
    setAnalyticsActionState("csv");
    window.setTimeout(() => setAnalyticsActionState(""), 2000);
  };

  const handleCopyReport = () => {
    copyPlainText(analyticsReportText, "report");
  };

  const handleDownloadReport = () => {
    downloadTextFile(
      "casino-report.txt",
      analyticsReportText,
      "text/plain;charset=utf-8;",
    );
    setAnalyticsActionState("report-file");
    window.setTimeout(() => setAnalyticsActionState(""), 2000);
  };

  if (authState.status === "checking") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          Проверка Telegram...
        </p>
      </div>
    );
  }

  if (authState.status === "error") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 gap-3 px-6 text-center">
        <p className="text-lg font-semibold">Доступ ограничен</p>
        <p className="text-slate-400 text-sm">{authState.error}</p>
      </div>
    );
  }

  // Показываем экран загрузки, пока данные летят из облака
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 gap-4">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">
          Загрузка ваших данных...
        </p>
      </div>
    );
  }

  const renderFinanceTab = () => (
    <FinanceTab
      stats={stats}
      formatMoney={formatMoney}
      openModal={openModal}
      transactions={transactions}
      formatDate={formatDate}
      handleDeleteTransaction={handleDeleteTransaction}
    />
  );

  const renderSlotsTab = () => (
    <SlotsTab
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
      setSlotProvider={setSlotProvider}
      providerOptions={providerOptions}
      slotBet={slotBet}
      setSlotBet={setSlotBet}
      slotSpins={slotSpins}
      setSlotSpins={setSlotSpins}
      slotBonuses={slotBonuses}
      handleBonusesChange={handleBonusesChange}
      slotBonusWins={slotBonusWins}
      handleBonusWinChange={handleBonusWinChange}
      SESSION_TAGS={SESSION_TAGS}
      slotTags={slotTags}
      setSlotTags={setSlotTags}
      slotBalance={slotBalance}
      setSlotBalance={setSlotBalance}
      recentSessions={recentSessions}
      MAX_RECENT_SESSIONS={MAX_RECENT_SESSIONS}
      formatDate={formatDate}
      getSessionBadges={getSessionBadges}
      getMetricBadgeClass={getMetricBadgeClass}
      applySessionToForm={applySessionToForm}
      handleStartEditSession={handleStartEditSession}
      handleDuplicateSession={handleDuplicateSession}
      pendingDelete={pendingDelete}
      handleDeleteGroup={handleDeleteGroup}
      clearPendingDelete={clearPendingDelete}
      handleRequestDeleteGroup={handleRequestDeleteGroup}
      copiedGroupId={copiedGroupId}
      copyToClipboard={copyToClipboard}
      setActiveGroupId={setActiveGroupId}
      handleDeleteSlotSession={handleDeleteSlotSession}
      handleRequestDeleteSession={handleRequestDeleteSession}
    />
  );

  const renderAnalyticsTab = () => (
    <AnalyticsTab
      PERIOD_FILTERS={PERIOD_FILTERS}
      analyticsActionState={analyticsActionState}
      handleExportCsv={handleExportCsv}
      handleCopyReport={handleCopyReport}
      handleDownloadReport={handleDownloadReport}
      analyticsPeriod={analyticsPeriod}
      setAnalyticsPeriod={setAnalyticsPeriod}
      analyticsProvider={analyticsProvider}
      setAnalyticsProvider={setAnalyticsProvider}
      providerOptions={providerOptions}
      currencyOptions={CURRENCY_OPTIONS}
      analyticsCurrency={analyticsCurrency}
      setAnalyticsCurrency={setAnalyticsCurrency}
      filterFavoritesOnly={filterFavoritesOnly}
      setFilterFavoritesOnly={setFilterFavoritesOnly}
      filterCustomOnly={filterCustomOnly}
      setFilterCustomOnly={setFilterCustomOnly}
      analyticsSummary={analyticsSummary}
      formatNumber={formatNumber}
      formatMoneyWithCurrency={formatMoneyWithCurrency}
      getMetricToneClass={getMetricToneClass}
      balanceSeries={balanceSeries}
      plSeries={plSeries}
      analyticsInsights={analyticsInsights}
      periodComparison={periodComparison}
      slotTops={slotTops}
      slotAnalytics={slotAnalytics}
      providerAnalytics={providerAnalytics}
      analyticsReportText={analyticsReportText}
    />
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">
      {/* Шапка */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Activity size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight">
                Casino Tracker
              </h1>
              {isDataLoaded && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-0.5">
                  {saveStatus === "saving" && (
                    <>
                      <Loader2
                        size={10}
                        className="animate-spin text-indigo-400"
                      />{" "}
                      Сохранение...
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <CheckCircle2 size={10} className="text-emerald-500" />{" "}
                      Сохранено в облако
                    </>
                  )}
                  {saveStatus === "error" && (
                    <>
                      <X size={10} className="text-rose-500" /> Ошибка базы
                      данных
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Селектор валюты */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-slate-800/80 text-slate-200 border border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {activeTab === "finance" && renderFinanceTab()}
        {activeTab === "slots" && renderSlotsTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe z-40">
        <div className="max-w-md mx-auto flex h-16">
          <button
            onClick={() => setActiveTab("finance")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "finance" ? "text-indigo-400" : "text-slate-500 hover:text-slate-400"}`}
          >
            <Wallet
              size={24}
              className={activeTab === "finance" ? "fill-indigo-900/20" : ""}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Финансы
            </span>
          </button>

          <button
            onClick={() => setActiveTab("slots")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "slots" ? "text-indigo-400" : "text-slate-500 hover:text-slate-400"}`}
          >
            <Gamepad2
              size={24}
              className={activeTab === "slots" ? "fill-indigo-900/20" : ""}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Слоты
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "analytics" ? "text-indigo-400" : "text-slate-500 hover:text-slate-400"}`}
          >
            <Sparkles
              size={24}
              className={activeTab === "analytics" ? "fill-indigo-900/20" : ""}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Аналитика
            </span>
          </button>
        </div>
      </nav>

      {/* Модальное окно депозита/вывода */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div
              className={`p-4 text-center font-bold text-lg ${transactionType === "deposit" ? "bg-rose-900/30 text-rose-400 border-b border-rose-900/50" : "bg-emerald-900/30 text-emerald-400 border-b border-emerald-900/50"}`}
            >
              {transactionType === "deposit" ? "Новый депозит" : "Новый вывод"}
            </div>
            <form onSubmit={handleAddTransaction} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Сумма ({currency})
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  value={amount}
                  onChange={(e) =>
                    setAmount(formatInputWithCommas(e.target.value))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  placeholder="Например, 5,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Заметка (Опционально)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  placeholder="Название проекта или слота"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors ${transactionType === "deposit" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно поиска слота */}
      {isSlotSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl h-[80vh] sm:h-[600px] flex flex-col animate-in slide-in-from-bottom-full sm:fade-in sm:slide-in-from-bottom-0 duration-200">
            {/* Поиск */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search size={20} className="text-slate-400" />
              <input
                type="text"
                autoFocus
                value={slotSearchQuery}
                onChange={(e) => setSlotSearchQuery(e.target.value)}
                placeholder="Начните вводить название слота"
                className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-lg"
              />
              <button
                onClick={closeSlotSearch}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Список слотов */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide space-y-4">
              {normalizedSlotSearchQuery && !hasExactSlotMatch && (
                <button
                  type="button"
                  onClick={handleAddCustomSlot}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/30 text-indigo-300 transition-colors flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Добавить в мои слоты "{normalizedSlotSearchQuery}"
                </button>
              )}
              {slotSections.some(
                (section) =>
                  section.items.length > 0 ||
                  (!normalizedSlotSearchQuery &&
                    section.id !== "popular" &&
                    section.items.length === 0),
              ) ? (
                slotSections.map(renderSlotSection)
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-slate-300 font-semibold">
                    Ничего не найдено
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Уточните запрос или добавьте слот в свои.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
