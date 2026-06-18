import React from 'react';

const StatCard = ({ title, value, icon: Icon, gradient = 'from-brand-500 to-indigo-600', description }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      {/* Decorative gradient sphere */}
      <div className={`absolute -right-10 -top-10 w-28 h-28 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`}></div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="mt-2 text-3xl md:text-4xl font-extrabold font-outfit text-white tracking-tight">
            {typeof value === 'number' && isNaN(value) ? '...' : value}
          </h3>
          {description && (
            <p className="mt-1.5 text-xs text-slate-500 font-medium">{description}</p>
          )}
        </div>
        
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-indigo-500/10`}>
          <Icon size={24} className="stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
