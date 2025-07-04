
import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { DashboardHeader } from '../header/DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage }) => {
  return (
    <div className="min-h-screen flex w-full bg-gray-100">
      <Sidebar currentPage={currentPage} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
