import React, { useState, useMemo, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateMonthlyCashflow } from '../utils/financeUtils';
import { MonthlyRecord, Account, Card } from '../data/initialData';
import { ChevronLeft, ChevronRight, Save, RotateCcw, Info, UploadCloud, Loader2 } from 'lucide-react';
import { extractActualsFromPDF } from '../services/aiService';

export const MonthlyTracking: React.FC = () => {
  const { incomes, expenses, cardExpenses, subscriptions, monthlyRecords, setMonthlyRecords } = useFinance();
  
  const [viewDate, setViewDate] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const currentRecord = useMemo(() => {
    return monthlyRecords.find(r => r.month === month && r.year === year) || {
      month,
      year,
      incomeActuals: {},
      expenseActuals: {},
      cardExpenseActuals: {},
      cardPaymentActuals: {}
    };
  }, [monthlyRecords, month, year]);

  const cashflow = useMemo(() => 
    calculateMonthlyCashflow(incomes, expenses, cardExpenses, subscriptions, month, year, monthlyRecords),
  [incomes, expenses, cardExpenses, subscriptions, month, year, monthlyRecords]);

  const handleUpdateActual = (type: 'income' | 'expense' | 'cardExpense' | 'cardPayment', id: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    setMonthlyRecords(prev => {
      const existingIndex = prev.findIndex(r => r.month === month && r.year === year);
      const newRecords = [...prev];
      
      let record: MonthlyRecord;
      if (existingIndex >= 0) {
        record = { ...newRecords[existingIndex] };
        newRecords[existingIndex] = record;
      } else {
        record = { month, year, incomeActuals: {}, expenseActuals: {}, cardExpenseActuals: {}, cardPaymentActuals: {} };
        newRecords.push(record);
      }

      const actualsKey = type === 'income' ? 'incomeActuals' : 
                         type === 'expense' ? 'expenseActuals' : 
                         type === 'cardExpense' ? 'cardExpenseActuals' : 
                         'cardPaymentActuals';
      
      // Ensure the object exists (for backward compatibility with older records)
      if (!record[actualsKey]) {
        record[actualsKey] = {};
      }
      
      if (numValue === undefined) {
        delete record[actualsKey]![id];
      } else {
        record[actualsKey]![id] = numValue;
      }

      return newRecords;
    });
  };

  const handleUpdateStartingBalance = (account: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    setMonthlyRecords(prev => {
      const existingIndex = prev.findIndex(r => r.month === month && r.year === year);
      const newRecords = [...prev];
      
      let record: MonthlyRecord;
      if (existingIndex >= 0) {
        record = { ...newRecords[existingIndex] };
        newRecords[existingIndex] = record;
      } else {
        record = { month, year, incomeActuals: {}, expenseActuals: {}, cardExpenseActuals: {}, cardPaymentActuals: {}, startingBalances: {} };
        newRecords.push(record);
      }

      if (!record.startingBalances) {
        record.startingBalances = {};
      }
      
      if (numValue === undefined) {
        delete record.startingBalances[account];
      } else {
        record.startingBalances[account] = numValue;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, sube un archivo PDF.');
      return;
    }

    setIsProcessing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const cards: Card[] = ['Tarjeta Crédito Santander', 'Tarjeta de Crédito Iberia Cards ICON', 'Tarjeta Carrefour', 'Tarjeta El Corte Inglés'];
          
          const extracted = await extractActualsFromPDF(base64String, file.type, incomes, expenses, cards);
          
          // Apply extracted data
          setMonthlyRecords(prev => {
            const newRecords = [...prev];
            
            const getOrCreateRecord = (targetMonth: number, targetYear: number) => {
              let idx = newRecords.findIndex(r => r.month === targetMonth && r.year === targetYear);
              if (idx >= 0) {
                newRecords[idx] = { ...newRecords[idx] };
                return newRecords[idx];
              } else {
                const newRecord: MonthlyRecord = { month: targetMonth, year: targetYear, incomeActuals: {}, expenseActuals: {}, cardExpenseActuals: {}, cardPaymentActuals: {}, startingBalances: {} };
                newRecords.push(newRecord);
                return newRecord;
              }
            };

            const currentRecord = getOrCreateRecord(month, year);

            if (!currentRecord.incomeActuals) currentRecord.incomeActuals = {};
            if (!currentRecord.expenseActuals) currentRecord.expenseActuals = {};
            if (!currentRecord.cardPaymentActuals) currentRecord.cardPaymentActuals = {};

            extracted.incomeActuals?.forEach(inc => {
              currentRecord.incomeActuals[inc.id] = inc.amount;
            });
            extracted.expenseActuals?.forEach(exp => {
              currentRecord.expenseActuals[exp.id] = exp.amount;
            });
            extracted.cardPaymentActuals?.forEach(card => {
              currentRecord.cardPaymentActuals![card.card] = card.amount;
            });

            // Handle next month actuals
            if ((extracted.nextMonthExpenseActuals && extracted.nextMonthExpenseActuals.length > 0) || 
                (extracted.nextMonthCardPaymentActuals && extracted.nextMonthCardPaymentActuals.length > 0)) {
              
              const nextMonth = month === 11 ? 0 : month + 1;
              const nextYear = month === 11 ? year + 1 : year;
              const nextRecord = getOrCreateRecord(nextMonth, nextYear);

              if (!nextRecord.expenseActuals) nextRecord.expenseActuals = {};
              if (!nextRecord.cardPaymentActuals) nextRecord.cardPaymentActuals = {};

              extracted.nextMonthExpenseActuals?.forEach(exp => {
                nextRecord.expenseActuals[exp.id] = exp.amount;
              });
              extracted.nextMonthCardPaymentActuals?.forEach(card => {
                nextRecord.cardPaymentActuals![card.card] = card.amount;
              });
            }

            return newRecords;
          });
          
          alert('¡Datos extraídos y aplicados con éxito!');
        } catch (error) {
          console.error('Error processing PDF:', error);
          alert('Hubo un error al procesar el PDF. Por favor, intenta de nuevo.');
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        alert('Error al leer el archivo.');
        setIsProcessing(false);
      };
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Seguimiento Mensual</h2>
          <p className="text-neutral-500 mt-1">Ajusta los valores reales para cada mes</p>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            <span className="hidden sm:inline">{isProcessing ? 'Procesando PDF...' : 'Autocompletar con IA'}</span>
          </button>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
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
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Saldo Anterior Total</p>
          <p className="text-2xl font-bold text-neutral-900">{formatCurrency(cashflow.totalStartingBalance)}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-sm font-medium text-emerald-700">Ingresos Reales</p>
          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(cashflow.totalIncome)}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <p className="text-sm font-medium text-rose-700">Gastos Reales</p>
          <p className="text-2xl font-bold text-rose-900">{formatCurrency(cashflow.totalExpense)}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <p className="text-sm font-medium text-blue-700">Balance Final</p>
          <p className={`text-2xl font-bold ${cashflow.totalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(cashflow.totalBalance)}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start text-amber-800 text-sm mb-8">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          Los valores se pre-calculan automáticamente según tus plantillas. 
          Si cambias un ingreso, los gastos dependientes (como el Diezmo) se actualizarán instantáneamente a menos que también los sobrescribas manualmente.
        </p>
      </div>

      {/* Account Balances Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4 px-2">Balance por Cuentas Bancarias</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(cashflow.accountTotals) as [Account, { startingBalance: number, income: number, expense: number, balance: number }][]).map(([account, totals]) => (
            <div key={account} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col">
              <h4 className="font-medium text-neutral-900 mb-4">{account}</h4>
              <div className="space-y-3 text-sm flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Saldo Anterior:</span>
                  <input
                    type="number"
                    placeholder="0"
                    className={`w-24 p-1.5 text-right border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${currentRecord.startingBalances?.[account] !== undefined ? 'border-blue-500 bg-blue-50 font-semibold' : 'border-neutral-200'}`}
                    value={currentRecord.startingBalances?.[account] ?? ''}
                    onChange={(e) => handleUpdateStartingBalance(account, e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Ingresos:</span>
                  <span className="text-emerald-600 font-medium">+{formatCurrency(totals.income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Gastos:</span>
                  <span className="text-rose-600 font-medium">-{formatCurrency(totals.expense)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-100 flex justify-between items-center font-semibold text-base">
                  <span className="text-neutral-900">Balance Final:</span>
                  <span className={totals.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatCurrency(totals.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  const actual = currentRecord.incomeActuals?.[inc.id];
                  
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

                  const actual = currentRecord.expenseActuals?.[exp.id];
                  
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

                {/* Render Card Totals as Expenses */}
                {(Object.entries(cashflow.cardTotals) as [Card, number][]).map(([cardName, total]) => {
                  const actual = currentRecord.cardPaymentActuals?.[cardName];
                  
                  // Show if there is an estimated total OR an actual override
                  if (total === 0 && actual === undefined) return null;
                  
                  let accountName = '';
                  if (cardName === 'Tarjeta Crédito Santander' || cardName === 'Tarjeta Carrefour') accountName = 'Santander de Juan';
                  else if (cardName === 'Tarjeta de Crédito Iberia Cards ICON') accountName = 'CaixaBank de Juan';
                  else if (cardName === 'Tarjeta El Corte Inglés') accountName = 'Santander de Sara';

                  return (
                    <tr key={cardName} className="bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">Pago {cardName}</div>
                        <div className="text-xs text-neutral-500">{accountName}</div>
                      </td>
                      <td className="p-4 text-neutral-500">{formatCurrency(total)}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          placeholder={total.toString()}
                          className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all ${actual !== undefined ? 'border-rose-500 bg-rose-50 font-semibold' : 'border-neutral-200'}`}
                          value={actual ?? ''}
                          onChange={(e) => handleUpdateActual('cardPayment', cardName, e.target.value)}
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
