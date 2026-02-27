import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CardExpense, Subscription, Card, Frequency, Timing, CardCategory } from '../data/initialData';
import { Plus, Trash2, Edit2, Check, X, CreditCard, RefreshCw } from 'lucide-react';

export const Cards: React.FC = () => {
  const { cardExpenses, setCardExpenses, subscriptions, setSubscriptions } = useFinance();
  
  const [editingCardExpId, setEditingCardExpId] = useState<string | null>(null);
  const [editCardExpForm, setEditCardExpForm] = useState<Partial<CardExpense>>({});
  const [isAddingCardExp, setIsAddingCardExp] = useState(false);

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubForm, setEditSubForm] = useState<Partial<Subscription>>({});
  const [isAddingSub, setIsAddingSub] = useState(false);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  // Card Expenses Handlers
  const handleSaveCardExp = () => {
    if (editingCardExpId === 'new') {
      setCardExpenses([...cardExpenses, { ...editCardExpForm, id: Date.now().toString() } as CardExpense]);
      setIsAddingCardExp(false);
    } else {
      setCardExpenses(cardExpenses.map(e => e.id === editingCardExpId ? { ...e, ...editCardExpForm } as CardExpense : e));
    }
    setEditingCardExpId(null);
  };

  const startAddCardExp = () => {
    setIsAddingCardExp(true);
    setEditingCardExpId('new');
    setEditCardExpForm({
      name: '', amount: 0, frequency: 'Mensual', timing: 'Antes de quincena', card: 'Tarjeta Crédito Santander', category: 'Ordinarios', notes: ''
    });
  };

  // Subscriptions Handlers
  const handleSaveSub = () => {
    if (editingSubId === 'new') {
      setSubscriptions([...subscriptions, { ...editSubForm, id: Date.now().toString(), category: 'Suscripciones' } as Subscription]);
      setIsAddingSub(false);
    } else {
      setSubscriptions(subscriptions.map(s => s.id === editingSubId ? { ...s, ...editSubForm } as Subscription : s));
    }
    setEditingSubId(null);
  };

  const startAddSub = () => {
    setIsAddingSub(true);
    setEditingSubId('new');
    setEditSubForm({ name: '', amount: 0, card: 'Tarjeta Crédito Santander', category: 'Suscripciones' });
  };

  return (
    <div className="space-y-10">
      {/* Card Expenses Section */}
      <section>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Gastos de Tarjetas
            </h2>
            <p className="text-neutral-500 mt-1">Estos gastos se sumarán al pago mensual de la tarjeta correspondiente.</p>
          </div>
          <button
            onClick={startAddCardExp}
            disabled={isAddingCardExp}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Añadir Gasto
          </button>
        </header>

        {isAddingCardExp && editingCardExpId === 'new' && (
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-6">
            <h3 className="font-medium text-blue-900 mb-4">Nuevo Gasto de Tarjeta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" className="p-2 border rounded-lg" value={editCardExpForm.name || ''} onChange={e => setEditCardExpForm({...editCardExpForm, name: e.target.value})} placeholder="Nombre" />
              <input type="number" className="p-2 border rounded-lg" value={editCardExpForm.amount || ''} onChange={e => setEditCardExpForm({...editCardExpForm, amount: Number(e.target.value)})} placeholder="Monto" />
              <select className="p-2 border rounded-lg" value={editCardExpForm.frequency} onChange={e => setEditCardExpForm({...editCardExpForm, frequency: e.target.value as Frequency})}>
                <option value="Mensual">Mensual</option>
                <option value="Bimestral">Bimestral</option>
                <option value="Trimestral">Trimestral</option>
                <option value="10 Meses">10 Meses</option>
                <option value="Variable">Variable</option>
              </select>
              <select className="p-2 border rounded-lg" value={editCardExpForm.timing} onChange={e => setEditCardExpForm({...editCardExpForm, timing: e.target.value as Timing})}>
                <option value="Inicio del mes">Inicio del mes</option>
                <option value="Antes de quincena">Antes de quincena</option>
                <option value="Después de quincena">Después de quincena</option>
                <option value="Final del mes">Final del mes</option>
              </select>
              <select className="p-2 border rounded-lg" value={editCardExpForm.card} onChange={e => setEditCardExpForm({...editCardExpForm, card: e.target.value as Card})}>
                <option value="Tarjeta Crédito Santander">Santander</option>
                <option value="Tarjeta de Crédito Iberia Cards ICON">Iberia Cards ICON</option>
              </select>
              <select className="p-2 border rounded-lg" value={editCardExpForm.category} onChange={e => setEditCardExpForm({...editCardExpForm, category: e.target.value as CardCategory})}>
                <option value="Ordinarios">Ordinarios</option>
                <option value="Créditos">Créditos</option>
              </select>
              <input type="text" className="p-2 border rounded-lg" value={editCardExpForm.notes || ''} onChange={e => setEditCardExpForm({...editCardExpForm, notes: e.target.value})} placeholder="Notas" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setIsAddingCardExp(false); setEditingCardExpId(null); }} className="px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg font-medium">Cancelar</button>
              <button onClick={handleSaveCardExp} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Guardar</button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {['Ordinarios', 'Créditos'].map(category => {
            const categoryExpenses = cardExpenses.filter(c => c.category === category);
            if (categoryExpenses.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-lg font-medium text-neutral-900">{category}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 text-sm font-medium text-neutral-500">
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Monto</th>
                        <th className="p-4">Frecuencia</th>
                        <th className="p-4">Tarjeta</th>
                        <th className="p-4">Notas</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {categoryExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                          {editingCardExpId === expense.id ? (
                            <>
                              <td className="p-4"><input type="text" className="w-full p-2 border rounded-lg" value={editCardExpForm.name} onChange={e => setEditCardExpForm({...editCardExpForm, name: e.target.value})} /></td>
                              <td className="p-4"><input type="number" className="w-full p-2 border rounded-lg" value={editCardExpForm.amount} onChange={e => setEditCardExpForm({...editCardExpForm, amount: Number(e.target.value)})} /></td>
                              <td className="p-4">
                                <select className="w-full p-2 border rounded-lg" value={editCardExpForm.frequency} onChange={e => setEditCardExpForm({...editCardExpForm, frequency: e.target.value as Frequency})}>
                                  <option value="Mensual">Mensual</option>
                                  <option value="Bimestral">Bimestral</option>
                                  <option value="Trimestral">Trimestral</option>
                                  <option value="10 Meses">10 Meses</option>
                                  <option value="Variable">Variable</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <select className="w-full p-2 border rounded-lg" value={editCardExpForm.card} onChange={e => setEditCardExpForm({...editCardExpForm, card: e.target.value as Card})}>
                                  <option value="Tarjeta Crédito Santander">Santander</option>
                                  <option value="Tarjeta de Crédito Iberia Cards ICON">Iberia Cards ICON</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-2">
                                  <select className="w-full p-2 border rounded-lg" value={editCardExpForm.category} onChange={e => setEditCardExpForm({...editCardExpForm, category: e.target.value as CardCategory})}>
                                    <option value="Ordinarios">Ordinarios</option>
                                    <option value="Créditos">Créditos</option>
                                  </select>
                                  <input type="text" className="w-full p-2 border rounded-lg" value={editCardExpForm.notes} onChange={e => setEditCardExpForm({...editCardExpForm, notes: e.target.value})} placeholder="Notas" />
                                </div>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={handleSaveCardExp} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Check className="w-5 h-5" /></button>
                                <button onClick={() => setEditingCardExpId(null)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 font-medium text-neutral-900">{expense.name}</td>
                              <td className="p-4 text-rose-600 font-semibold">{formatCurrency(expense.amount)}</td>
                              <td className="p-4 text-neutral-600">{expense.frequency}</td>
                              <td className="p-4 text-neutral-600">{expense.card}</td>
                              <td className="p-4 text-neutral-500 text-sm">{expense.notes}</td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={() => { setEditingCardExpId(expense.id); setEditCardExpForm(expense); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => setCardExpenses(cardExpenses.filter(e => e.id !== expense.id))} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscriptions Section */}
      <section>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-purple-600" />
              Suscripciones
            </h2>
            <p className="text-neutral-500 mt-1">Gastos mensuales fijos cargados a tus tarjetas.</p>
          </div>
          <button
            onClick={startAddSub}
            disabled={isAddingSub}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Añadir Suscripción
          </button>
        </header>

        {isAddingSub && editingSubId === 'new' && (
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 mb-6">
            <h3 className="font-medium text-purple-900 mb-4">Nueva Suscripción</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" className="p-2 border rounded-lg" value={editSubForm.name || ''} onChange={e => setEditSubForm({...editSubForm, name: e.target.value})} placeholder="Nombre" />
              <input type="number" className="p-2 border rounded-lg" value={editSubForm.amount || ''} onChange={e => setEditSubForm({...editSubForm, amount: Number(e.target.value)})} placeholder="Monto" />
              <select className="p-2 border rounded-lg" value={editSubForm.card} onChange={e => setEditSubForm({...editSubForm, card: e.target.value as Card})}>
                <option value="Tarjeta Crédito Santander">Santander</option>
                <option value="Tarjeta de Crédito Iberia Cards ICON">Iberia Cards ICON</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setIsAddingSub(false); setEditingSubId(null); }} className="px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg font-medium">Cancelar</button>
              <button onClick={handleSaveSub} className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium">Guardar</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-sm font-medium text-neutral-500">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Monto Mensual</th>
                  <th className="p-4">Tarjeta</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50 transition-colors">
                    {editingSubId === sub.id ? (
                      <>
                        <td className="p-4"><input type="text" className="w-full p-2 border rounded-lg" value={editSubForm.name} onChange={e => setEditSubForm({...editSubForm, name: e.target.value})} /></td>
                        <td className="p-4"><input type="number" className="w-full p-2 border rounded-lg" value={editSubForm.amount} onChange={e => setEditSubForm({...editSubForm, amount: Number(e.target.value)})} /></td>
                        <td className="p-4">
                          <select className="w-full p-2 border rounded-lg" value={editSubForm.card} onChange={e => setEditSubForm({...editSubForm, card: e.target.value as Card})}>
                            <option value="Tarjeta Crédito Santander">Santander</option>
                            <option value="Tarjeta de Crédito Iberia Cards ICON">Iberia Cards ICON</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={handleSaveSub} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Check className="w-5 h-5" /></button>
                          <button onClick={() => setEditingSubId(null)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-medium text-neutral-900">{sub.name}</td>
                        <td className="p-4 text-rose-600 font-semibold">{formatCurrency(sub.amount)}</td>
                        <td className="p-4 text-neutral-600">{sub.card}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => { setEditingSubId(sub.id); setEditSubForm(sub); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setSubscriptions(subscriptions.filter(s => s.id !== sub.id))} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
