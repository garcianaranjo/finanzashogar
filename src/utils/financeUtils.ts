import { Income, Expense, CardExpense, Subscription, Account, Card, MonthlyRecord } from '../data/initialData';

export const calculateMonthlyCashflow = (
  incomes: Income[],
  expenses: Expense[],
  cardExpenses: CardExpense[],
  subscriptions: Subscription[],
  month: number, // 0-11
  year: number,
  monthlyRecords: MonthlyRecord[] = []
) => {
  const record = monthlyRecords.find(r => r.month === month && r.year === year);

  // Helper to get monthly amount based on frequency
  const getBaseAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'Mensual': return amount;
      case '14 Pagas': 
        return (month === 5 || month === 11) ? amount * 2 : amount;
      case 'Bimestral': 
        // Simple logic: even months
        return (month % 2 === 0) ? amount : 0;
      case 'Trimestral': 
        // Simple logic: Jan, Apr, Jul, Oct
        return (month % 3 === 0) ? amount : 0;
      case '10 Meses': 
        return (month === 6 || month === 7) ? 0 : amount;
      case 'Variable': 
        return 0; // Default to 0, user must enter actuals in Monthly Tracking
      default: return amount;
    }
  };

  const accountTotals: Record<Account, { income: number; expense: number; balance: number }> = {
    'Santander de Juan': { income: 0, expense: 0, balance: 0 },
    'CaixaBank de Juan': { income: 0, expense: 0, balance: 0 },
    'Santander de Sara': { income: 0, expense: 0, balance: 0 },
  };

  const incomeCategoryTotals: Record<string, number> = {};
  const expenseCategoryTotals: Record<string, number> = {};

  // 1. Calculate Incomes (Actuals override base)
  const resolvedIncomes: Record<string, number> = {};
  incomes.forEach(inc => {
    const base = getBaseAmount(inc.amount, inc.frequency);
    const actual = record?.incomeActuals[inc.id];
    const final = actual !== undefined ? actual : base;
    resolvedIncomes[inc.id] = final;
    accountTotals[inc.account].income += final;
    
    incomeCategoryTotals[inc.category] = (incomeCategoryTotals[inc.category] || 0) + final;
  });

  // 2. Calculate Card Totals
  const cardTotals: Record<Card, number> = {
    'Tarjeta Crédito Santander': 0,
    'Tarjeta de Crédito Iberia Cards ICON': 0,
  };

  cardExpenses.forEach(ce => {
    const base = getBaseAmount(ce.amount, ce.frequency);
    const actual = record?.cardExpenseActuals[ce.id];
    const final = actual !== undefined ? actual : base;
    cardTotals[ce.card] += final;
    
    expenseCategoryTotals[ce.category] = (expenseCategoryTotals[ce.category] || 0) + final;
  });

  subscriptions.forEach(sub => {
    cardTotals[sub.card] += sub.amount;
    expenseCategoryTotals[sub.category] = (expenseCategoryTotals[sub.category] || 0) + sub.amount;
  });

  // 3. Calculate Expenses (Actuals override base, handle dependencies)
  expenses.forEach(exp => {
    let final = 0;
    const actual = record?.expenseActuals[exp.id];

    if (actual !== undefined) {
      final = actual;
    } else if (exp.dependencyId && exp.dependencyPercentage) {
      // Dependent value (Diezmo)
      const incomeVal = resolvedIncomes[exp.dependencyId] || 0;
      final = (incomeVal * exp.dependencyPercentage) / 100;
    } else {
      final = getBaseAmount(exp.amount, exp.frequency);
    }

    accountTotals[exp.account].expense += final;
    expenseCategoryTotals[exp.category] = (expenseCategoryTotals[exp.category] || 0) + final;
  });

  // Add Card Totals to respective accounts
  accountTotals['Santander de Juan'].expense += cardTotals['Tarjeta Crédito Santander'];
  accountTotals['CaixaBank de Juan'].expense += cardTotals['Tarjeta de Crédito Iberia Cards ICON'];

  // Calculate Balances
  (Object.keys(accountTotals) as Account[]).forEach(acc => {
    accountTotals[acc].balance = accountTotals[acc].income - accountTotals[acc].expense;
  });

  const totalIncome = Object.values(accountTotals).reduce((sum, acc) => sum + acc.income, 0);
  const totalExpense = Object.values(accountTotals).reduce((sum, acc) => sum + acc.expense, 0);
  const totalBalance = totalIncome - totalExpense;

  return {
    accountTotals,
    totalIncome,
    totalExpense,
    totalBalance,
    cardTotals,
    incomeCategoryTotals,
    expenseCategoryTotals
  };
};
