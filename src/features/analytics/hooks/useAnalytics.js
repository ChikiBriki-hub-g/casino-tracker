import { useEffect, useMemo, useState } from "react";
import {
  formatDisplayMoney,
  formatDisplayNumber,
  normalizeSlotName,
  parseAmount,
  parseValidDate,
} from "../../../utils/casino";

const useAnalytics = ({
  currency,
  recentSessions,
  favoriteSlotSet,
  customSlotSet,
}) => {
  const [analyticsActionState, setAnalyticsActionState] = useState("");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");
  const [analyticsProvider, setAnalyticsProvider] = useState("all");
  const [analyticsCurrency, setAnalyticsCurrency] = useState("all");
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [filterCustomOnly, setFilterCustomOnly] = useState(false);
  const [analyticsNow, setAnalyticsNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAnalyticsNow(Date.now());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const formatNumber = (value) => formatDisplayNumber(value);
  const formatMoneyWithCurrency = (value, nextCurrency) =>
    formatDisplayMoney(value, nextCurrency);

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

    return recentSessions.filter((session) => {
      const sessionCurrency = session.sessionCurrency || currency;
      if (
        analyticsCurrency !== "all" &&
        sessionCurrency !== analyticsCurrency
      ) {
        return false;
      }
      if (
        providerFilter !== "all" &&
        providerFilter &&
        (session.provider || "").trim().toLowerCase() !== providerFilter
      ) {
        return false;
      }
      if (filterFavoritesOnly || filterCustomOnly) {
        const slotKey = (session.name || "").toLowerCase();
        const isFavorite = favoriteSlotSet.has(slotKey);
        const isCustom = customSlotSet.has(slotKey);
        return (
          (filterFavoritesOnly && isFavorite) || (filterCustomOnly && isCustom)
        );
      }
      return true;
    });
  }, [
    analyticsCurrency,
    analyticsProvider,
    currency,
    customSlotSet,
    favoriteSlotSet,
    filterCustomOnly,
    filterFavoritesOnly,
    recentSessions,
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
      .map((session) => parseAmount(session.bet))
      .filter((value) => !Number.isNaN(value));
    const balances = filteredSessions
      .map((session) => parseAmount(session.balance))
      .filter((value) => !Number.isNaN(value));
    const spins = filteredSessions
      .map((session) => parseInt(session.spins, 10))
      .filter((value) => !Number.isNaN(value));
    const totalResult = filteredSessions.reduce(
      (sum, session) =>
        sum +
        (session.hasDelta && typeof session.sessionDelta === "number"
          ? session.sessionDelta
          : 0),
      0,
    );

    return {
      totalSessions: filteredSessions.length,
      totalSpins: spins.reduce((sum, value) => sum + value, 0),
      avgBet:
        bets.length > 0
          ? bets.reduce((sum, value) => sum + value, 0) / bets.length
          : 0,
      lastBalance: balances.length > 0 ? balances[0] : 0,
      totalResult,
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
      .filter((point) => !Number.isNaN(point.value));
  }, [filteredSessions]);

  const plSeries = useMemo(() => {
    if (balanceSeries.length < 2) return [];

    const dayMap = new Map();
    for (let index = 1; index < balanceSeries.length; index += 1) {
      const prev = balanceSeries[index - 1];
      const current = balanceSeries[index];
      if (!prev?.date || !current?.date) continue;

      const delta = current.value - prev.value;
      const dayKey = new Date(current.date).toISOString().slice(0, 10);
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
    const newestCutoff = analyticsNow - 1000 * 60 * 60 * 24 * 3;

    const slotCounts = new Map();
    filteredSessions.forEach((session) => {
      const key = session.name || "Без названия";
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
    });

    return {
      bestX,
      topRoi: Number.isFinite(topRoi) ? topRoi : null,
      newestCutoff,
      topSlot: [...slotCounts.entries()].sort((a, b) => b[1] - a[1])[0],
      bestDay: [...plSeries].sort((a, b) => b.value - a.value)[0],
    };
  }, [analyticsNow, filteredSessions, plSeries]);

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
        .filter((value) => !Number.isNaN(value));

      prev.sessions += 1;
      if (sessionDelta !== null) prev.totalResult += sessionDelta;
      prev.spins += spins;
      prev.bonuses += bonuses;
      prev.bestX = Math.max(prev.bestX, session.bestX || 0);

      if (!Number.isNaN(bet)) {
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
      if (sessionDelta !== null) prev.totalResult += sessionDelta;
      prev.bestX = Math.max(prev.bestX, session.bestX || 0);
      if (!Number.isNaN(bet)) prev.turnover += bet * spins;

      map.set(provider, prev);
    });

    return [...map.values()]
      .map((item) => ({
        ...item,
        roi:
          item.turnover > 0 ? (item.totalResult / item.turnover) * 100 : null,
      }))
      .sort((a, b) => {
        if (b.sessions !== a.sessions) return b.sessions - a.sessions;
        return b.totalResult - a.totalResult;
      });
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
        return Boolean(date && date >= start && date <= end);
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
    if (slotTops.worstSlots[0]?.roi !== null) {
      const weak = slotTops.worstSlots[0];
      insights.push(
        `Слабое место по ROI: ${weak.slot} (${weak.roi.toFixed(2)}%).`,
      );
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
  }, [filteredSessions, periodComparison, providerAnalytics, slotTops]);

  const getSessionBadges = (session) => {
    const badges = [];
    const slotKey = (session.name || "").toLowerCase();
    const sessionMode = session.mode === "bonus_buy" ? "bonus_buy" : "spins";

    badges.push({
      id: "mode",
      label: sessionMode === "bonus_buy" ? "bonus buy" : "spins",
      tone: "neutral",
    });

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
    const periodLabelMap = {
      today: "Сегодня",
      "7d": "Последние 7 дней",
      "30d": "Последние 30 дней",
      all: "Всё время",
    };

    const filters = [
      `Период: ${periodLabelMap[analyticsPeriod] || analyticsPeriod}`,
      `Провайдер: ${analyticsProvider === "all" ? "Все" : analyticsProvider}`,
      `Валюта: ${analyticsCurrency === "all" ? "Все" : analyticsCurrency}`,
    ];
    if (filterFavoritesOnly) filters.push("Только избранные");
    if (filterCustomOnly) filters.push("Только мои слоты");

    const lines = [
      "CASINO REPORT",
      "==============================",
      ...filters,
      "",
      "КЛЮЧЕВЫЕ МЕТРИКИ",
      "------------------------------",
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

    lines.push("", "КЛЮЧЕВЫЕ ВЫВОДЫ", "------------------------------");
    analyticsInsights.forEach((insight, index) => {
      lines.push(`${index + 1}. ${insight}`);
    });

    return lines.join("\n");
  }, [
    analyticsCurrency,
    analyticsHighlights,
    analyticsInsights,
    analyticsPeriod,
    analyticsProvider,
    analyticsSummary,
    filterCustomOnly,
    filterFavoritesOnly,
  ]);

  const handleExportCsv = () => {
    const rows = [
      [
        "date",
        "group",
        "slot",
        "mode",
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
        session.mode === "bonus_buy" ? "bonus_buy" : "spins",
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

  return {
    analyticsActionState,
    analyticsPeriod,
    analyticsProvider,
    analyticsCurrency,
    filterFavoritesOnly,
    filterCustomOnly,
    filteredSessions,
    analyticsSummary,
    balanceSeries,
    plSeries,
    analyticsHighlights,
    slotAnalytics,
    slotTops,
    providerAnalytics,
    periodComparison,
    analyticsInsights,
    analyticsReportText,
    setAnalyticsPeriod,
    setAnalyticsProvider,
    setAnalyticsCurrency,
    setFilterFavoritesOnly,
    setFilterCustomOnly,
    handleExportCsv,
    handleCopyReport,
    handleDownloadReport,
    formatNumber,
    formatMoneyWithCurrency,
    getMetricToneClass,
    getMetricBadgeClass,
    getSessionBadges,
  };
};

export default useAnalytics;
