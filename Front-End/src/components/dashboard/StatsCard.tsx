
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color = "text-gray-600" }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
};
