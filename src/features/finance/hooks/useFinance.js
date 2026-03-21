import { useMemo, useState } from "react";
import {
  formatDisplayMoney,
  formatInputWithCommas,
  formatShortDateTime,
  parseAmount,
} from "../../../utils/casino";

const useFinance = ({ currency }) => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "deposit") {
        totalDeposits += transaction.amount;
      } else if (transaction.type === "withdraw") {
        totalWithdrawals += transaction.amount;
      }
    });

    const netProfit = totalWithdrawals - totalDeposits;
    const roi =
      totalDeposits > 0 ? ((netProfit / totalDeposits) * 100).toFixed(1) : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netProfit,
      roi,
      isProfitable: netProfit >= 0,
    };
  }, [transactions]);

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
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  return {
    transactions,
    setTransactions,
    stats,
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
