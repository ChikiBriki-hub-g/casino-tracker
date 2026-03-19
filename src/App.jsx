import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    PlusCircle,
    MinusCircle,
    TrendingUp,
    TrendingDown,
    History,
    Trash2,
    Wallet,
    Activity,
    Sparkles,
    Loader2,
    Gamepad2,
    Copy,
    CheckCircle2,
    Dices,
    Search,
    X,
    ChevronDown,
    Layers,
} from "lucide-react";

import { POPULAR_SLOTS } from "./constants/slots";

// Ключи из вашего скриншота

// База популярных слотов

// Форматирование ввода: добавляет запятые (10000 -> 10,000) при вводе
const formatInputWithCommas = (str) => {
    if (!str) return "";
    // Убираем уже существующие запятые и пробелы
    let clean = str.replace(/[\s,]/g, "");
    // Ищем числовую часть
    const match = clean.match(/^(\d+)(.*)$/);
    if (match) {
        const numPart = parseInt(match[1], 10);
        const restPart = match[2];
        // toLocaleString('en-US') использует запятую как разделитель тысяч
        const formattedNum = numPart.toLocaleString("en-US");
        return formattedNum + restPart;
    }
    return str;
};

// Вспомогательные функции для парсинга чисел и расчета иксов
const parseAmount = (str) => {
    if (!str) return NaN;
    // Убираем запятые (разделители) и пробелы
    let cleanStr = str
        .toString()
        .toLowerCase()
        .replace(/[\s,]/g, "")
        .replace(",", ".");
    let multiplier = 1;
    if (cleanStr.includes("k") || cleanStr.includes("к")) {
        multiplier = 1000;
        cleanStr = cleanStr.replace(/[kк]/g, "");
    } else if (cleanStr.includes("m") || cleanStr.includes("м")) {
        multiplier = 1000000;
        cleanStr = cleanStr.replace(/[mм]/g, "");
    }
    const val = parseFloat(cleanStr);
    return isNaN(val) ? NaN : val * multiplier;
};

const calculateX = (winStr, betStr) => {
    const win = parseAmount(winStr);
    const bet = parseAmount(betStr);
    if (isNaN(win) || isNaN(bet) || bet <= 0) return null;
    const x = win / bet;
    return Number.isInteger(x)
        ? x.toString()
        : x.toFixed(2).replace(/\.00$/, "");
};

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
            } catch (e) {
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
    const [activeTab, setActiveTab] = useState("finance"); // 'finance' | 'slots'

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
    const [slotSpins, setSlotSpins] = useState("100");
    const [slotBonuses, setSlotBonuses] = useState("0");
    const [slotBonusWins, setSlotBonusWins] = useState([]);
    const [slotBalance, setSlotBalance] = useState("");
    const [copiedGroupId, setCopiedGroupId] = useState(null);

    // --- СОСТОЯНИЕ ПОИСКА СЛОТОВ ---
    const [isSlotSearchOpen, setIsSlotSearchOpen] = useState(false);
    const [slotSearchQuery, setSlotSearchQuery] = useState("");

    // Фильтрация слотов по поиску
    const filteredSlots = useMemo(() => {
        if (!slotSearchQuery) return POPULAR_SLOTS;
        return POPULAR_SLOTS.filter((s) =>
            s.toLowerCase().includes(slotSearchQuery.toLowerCase()),
        );
    }, [slotSearchQuery]);

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
                if (payload.currency) setCurrency(payload.currency);
            } catch (e) {
                console.error("Ошибка загрузки данных:", e);
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
                        data: { transactions, slotGroups, currency },
                    }),
                });
                if (!response.ok) throw new Error("save_failed");
                const data = await response.json();
                if (!data?.ok) throw new Error("save_invalid");
                setSaveStatus("saved");
            } catch (e) {
                console.error("Ошибка сохранения данных:", e);
                setSaveStatus("error");
            }
        };

        saveData();
    }, [
        transactions,
        slotGroups,
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
            totalDeposits > 0
                ? ((netProfit / totalDeposits) * 100).toFixed(1)
                : 0;
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
                note.trim() ||
                (transactionType === "deposit" ? "Депозит" : "Вывод"),
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

    const handleAddSlotSession = (e) => {
        e.preventDefault();
        if (!slotName || !slotBet || !slotSpins || !slotBalance) return;

        const newSession = {
            id: crypto.randomUUID(),
            name: slotName.trim(),
            bet: slotBet.trim(),
            spins: slotSpins.trim(),
            bonuses: slotBonuses.trim() || "0",
            bonusWins: slotBonusWins
                .map((w) => w.trim())
                .filter((w) => w !== ""),
            balance: slotBalance.trim(),
            date: new Date().toISOString(),
            sessionCurrency: currency,
        };

        // Добавляем лог в АКТИВНУЮ сессию
        setSlotGroups((prev) =>
            prev.map((group) =>
                group.id === activeGroupId
                    ? { ...group, items: [newSession, ...group.items] }
                    : group,
            ),
        );

        // Сброс полей
        setSlotName("");
        setSlotBonuses("0");
        setSlotBonusWins([]);
        setSlotSpins("100");
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

        if (
            bonusesCount > 0 &&
            session.bonusWins &&
            session.bonusWins.length > 0
        ) {
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
        return text;
    };

    const copyToClipboard = (groupId) => {
        const group = slotGroups.find((g) => g.id === groupId);
        if (!group || group.items.length === 0) return;

        const textToCopy = [...group.items]
            .reverse()
            .map(formatSlotText)
            .join("\n");

        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            setCopiedGroupId(groupId);
            setTimeout(() => setCopiedGroupId(null), 2000);
        } catch (err) {
            console.error("Ошибка копирования", err);
        }
        document.body.removeChild(textArea);
    };

    // --- УТИЛИТЫ ---
    const formatMoney = (val) => {
        const formatted = Math.round(val).toLocaleString("en-US"); // формат с запятыми 1,000
        return `${formatted} ${currency}`;
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

    // --- РЕНДЕР ВКЛАДКИ: ФИНАНСЫ ---
    const renderFinanceTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Главная карточка: Профит */}
            <div
                className={`relative overflow-hidden rounded-2xl p-6 ${stats.isProfitable ? "bg-emerald-900/20 border border-emerald-500/30" : "bg-rose-900/20 border border-rose-500/30"}`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    {stats.isProfitable ? (
                        <TrendingUp size={100} />
                    ) : (
                        <TrendingDown size={100} />
                    )}
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">
                    Чистая прибыль (Профит)
                </p>
                <h2
                    className={`text-4xl font-bold tracking-tight ${stats.isProfitable ? "text-emerald-400" : "text-rose-400"}`}
                >
                    {stats.netProfit > 0 ? "+" : ""}
                    {formatMoney(stats.netProfit)}
                </h2>
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400">ROI:</span>
                        <span
                            className={`font-semibold ${stats.isProfitable ? "text-emerald-400" : "text-rose-400"}`}
                        >
                            {stats.roi}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Сетка статистики */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                        <MinusCircle size={18} />
                        <span className="text-sm font-medium">Депозиты</span>
                    </div>
                    <p className="text-xl font-semibold text-slate-200">
                        {formatMoney(stats.totalDeposits)}
                    </p>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                        <PlusCircle size={18} />
                        <span className="text-sm font-medium">Выводы</span>
                    </div>
                    <p className="text-xl font-semibold text-slate-200">
                        {formatMoney(stats.totalWithdrawals)}
                    </p>
                </div>
            </div>

            {/* Быстрые действия */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                    onClick={() => openModal("deposit")}
                    className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-indigo-900/20"
                >
                    <MinusCircle size={28} />
                    <span className="font-semibold tracking-wide">ДЕПНУЛ</span>
                </button>
                <button
                    onClick={() => openModal("withdraw")}
                    className="flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl p-4 transition-colors shadow-lg shadow-emerald-900/20"
                >
                    <PlusCircle size={28} />
                    <span className="font-semibold tracking-wide">ВЫВЕЛ</span>
                </button>
            </div>

            {/* История транзакций */}
            <div className="pt-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <History size={20} className="text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-200">
                        История транзакций
                    </h3>
                </div>
                {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800/50 border-dashed">
                        <Wallet
                            size={32}
                            className="mx-auto text-slate-600 mb-3"
                        />
                        <p className="text-slate-400 text-sm">История пуста.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                className="group bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-full ${t.type === "deposit" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                                    >
                                        {t.type === "deposit" ? (
                                            <TrendingDown size={18} />
                                        ) : (
                                            <TrendingUp size={18} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200">
                                            {t.note}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatDate(t.date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`font-bold ${t.type === "deposit" ? "text-rose-400" : "text-emerald-400"}`}
                                    >
                                        {t.type === "deposit" ? "-" : "+"}
                                        {formatMoney(t.amount)}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleDeleteTransaction(t.id)
                                        }
                                        className="text-slate-600 hover:text-rose-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // --- РЕНДЕР ВКЛАДКИ: СЛОТЫ ---
    const renderSlotsTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Управление сессиями (группами) */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Layers size={20} className="text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-200">
                        Добавить лог
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

            {/* Форма добавления лога (Добавляет в АКТИВНУЮ сессию) */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg relative">
                {/* Индикатор активной сессии для формы */}
                <div className="absolute top-0 right-5 -translate-y-1/2 bg-slate-800 border border-slate-700 text-xs font-semibold px-3 py-1 rounded-full text-slate-300 flex gap-2 shadow-md">
                    В сессию:{" "}
                    <span className="text-indigo-400">
                        {slotGroups.find((g) => g.id === activeGroupId)?.name ||
                            ""}
                    </span>
                </div>

                <form
                    onSubmit={handleAddSlotSession}
                    className="space-y-4 mt-2"
                >
                    <div>
                        <div
                            onClick={() => setIsSlotSearchOpen(true)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors"
                        >
                            <span
                                className={
                                    slotName
                                        ? "text-slate-100"
                                        : "text-slate-500"
                                }
                            >
                                {slotName ||
                                    "Название слота (напр. Sweet Bonanza)"}
                            </span>
                            <Search size={18} className="text-slate-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            value={slotBet}
                            onChange={(e) =>
                                setSlotBet(
                                    formatInputWithCommas(e.target.value),
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            placeholder="Ставка (напр. 300)"
                        />
                        <input
                            type="number"
                            required
                            value={slotSpins}
                            onChange={(e) => setSlotSpins(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            placeholder="Спинов"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-start">
                        <input
                            type="number"
                            required
                            value={slotBonuses}
                            onChange={handleBonusesChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            placeholder="Бонусок (шт)"
                        />

                        {/* Динамические поля выигрышей */}
                        {slotBonusWins.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {slotBonusWins.map((win, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={win}
                                        onChange={(e) =>
                                            handleBonusWinChange(
                                                index,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-slate-950 border border-indigo-900/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 bg-indigo-950/20"
                                        placeholder={
                                            slotBonusWins.length > 1
                                                ? `Выигрыш ${index + 1} (напр. 10к)`
                                                : `Выигрыш (напр. 66к)`
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            required
                            value={slotBalance}
                            onChange={(e) =>
                                setSlotBalance(
                                    formatInputWithCommas(e.target.value),
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            placeholder="Итоговый баланс (напр. 7,980к)"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-900/20"
                    >
                        Добавить в лог
                    </button>
                </form>
            </div>

            {/* Список сессий и логов */}
            <div className="pt-4 space-y-6">
                {slotGroups.map((group) => (
                    <div
                        key={group.id}
                        className={`bg-[#0f172a] rounded-2xl border ${activeGroupId === group.id ? "border-indigo-500/50" : "border-slate-800"} overflow-hidden shadow-lg`}
                    >
                        {/* Шапка группы */}
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
                                        onClick={() =>
                                            setActiveGroupId(group.id)
                                        }
                                        className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
                                    >
                                        Сделать активной
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {group.items.length > 0 && (
                                    <button
                                        onClick={() =>
                                            copyToClipboard(group.id)
                                        }
                                        className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
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
                                    <button
                                        onClick={() =>
                                            handleDeleteGroup(group.id)
                                        }
                                        className="text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                                        title="Удалить сессию целиком"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Логи внутри группы */}
                        <div className="p-3">
                            {group.items.length === 0 ? (
                                <div className="text-center py-6">
                                    <Dices
                                        size={24}
                                        className="mx-auto text-slate-700 mb-2"
                                    />
                                    <p className="text-slate-500 text-xs font-medium">
                                        В этой сессии пока нет игр
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {group.items.map((session, index) => {
                                        const cur =
                                            session.sessionCurrency || currency;

                                        // Логика цвета баланса (сравниваем с ПРЕДЫДУЩИМ логом, который идет по индексу +1, т.к. массив реверснут)
                                        const prevSession =
                                            group.items[index + 1];
                                        const currBal = parseAmount(
                                            session.balance,
                                        );
                                        const prevBal = prevSession
                                            ? parseAmount(prevSession.balance)
                                            : null;

                                        let balColorClass = "text-slate-200"; // Нейтральный цвет для первого лога
                                        let TrendIcon = null;

                                        if (
                                            prevBal !== null &&
                                            !isNaN(currBal) &&
                                            !isNaN(prevBal)
                                        ) {
                                            if (currBal > prevBal) {
                                                balColorClass =
                                                    "text-emerald-400";
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
                                                <button
                                                    onClick={() =>
                                                        handleDeleteSlotSession(
                                                            group.id,
                                                            session.id,
                                                        )
                                                    }
                                                    className="absolute right-2 top-2 opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1 bg-slate-900/50 rounded-md"
                                                    title="Удалить запись"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <h4 className="font-bold text-slate-200 flex items-center gap-2 mb-2 text-sm">
                                                    <Gamepad2
                                                        size={14}
                                                        className="text-indigo-400"
                                                    />
                                                    {session.name}
                                                </h4>

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
                                                    session.bonusWins.length >
                                                        0 && (
                                                        <div className="mb-3 space-y-1.5">
                                                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">
                                                                Выигрыши:
                                                            </span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {session.bonusWins.map(
                                                                    (
                                                                        win,
                                                                        i,
                                                                    ) => {
                                                                        const x =
                                                                            calculateX(
                                                                                win,
                                                                                session.bet,
                                                                            );
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="flex items-center bg-indigo-950/30 border border-indigo-500/30 rounded-md overflow-hidden"
                                                                            >
                                                                                <span className="px-2 py-0.5 text-xs font-medium text-indigo-100">
                                                                                    {
                                                                                        win
                                                                                    }
                                                                                    {
                                                                                        cur
                                                                                    }
                                                                                </span>
                                                                                {x && (
                                                                                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border-l border-indigo-500/30">
                                                                                        x
                                                                                        {
                                                                                            x
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
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
                                                        {TrendIcon && (
                                                            <TrendIcon
                                                                size={14}
                                                            />
                                                        )}
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
        </div>
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
                                            <CheckCircle2
                                                size={10}
                                                className="text-emerald-500"
                                            />{" "}
                                            Сохранено в облако
                                        </>
                                    )}
                                    {saveStatus === "error" && (
                                        <>
                                            <X
                                                size={10}
                                                className="text-rose-500"
                                            />{" "}
                                            Ошибка базы данных
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
                                <option value="₽">RUB (₽)</option>
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="₴">UAH (₴)</option>
                                <option value="₸">KZT (₸)</option>
                                <option value="Br">BYN (Br)</option>
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
                {activeTab === "finance"
                    ? renderFinanceTab()
                    : renderSlotsTab()}
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
                            className={
                                activeTab === "finance"
                                    ? "fill-indigo-900/20"
                                    : ""
                            }
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
                            className={
                                activeTab === "slots"
                                    ? "fill-indigo-900/20"
                                    : ""
                            }
                        />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Слоты
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
                            {transactionType === "deposit"
                                ? "Новый депозит"
                                : "Новый вывод"}
                        </div>
                        <form
                            onSubmit={handleAddTransaction}
                            className="p-5 space-y-4"
                        >
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
                                        setAmount(
                                            formatInputWithCommas(
                                                e.target.value,
                                            ),
                                        )
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
                                onChange={(e) =>
                                    setSlotSearchQuery(e.target.value)
                                }
                                placeholder="Поиск слота..."
                                className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-lg"
                            />
                            <button
                                onClick={() => setIsSlotSearchOpen(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Список слотов */}
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                            {filteredSlots.length > 0 ? (
                                filteredSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => {
                                            setSlotName(slot);
                                            setIsSlotSearchOpen(false);
                                            setSlotSearchQuery("");
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors"
                                    >
                                        {slot}
                                    </button>
                                ))
                            ) : (
                                <button
                                    onClick={() => {
                                        setSlotName(slotSearchQuery);
                                        setIsSlotSearchOpen(false);
                                        setSlotSearchQuery("");
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 text-indigo-400 transition-colors flex items-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    Добавить "{slotSearchQuery}"
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
