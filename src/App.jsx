import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Gamepad2,
  Loader2,
  Settings2,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

import FinanceSection from "./features/finance/components/FinanceSection";
import SlotsSection from "./features/slots/components/SlotsSection";
import AnalyticsSection from "./features/analytics/components/AnalyticsSection";
import SettingsSection from "./features/settings/components/SettingsSection";
import FaqButton from "./components/common/FaqButton";
import { CURRENCY_OPTIONS } from "./features/analytics/constants";
import { POPULAR_SLOTS, POPULAR_SLOT_PROVIDER_MAP } from "./data/slots";
import useFinance from "./features/finance/hooks/useFinance";
import useSlots from "./features/slots/hooks/useSlots";
import useAnalytics from "./features/analytics/hooks/useAnalytics";

export default function App() {
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
  const isProd = process.env.NODE_ENV === "production";
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    "",
  );
  const initData = tg?.initData || "";

  const [authState, setAuthState] = useState({
    status: "checking",
    userId: null,
    error: "",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [currency, setCurrency] = useState("₽");
  const [activeTab, setActiveTab] = useState("finance");
  const [theme, setTheme] = useState("dark");
  const [importStatus, setImportStatus] = useState("idle");
  const skipInitialSave = useRef(true);

  const slots = useSlots({
    currency,
    popularSlots: POPULAR_SLOTS,
    popularSlotProviderMap: POPULAR_SLOT_PROVIDER_MAP,
    maxRecentSlots: 5,
  });
  const finance = useFinance({ currency, slotGroups: slots.slotGroups });
  const { transactions, setTransactions } = finance;
  const totalFinanceOperations = finance.allTransactions.length;
  const {
    customSlots,
    favoriteSlots,
    favoriteSlotSet,
    customSlotSet,
    providerOptions,
    recentSessions,
    slotGroups,
    slotProviders,
    hydrate,
    keepQuickContext,
    setKeepQuickContext,
    resetAllSlotsData,
  } = slots;
  const analytics = useAnalytics({
    currency,
    recentSessions,
    favoriteSlotSet,
    customSlotSet,
  });
  const totalSlotRecords = slotGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const financeOverview = {
    deposits: finance.stats.totalDeposits,
    withdrawals: finance.stats.totalWithdrawals,
    slotResult: finance.stats.totalSlotResult,
    netResult: finance.stats.netProfit,
    currency,
  };
  const latestSession = recentSessions[0] || null;
  const appHighlights = [
    {
      id: "bank",
      label: "Банк",
      value: `${finance.stats.netProfit > 0 ? "+" : ""}${finance.formatMoney(finance.stats.netProfit)}`,
      tone: finance.stats.netProfit >= 0 ? "text-emerald-400" : "text-rose-400",
      hint: "Общий итог",
    },
    {
      id: "slots",
      label: "Слоты",
      value: `${finance.stats.totalSlotResult > 0 ? "+" : ""}${finance.formatMoney(finance.stats.totalSlotResult)}`,
      tone:
        finance.stats.totalSlotResult >= 0
          ? "text-emerald-400"
          : "text-rose-400",
      hint: `${totalSlotRecords} записей`,
    },
    {
      id: "latest",
      label: "Последняя запись",
      value: latestSession ? latestSession.name : "Пока пусто",
      tone: "text-slate-100",
      hint: latestSession
        ? `${latestSession.provider || "Без провайдера"} · ${slots.formatDate(latestSession.date)}`
        : "Добавьте первую запись",
    },
  ];
  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      currency,
      appSettings: {
        keepQuickContext,
        theme,
      },
      transactions,
      slotGroups,
      customSlots,
      favoriteSlots,
      slotProviders,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `casino-manager-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const payload = JSON.parse(raw);

      setTransactions(
        Array.isArray(payload.transactions) ? payload.transactions : [],
      );
      hydrate({
        groups: Array.isArray(payload.slotGroups) ? payload.slotGroups : [],
        custom: Array.isArray(payload.customSlots) ? payload.customSlots : [],
        favorites: Array.isArray(payload.favoriteSlots)
          ? payload.favoriteSlots
          : [],
        providers:
          payload.slotProviders &&
          typeof payload.slotProviders === "object" &&
          !Array.isArray(payload.slotProviders)
            ? payload.slotProviders
            : {},
      });

      if (
        payload.currency &&
        CURRENCY_OPTIONS.some((item) => item.value === payload.currency)
      ) {
        setCurrency(payload.currency);
      }

      if (typeof payload.appSettings?.keepQuickContext === "boolean") {
        setKeepQuickContext(payload.appSettings.keepQuickContext);
      }

      if (
        payload.appSettings?.theme === "dark" ||
        payload.appSettings?.theme === "light"
      ) {
        setTheme(payload.appSettings.theme);
      }

      setImportStatus("success");
    } catch (error) {
      console.error("Ошибка импорта данных:", error);
      setImportStatus("error");
    } finally {
      event.target.value = "";
      window.setTimeout(() => setImportStatus("idle"), 3000);
    }
  };

  const handleResetAllData = () => {
    setTransactions([]);
    resetAllSlotsData();
    setCurrency("₽");
    setTheme("dark");
    setActiveTab("finance");
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
        if (!data?.ok || !data?.user?.id) throw new Error("verify_invalid");

        if (!isMounted) return;
        setAuthState({
          status: "ok",
          userId: data.user.id.toString(),
          error: "",
        });
      } catch {
        setError(
          "Не удалось проверить авторизацию Telegram. Попробуйте позже.",
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [apiBase, initData, isProd, tg]);

  useEffect(() => {
    if (!authState.userId) return;

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

        if (payload.transactions) {
          setTransactions(payload.transactions);
        }

        hydrate({
          groups: payload.slotGroups,
          custom: payload.customSlots,
          favorites: payload.favoriteSlots,
          providers: payload.slotProviders,
        });

        if (payload.currency) {
          setCurrency(payload.currency);
        }
        if (typeof payload.appSettings?.keepQuickContext === "boolean") {
          setKeepQuickContext(payload.appSettings.keepQuickContext);
        }
        if (
          payload.appSettings?.theme === "dark" ||
          payload.appSettings?.theme === "light"
        ) {
          setTheme(payload.appSettings.theme);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        if (isMounted) {
          setIsDataLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    apiBase,
    authState.userId,
    hydrate,
    initData,
    setKeepQuickContext,
    setTransactions,
  ]);

  useEffect(() => {
    if (!isDataLoaded || !authState.userId) return;

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
              slotProviders,
              currency,
              appSettings: {
                keepQuickContext,
                theme,
              },
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
    apiBase,
    authState.userId,
    currency,
    transactions,
    initData,
    isDataLoaded,
    customSlots,
    favoriteSlots,
    keepQuickContext,
    slotGroups,
    slotProviders,
    theme,
  ]);

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

  return (
    <div className="app-shell min-h-screen text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">
      <header className="app-header sticky top-0 z-10 border-b border-slate-800 bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 p-2 shadow-lg shadow-indigo-950/20">
              <Activity size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight">
                Casino Manager
              </h1>
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
                    <X size={10} className="text-rose-500" /> Ошибка базы данных
                  </>
                )}
              </div>
            </div>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-300">
            {activeTab === "finance" && `${totalFinanceOperations} операций`}
            {activeTab === "slots" && `${totalSlotRecords} записей`}
            {activeTab === "analytics" && `${recentSessions.length} сессий`}
            {activeTab === "settings" &&
              (saveStatus === "saved"
                ? "Сохранено"
                : saveStatus === "saving"
                  ? "Сохранение"
                  : "Ошибка")}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {activeTab !== "settings" && (
          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {appHighlights.map((item) => (
              <div key={item.id} className="surface-card-muted p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p className={`mt-2 text-base font-semibold ${item.tone}`}>
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{item.hint}</p>
              </div>
            ))}
          </section>
        )}
        {activeTab === "finance" && (
          <FinanceSection finance={finance} currency={currency} />
        )}
        {activeTab === "slots" && (
          <SlotsSection
            slots={slots}
            analytics={analytics}
            currency={currency}
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsSection
            analytics={analytics}
            providerOptions={providerOptions}
            financeOverview={financeOverview}
          />
        )}
        {activeTab === "settings" && (
          <SettingsSection
            currency={currency}
            setCurrency={setCurrency}
            currencyOptions={CURRENCY_OPTIONS}
            theme={theme}
            setTheme={setTheme}
            keepQuickContext={keepQuickContext}
            setKeepQuickContext={setKeepQuickContext}
            handleExportData={handleExportData}
            handleImportData={handleImportData}
            handleResetAllData={handleResetAllData}
            importStatus={importStatus}
          />
        )}
      </main>

      <FaqButton />

      <nav className="app-nav fixed bottom-0 z-40 w-full border-t border-slate-800 bg-slate-900/90 pb-safe backdrop-blur-md">
        <div className="max-w-md mx-auto px-3 py-2">
          <div className="grid h-16 grid-cols-4 gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-1 shadow-2xl shadow-slate-950/30">
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                activeTab === "finance"
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-950/20"
                  : "border-transparent text-slate-500 hover:bg-slate-900/80 hover:text-slate-300"
              }`}
            >
              <Wallet
                size={24}
                className={
                  activeTab === "finance"
                    ? "fill-indigo-500/10 text-indigo-300"
                    : ""
                }
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  activeTab === "finance" ? "text-indigo-200" : ""
                }`}
              >
                Финансы
              </span>
            </button>

            <button
              onClick={() => setActiveTab("slots")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                activeTab === "slots"
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-950/20"
                  : "border-transparent text-slate-500 hover:bg-slate-900/80 hover:text-slate-300"
              }`}
            >
              <Gamepad2
                size={24}
                className={
                  activeTab === "slots"
                    ? "fill-indigo-500/10 text-indigo-300"
                    : ""
                }
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  activeTab === "slots" ? "text-indigo-200" : ""
                }`}
              >
                Слоты
              </span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                activeTab === "analytics"
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-950/20"
                  : "border-transparent text-slate-500 hover:bg-slate-900/80 hover:text-slate-300"
              }`}
            >
              <Sparkles
                size={24}
                className={
                  activeTab === "analytics"
                    ? "fill-indigo-500/10 text-indigo-300"
                    : ""
                }
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  activeTab === "analytics" ? "text-indigo-200" : ""
                }`}
              >
                Аналитика
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                activeTab === "settings"
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-950/20"
                  : "border-transparent text-slate-500 hover:bg-slate-900/80 hover:text-slate-300"
              }`}
            >
              <Settings2
                size={24}
                className={
                  activeTab === "settings"
                    ? "fill-indigo-500/10 text-indigo-300"
                    : ""
                }
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  activeTab === "settings" ? "text-indigo-200" : ""
                }`}
              >
                Настройки
              </span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
