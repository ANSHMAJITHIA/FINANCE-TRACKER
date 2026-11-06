import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../common/Toast';
import TransactionModal from '../transactions/TransactionModal';

const titlesMap = {
  '/': 'Financial Dashboard',
  '/transactions': 'Transactions & Records',
  '/budgets': 'Monthly Budget Planner',
  '/goals': 'Savings Targets & Goals',
  '/analytics': 'Visual Trends & Insights',
  '/settings': 'Account & Preferences',
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const location = useLocation();

  const currentTitle = titlesMap[location.pathname] || 'Personal Finance';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddModal={() => setIsAddTxOpen(true)}
          title={currentTitle}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
