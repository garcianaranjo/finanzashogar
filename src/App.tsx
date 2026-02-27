/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { MonthlyTracking } from './views/MonthlyTracking';
import { Incomes } from './views/Incomes';
import { Expenses } from './views/Expenses';
import { Cards } from './views/Cards';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tracking': return <MonthlyTracking />;
      case 'incomes': return <Incomes />;
      case 'expenses': return <Expenses />;
      case 'cards': return <Cards />;
      default: return <Dashboard />;
    }
  };

  return (
    <FinanceProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </FinanceProvider>
  );
}
