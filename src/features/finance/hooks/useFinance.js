import { useMemo, useState } from "react";
import {
  formatDisplayMoney,
  formatInputWithCommas,
  formatShortDateTime,
  parseAmount,
} from "../../../utils/casino";

const useFinance = ({ currency, slotGroups = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");

  const slotTransactions = useMemo(() => {
    return slotGroups
      .flatMap((group) =>
        group.items.map((item, index) => {
          const previousItem = group.items[index + 1];
          const currentBalance = parseAmount(item.balance);
          const previousBalance = previousItem
            ? parseAmount(previousItem.balance)
            : 0;

          if (
            Number.isNaN(currentBalance) ||
            Number.isNaN(previousBalance) ||
            currentBalance === previousBalance
          ) {
            return null;
          }

          const delta = currentBalance - previousBalance;
          return {
            id: `slot-${group.id}-${item.id}`,
            type: "slot",
            source: "slots",
            amount: Math.abs(delta),
            netAmount: delta,
            note: item.name || group.name,
            provider: item.provider || "",
            groupName: group.name,
            date: item.date,
            sessionCurrency: item.sessionCurrency || currency,
          };
        }),
      )
      .filter(Boolean)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currency, slotGroups]);

  const allTransactions = useMemo(() => {
    const manualTransactions = transactions.map((transaction) => ({
      ...transaction,
      source: "manual",
      netAmount:
        transaction.type === "deposit"
          ? -transaction.amount
          : transaction.amount,
      sessionCurrency: currency,
    }));

    return [...slotTransactions, ...manualTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [currency, slotTransactions, transactions]);

  const visibleTransactions = useMemo(() => {
    if (transactionFilter === "manual") {
      return allTransactions.filter(
        (transaction) => transaction.source === "manual",
      );
    }

    if (transactionFilter === "slots") {
      return allTransactions.filter(
        (transaction) => transaction.source === "slots",
      );
    }

    return allTransactions;
  }, [allTransactions, transactionFilter]);

  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalSlotResult = 0;
    let totalSlotWins = 0;
    let totalSlotLosses = 0;

    allTransactions.forEach((transaction) => {
      if (transaction.type === "deposit") {
        totalDeposits += transaction.amount;
      } else if (transaction.type === "withdraw") {
        totalWithdrawals += transaction.amount;
      } else if (transaction.type === "slot") {
        totalSlotResult += transaction.netAmount;
        if (transaction.netAmount > 0) {
          totalSlotWins += transaction.netAmount;
        } else {
          totalSlotLosses += Math.abs(transaction.netAmount);
        }
      }
    });

    const netProfit = totalWithdrawals + totalSlotResult - totalDeposits;
    const roi =
      totalDeposits > 0 ? ((netProfit / totalDeposits) * 100).toFixed(1) : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      totalSlotResult,
      totalSlotWins,
      totalSlotLosses,
      netProfit,
      roi,
      isProfitable: netProfit >= 0,
    };
  }, [allTransactions]);

  const openModal = (type) => {
    setTransactionType(type);
    setAmount("");
    setNote("");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleAddTransaction = (event) => {
    event.preventDefault();

    const parsedAmount = parseAmount(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const newTransaction = {
      id: crypto.randomUUID(),
      type: transactionType,
      amount: parsedAmount,
      note:
        note.trim() || (transactionType === "deposit" ? "Депозит" : "Вывод"),
      date: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    closeModal();
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
  };

  return {
    transactions,
    allTransactions,
    visibleTransactions,
    slotTransactions,
    setTransactions,
    stats,
    transactionFilter,
    setTransactionFilter,
    isModalOpen,
    transactionType,
    amount,
    note,
    setAmount: (value) => setAmount(formatInputWithCommas(value)),
    setNote,
    openModal,
    closeModal,
    handleAddTransaction,
    handleDeleteTransaction,
    formatMoney: (value) => formatDisplayMoney(value, currency),
    formatDate: formatShortDateTime,
  };
};

export default useFinance;
