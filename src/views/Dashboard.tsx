import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyCashflow } from '../utils/financeUtils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { incomes, expenses, cardExpenses, subscriptions, monthlyRecords } = useFinance();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const cashflow = useMemo(() => 
    calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, currentMonth, currentYear, monthlyRecords),
  [incomes, expenses, cardExpenses, subscriptions, currentMonth, currentYear, monthlyRecords]);

  const COLORS = ['#059669', '#3b82f6', '#8b5cf6'];
  
  const accountData = (Object.entries(cashflow.accountTotals) as [string, { income: number; expense: number; balance: number }][]).map(([name, data]) => ({
    name,
    Ingresos: data.income,
    Gastos: data.expense,
    Balance: data.balance,
  }));

  const expenseData = [
    { name: 'Santander Juan', value: cashflow.accountTotals['Santander de Juan'].expense },
    { name: 'CaixaBank Juan', value: cashflow.accountTotals['CaixaBank de Juan'].expense },
    { name: 'Santander Sara', value: cashflow.accountTotals['Santander de Sara'].expense },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const incomeCategoryData = Object.entries(cashflow.incomeCategoryTotals).map(([name, value]) => ({ name, value }));
  const expenseCategoryData = Object.entries(cashflow.expenseCategoryTotals).map(([name, value]) => ({ name, value }));

  const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Resumen Financiero</h2>
        <p className="text-neutral-500 mt-1">Valores correspondientes a {monthNames[currentMonth]} {currentYear}</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Ingresos Totales</p>
            <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(cashflow.totalIncome)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Gastos Totales</p>
            <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(cashflow.totalExpense)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Balance Neto</p>
            <p className={`text-2xl font-semibold ${cashflow.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(cashflow.totalBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Gastos por Categoría</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Ingresos por Categoría</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Solvencia por Cuenta</h3>
          <div className="space-y-4">
            {accountData.map((acc) => (
              <div key={acc.name} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-neutral-900">{acc.name}</span>
                  <span className={`font-semibold ${acc.Balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(acc.Balance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Ingresos: {formatCurrency(acc.Ingresos)}</span>
                  <span>Gastos: {formatCurrency(acc.Gastos)}</span>
                </div>
                {/* Progress bar for expenses vs income */}
                <div className="mt-3 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${acc.Gastos > acc.Ingresos ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((acc.Gastos / (acc.Ingresos || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Distribución de Gastos por Cuenta</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Credit Cards Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="text-lg font-medium text-neutral-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-neutral-500" />
          Proyección de Tarjetas de Crédito
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-900">Santander (Juan)</span>
              <span className="text-xl font-semibold text-red-700">
                {formatCurrency(cashflow.cardTotals['Tarjeta Crédito Santander'])}
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">Se debitará de Santander de Juan a final de mes</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Iberia Cards ICON (Juan)</span>
              <span className="text-xl font-semibold text-blue-700">
                {formatCurrency(cashflow.cardTotals['Tarjeta de Crédito Iberia Cards ICON'])}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Se debitará de CaixaBank de Juan a final de mes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
