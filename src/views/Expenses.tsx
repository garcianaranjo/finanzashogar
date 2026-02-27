import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Expense, Account, Frequency, Timing, ExpenseType, ExpenseCategory } from '../data/initialData';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { expenses, setExpenses } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [isAdding, setIsAdding] = useState(false);

  const categories: ExpenseCategory[] = ['Vivienda y Suministros', 'Hijos y Educación', 'Cargos Profesionales', 'Seguros', 'Deudas y Préstamos', 'Otros'];

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const handleSave = () => {
    if (editingId === 'new') {
      setExpenses([...expenses, { ...editForm, id: Date.now().toString() } as Expense]);
      setIsAdding(false);
    } else {
      setExpenses(expenses.map(e => e.id === editingId ? { ...e, ...editForm } as Expense : e));
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId('new');
    setEditForm({
      name: '',
      amount: 0,
      frequency: 'Mensual',
      timing: 'Inicio del mes',
      type: 'Débito',
      account: 'Santander de Juan',
      category: 'Vivienda y Suministros',
      notes: ''
    });
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">Gastos</h2>
          <p className="text-neutral-500 mt-1">Gestiona tus gastos regulares por categoría</p>
        </div>
        <button
          onClick={startAdd}
          disabled={isAdding}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Añadir Gasto
        </button>
      </header>

      {isAdding && editingId === 'new' && (
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 mb-6">
          <h3 className="font-medium text-rose-900 mb-4">Nuevo Gasto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" className="p-2 border rounded-lg" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nombre" />
            <input type="number" className="p-2 border rounded-lg" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} placeholder="Monto" />
            <select className="p-2 border rounded-lg" value={editForm.frequency} onChange={e => setEditForm({...editForm, frequency: e.target.value as Frequency})}>
              <option value="Mensual">Mensual</option>
              <option value="Bimestral">Bimestral</option>
              <option value="Trimestral">Trimestral</option>
              <option value="10 Meses">10 Meses</option>
              <option value="Variable">Variable</option>
            </select>
            <select className="p-2 border rounded-lg" value={editForm.timing} onChange={e => setEditForm({...editForm, timing: e.target.value as Timing})}>
              <option value="Inicio del mes">Inicio del mes</option>
              <option value="Antes de quincena">Antes de quincena</option>
              <option value="Después de quincena">Después de quincena</option>
              <option value="Final del mes">Final del mes</option>
            </select>
            <select className="p-2 border rounded-lg" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as ExpenseType})}>
              <option value="Transferencia">Transferencia</option>
              <option value="Débito">Débito</option>
            </select>
            <select className="p-2 border rounded-lg" value={editForm.account} onChange={e => setEditForm({...editForm, account: e.target.value as Account})}>
              <option value="Santander de Juan">Santander de Juan</option>
              <option value="CaixaBank de Juan">CaixaBank de Juan</option>
              <option value="Santander de Sara">Santander de Sara</option>
            </select>
            <select className="p-2 border rounded-lg" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value as ExpenseCategory})}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" className="p-2 border rounded-lg" value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Notas" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-rose-600 hover:bg-rose-100 rounded-lg font-medium">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-medium">Guardar</button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {categories.map(category => {
          const categoryExpenses = expenses.filter(e => e.category === category);
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
                      <th className="p-4">Momento</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Cuenta</th>
                      <th className="p-4">Notas</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {categoryExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                        {editingId === expense.id ? (
                          <>
                            <td className="p-4"><input type="text" className="w-full p-2 border rounded-lg" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                            <td className="p-4"><input type="number" className="w-full p-2 border rounded-lg" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} /></td>
                            <td className="p-4">
                              <select className="w-full p-2 border rounded-lg" value={editForm.frequency} onChange={e => setEditForm({...editForm, frequency: e.target.value as Frequency})}>
                                <option value="Mensual">Mensual</option>
                                <option value="Bimestral">Bimestral</option>
                                <option value="Trimestral">Trimestral</option>
                                <option value="10 Meses">10 Meses</option>
                                <option value="Variable">Variable</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select className="w-full p-2 border rounded-lg" value={editForm.timing} onChange={e => setEditForm({...editForm, timing: e.target.value as Timing})}>
                                <option value="Inicio del mes">Inicio del mes</option>
                                <option value="Antes de quincena">Antes de quincena</option>
                                <option value="Después de quincena">Después de quincena</option>
                                <option value="Final del mes">Final del mes</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select className="w-full p-2 border rounded-lg" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as ExpenseType})}>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Débito">Débito</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select className="w-full p-2 border rounded-lg" value={editForm.account} onChange={e => setEditForm({...editForm, account: e.target.value as Account})}>
                                <option value="Santander de Juan">Santander de Juan</option>
                                <option value="CaixaBank de Juan">CaixaBank de Juan</option>
                                <option value="Santander de Sara">Santander de Sara</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <select className="w-full p-2 border rounded-lg" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value as ExpenseCategory})}>
                                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="text" className="w-full p-2 border rounded-lg" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Notas" />
                              </div>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Check className="w-5 h-5" /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 font-medium text-neutral-900">{expense.name}</td>
                            <td className="p-4 text-rose-600 font-semibold">{formatCurrency(expense.amount)}</td>
                            <td className="p-4 text-neutral-600">{expense.frequency}</td>
                            <td className="p-4 text-neutral-600">{expense.timing}</td>
                            <td className="p-4 text-neutral-600">{expense.type}</td>
                            <td className="p-4 text-neutral-600">{expense.account}</td>
                            <td className="p-4 text-neutral-500 text-sm">{expense.notes}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => handleEdit(expense)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(expense.id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
    </div>
  );
};

