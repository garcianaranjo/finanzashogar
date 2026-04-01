import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyCashflow } from '../utils/financeUtils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { incomes, expenses, cardExpenses, subscriptions, monthlyRecords } = useFinance();
  const [viewMode, setViewMode] = useState<'current' | 'next'>('current');
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const currentCashflow = useMemo(() => 
    calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, currentMonth, currentYear, monthlyRecords),
  [incomes, expenses, cardExpenses, subscriptions, currentMonth, currentYear, monthlyRecords]);

  const nextCashflow = useMemo(() => 
    calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, nextMonth, nextMonthYear, monthlyRecords),
  [incomes, expenses, cardExpenses, subscriptions, nextMonth, nextMonthYear, monthlyRecords]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const yearlyData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const monthCashflow = calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, i, currentYear, monthlyRecords);
      return {
        name: monthNames[i].substring(0, 3),
        Balance: monthCashflow.totalBalance,
        Ingresos: monthCashflow.totalIncome,
        Gastos: monthCashflow.totalExpense
      };
    });
  }, [incomes, expenses, cardExpenses, subscriptions, currentYear, monthlyRecords]);

  const COLORS = ['#059669', '#3b82f6', '#8b5cf6'];
  
  const activeCashflow = viewMode === 'current' ? currentCashflow : nextCashflow;
  const activeMonthName = viewMode === 'current' ? monthNames[currentMonth] : monthNames[nextMonth];
  const activeYear = viewMode === 'current' ? currentYear : nextMonthYear;
  const activeLabel = viewMode === 'current' ? 'Mes Actual' : 'Próximo Mes';

  const accountData = (Object.entries(activeCashflow.accountTotals) as [string, { income: number; expense: number; balance: number }][]).map(([name, data]) => ({
    name,
    Ingresos: data.income,
    Gastos: data.expense,
    Balance: data.balance,
  }));

  const expenseData = [
    { name: 'Santander Juan', value: activeCashflow.accountTotals['Santander de Juan'].expense },
    { name: 'CaixaBank Juan', value: activeCashflow.accountTotals['CaixaBank de Juan'].expense },
    { name: 'Santander Sara', value: activeCashflow.accountTotals['Santander de Sara'].expense },
  ];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const incomeCategoryData = Object.entries(activeCashflow.incomeCategoryTotals).map(([name, value]) => ({ name, value }));
  const expenseCategoryData = Object.entries(activeCashflow.expenseCategoryTotals).map(([name, value]) => ({ name, value }));

  const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Resumen Financiero</h2>
        <p className="text-neutral-500 mt-1">Vista general de tus finanzas</p>
      </header>

      {/* Yearly Balance Chart */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="text-lg font-medium text-neutral-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neutral-500" />
          Balance Anual ({currentYear})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={(value) => `${value / 1000}k`} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Balance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Month Toggle */}
      <div className="flex justify-center">
        <div className="bg-neutral-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setViewMode('current')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'current' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Mes Actual ({monthNames[currentMonth]})
          </button>
          <button
            onClick={() => setViewMode('next')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'next' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Próximo Mes ({monthNames[nextMonth]})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <section>
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-neutral-500" />
          {activeMonthName} {activeYear} ({activeLabel})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Ingresos {viewMode === 'next' ? 'Proyectados' : 'Totales'}</p>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(activeCashflow.totalIncome)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Gastos {viewMode === 'next' ? 'Proyectados' : 'Totales'}</p>
              <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(activeCashflow.totalExpense)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Balance {viewMode === 'next' ? 'Proyectado' : 'Neto'}</p>
              <p className={`text-2xl font-semibold ${activeCashflow.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(activeCashflow.totalBalance)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Gastos por Categoría</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="45%"
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
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
          <h3 className="text-lg font-medium text-neutral-900 mb-6">Ingresos por Categoría</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%"
                  cy="45%"
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
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
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
    </div>
  );
};
