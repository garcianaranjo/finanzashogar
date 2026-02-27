import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking', label: 'Seguimiento Mensual', icon: Wallet },
    { id: 'incomes', label: 'Ingresos', icon: ArrowUpCircle },
    { id: 'expenses', label: 'Gastos', icon: ArrowDownCircle },
    { id: 'cards', label: 'Tarjetas y Suscripciones', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-neutral-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            Finanzas Casa
          </h1>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
