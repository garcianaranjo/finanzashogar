import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Income,
  Expense,
  CardExpense,
  Subscription,
  MonthlyRecord,
  initialIncomes,
  initialExpenses,
  initialCardExpenses,
  initialSubscriptions,
} from '../data/initialData';

interface FinanceContextType {
  incomes: Income[];
  expenses: Expense[];
  cardExpenses: CardExpense[];
  subscriptions: Subscription[];
  monthlyRecords: MonthlyRecord[];
  setIncomes: React.Dispatch<React.SetStateAction<Income[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setCardExpenses: React.Dispatch<React.SetStateAction<CardExpense[]>>;
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  setMonthlyRecords: React.Dispatch<React.SetStateAction<MonthlyRecord[]>>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DATA_VERSION = 'v3';

const getInitialState = <T,>(key: string, defaultVal: T) => {
  const version = localStorage.getItem('finances_version');
  if (version !== DATA_VERSION) return defaultVal;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultVal;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomes, setIncomes] = useState<Income[]>(() => getInitialState('finances_incomes', initialIncomes));
  const [expenses, setExpenses] = useState<Expense[]>(() => getInitialState('finances_expenses', initialExpenses));
  const [cardExpenses, setCardExpenses] = useState<CardExpense[]>(() => getInitialState('finances_cardExpenses', initialCardExpenses));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getInitialState('finances_subscriptions', initialSubscriptions));
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>(() => getInitialState('finances_monthlyRecords', []));

  useEffect(() => {
    localStorage.setItem('finances_version', DATA_VERSION);
  }, []);

  useEffect(() => {
    localStorage.setItem('finances_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('finances_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finances_cardExpenses', JSON.stringify(cardExpenses));
  }, [cardExpenses]);

  useEffect(() => {
    localStorage.setItem('finances_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('finances_monthlyRecords', JSON.stringify(monthlyRecords));
  }, [monthlyRecords]);

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        cardExpenses,
        subscriptions,
        monthlyRecords,
        setIncomes,
        setExpenses,
        setCardExpenses,
        setSubscriptions,
        setMonthlyRecords,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
