
import React from 'react';
import { Screen } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatsMenu: React.FC<{ navigateTo: (screen: Screen) => void; }> = ({ navigateTo }) => {
  const { t, stats } = useAppContext();

  const winLossData = [
    { name: t('statsMenu.wins'), value: stats.won, fill: '#4ade80' },
    { name: t('statsMenu.losses'), value: stats.lost, fill: '#f87171' },
    { name: t('statsMenu.draws'), value: stats.drawn, fill: '#60a5fa' },
  ];

  const openingsData = Object.entries(stats.openings)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
    
  const COLORS = ['#c8a464', '#a68b5a', '#8f774d', '#786440'];

  return (
    <Card className="w-full max-w-2xl">
      <h2 className="text-3xl font-bold text-center text-brand-accent mb-6">{t('statsMenu.title')}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
        <div><p className="text-2xl font-bold">{stats.played}</p><p className="text-brand-text-dim">{t('statsMenu.totalGames')}</p></div>
        <div><p className="text-2xl font-bold text-green-400">{stats.won}</p><p className="text-brand-text-dim">{t('statsMenu.wins')}</p></div>
        <div><p className="text-2xl font-bold text-red-400">{stats.lost}</p><p className="text-brand-text-dim">{t('statsMenu.losses')}</p></div>
        <div><p className="text-2xl font-bold text-blue-400">{stats.drawn}</p><p className="text-brand-text-dim">{t('statsMenu.draws')}</p></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
        <div>
          <h3 className="text-lg font-bold text-center mb-2">{t('statsMenu.winLossRatio')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                 {winLossData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip wrapperStyle={{ backgroundColor: '#2c2c2c' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-lg font-bold text-center mb-2">{t('statsMenu.mostUsedOpenings')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={openingsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={120} stroke="#a0a0a0" tick={{fontSize: 12}}/>
              <Tooltip wrapperStyle={{ backgroundColor: '#2c2c2c' }} cursor={{fill: 'rgba(200, 164, 100, 0.1)'}}/>
              <Bar dataKey="value" barSize={20}>
                 {openingsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={() => navigateTo('main')} variant="secondary">{t('common.back')}</Button>
      </div>
    </Card>
  );
};

export default StatsMenu;
