import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyCashflow } from '../utils/financeUtils';
import { MonthlyRecord } from '../data/initialData';
import { ChevronLeft, ChevronRight, Save, RotateCcw, Info } from 'lucide-react';

export const MonthlyTracking: React.FC = () => {
  const { incomes, expenses, cardExpenses, subscriptions, monthlyRecords, setMonthlyRecords } = useFinance();
  
  const [viewDate, setViewDate] = useState(new Date());
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const currentRecord = useMemo(() => {
    return monthlyRecords.find(r => r.month === month && r.year === year) || {
      month,
      year,
      incomeActuals: {},
      expenseActuals: {},
      cardExpenseActuals: {}
    };
  }, [monthlyRecords, month, year]);

  const cashflow = useMemo(() => 
    calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, month, year, monthlyRecords),
  [incomes, expenses, cardExpenses, subscriptions, month, year, monthlyRecords]);

  const handleUpdateActual = (type: 'income' | 'expense' | 'cardExpense', id: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    setMonthlyRecords(prev => {
      const existingIndex = prev.findIndex(r => r.month === month && r.year === year);
      const newRecords = [...prev];
      
      let record: MonthlyRecord;
      if (existingIndex >= 0) {
        record = { ...newRecords[existingIndex] };
        newRecords[existingIndex] = record;
      } else {
        record = { month, year, incomeActuals: {}, expenseActuals: {}, cardExpenseActuals: {} };
        newRecords.push(record);
      }

      const actualsKey = type === 'income' ? 'incomeActuals' : type === 'expense' ? 'expenseActuals' : 'cardExpenseActuals';
      
      if (numValue === undefined) {
        delete record[actualsKey][id];
      } else {
        record[actualsKey][id] = numValue;
      }

      return newRecords;
    });
  };

  const resetMonth = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear los valores reales de este mes?')) {
      setMonthlyRecords(prev => prev.filter(r => !(r.month === month && r.year === year)));
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const changeMonth = (delta: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + delta);
    setViewDate(next);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Seguimiento Mensual</h2>
          <p className="text-neutral-500 mt-1">Ajusta los valores reales para cada mes</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-sm font-medium text-emerald-700">Ingresos Reales</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(cashflow.totalIncome)}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <p className="text-sm font-medium text-rose-700">Gastos Reales</p>
          <p className="text-2xl font-bold text-rose-900">{formatCurrency(cashflow.totalExpense)}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <p className="text-sm font-medium text-blue-700">Balance Real</p>
          <p className={`text-2xl font-bold ${cashflow.totalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(cashflow.totalBalance)}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start text-amber-800 text-sm mb-6">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Los valores se pre-calculan automáticamente según tus plantillas. 
          Si cambias un ingreso, los gastos dependientes (como el Diezmo) se actualizarán instantáneamente a menos que también los sobrescribas manualmente.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Incomes Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-neutral-900 px-2">Ingresos del Mes</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Fuente</th>
                  <th className="p-4">Estimado</th>
                  <th className="p-4">Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {incomes.map(inc => {
                  const isExtraMonth = inc.frequency === '14 Pagas' && (month === 5 || month === 11);
                  const baseAmount = isExtraMonth ? inc.amount * 2 : inc.amount;
                  const actual = currentRecord.incomeActuals[inc.id];
                  
                  return (
                    <tr key={inc.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{inc.name}</div>
                        <div className="text-xs text-neutral-500">{inc.account}</div>
                      </td>
                      <td className="p-4 text-neutral-500">{formatCurrency(baseAmount)}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          placeholder={baseAmount.toString()}
                          className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${actual !== undefined ? 'border-emerald-500 bg-emerald-50 font-semibold' : 'border-neutral-200'}`}
                          value={actual ?? ''}
                          onChange={(e) => handleUpdateActual('income', inc.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-neutral-900 px-2">Gastos del Mes</h3>
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Gasto</th>
                  <th className="p-4">Estimado</th>
                  <th className="p-4">Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {expenses.map(exp => {
                  // Simplified base amount calculation for display
                  let baseAmount = exp.amount;
                  if (exp.frequency === '10 Meses' && (month === 6 || month === 7)) baseAmount = 0;
                  if (exp.frequency === 'Bimestral' && month % 2 !== 0) baseAmount = 0;
                  if (exp.frequency === 'Trimestral' && month % 3 !== 0) baseAmount = 0;

                  // Handle dependency for estimated display
                  if (exp.dependencyId && exp.dependencyPercentage) {
                    const inc = incomes.find(i => i.id === exp.dependencyId);
                    if (inc) {
                      const incBase = (inc.frequency === '14 Pagas' && (month === 5 || month === 11)) ? inc.amount * 2 : inc.amount;
                      const incActual = currentRecord.incomeActuals[inc.id];
                      const resolvedInc = incActual !== undefined ? incActual : incBase;
                      baseAmount = (resolvedInc * exp.dependencyPercentage) / 100;
                    }
                  }

                  const actual = currentRecord.expenseActuals[exp.id];
                  
                  return (
                    <tr key={exp.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{exp.name}</div>
                        <div className="text-xs text-neutral-500">{exp.account}</div>
                      </td>
                      <td className="p-4 text-neutral-500">{formatCurrency(baseAmount)}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          placeholder={baseAmount.toString()}
                          className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all ${actual !== undefined ? 'border-rose-500 bg-rose-50 font-semibold' : 'border-neutral-200'}`}
                          value={actual ?? ''}
                          onChange={(e) => handleUpdateActual('expense', exp.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={resetMonth}
          className="flex items-center gap-2 px-6 py-3 text-rose-600 font-medium hover:bg-rose-50 rounded-2xl transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Resetear Mes
        </button>
      </div>
    </div>
  );
};
