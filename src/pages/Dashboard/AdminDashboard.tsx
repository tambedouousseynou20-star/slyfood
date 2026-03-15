import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Business, UserProfile } from '../../types';
import { 
  Users, Store, ShieldCheck, BarChart3, Check, X, 
  TrendingUp, AlertCircle, Search, Filter 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approvals' | 'businesses' | 'users' | 'stats'>('approvals');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const busSnap = await getDocs(collection(db, 'businesses'));
        setBusinesses(busSnap.docs.map(d => ({ id: d.id, ...d.data() } as Business)));

        const userSnap = await getDocs(collection(db, 'users'));
        setUsers(userSnap.docs.map(d => ({ ...d.data() } as UserProfile)));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'businesses', id), { status });
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const stats = [
    { label: t('admin.users'), value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('admin.establishments'), value: businesses.length, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('admin.pending_approvals'), value: businesses.filter(b => b.status === 'pending').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t('admin.platform_revenue'), value: '150k CFA', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const chartData = [
    { name: t('cat.restaurants'), count: businesses.filter(b => b.category === 'restaurant').length },
    { name: t('cat.glaciers'), count: businesses.filter(b => b.category === 'glacier').length },
    { name: t('cat.cafes'), count: businesses.filter(b => b.category === 'cafe').length },
    { name: t('cat.snacks'), count: businesses.filter(b => b.category === 'snack').length },
  ];

  const COLORS = ['#059669', '#db2777', '#d97706', '#ca8a04'];

  if (loading) return <div className="p-20 text-center">{t('admin.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{t('admin.title')}</h1>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'approvals' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t('admin.approvals')}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'stats' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t('admin.stats')}
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'businesses' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t('admin.establishments')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.approval_requests')}</h2>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.establishments')}</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('discover.category')}</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('discover.city')}</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.status')}</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {businesses.filter(b => b.status === 'pending').map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={b.photos[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-900">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600 capitalize">{b.category}</td>
                    <td className="px-8 py-6 text-sm text-gray-600">{b.city}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-full">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(b.id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleApprove(b.id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {businesses.filter(b => b.status === 'pending').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 italic">
                      {t('admin.no_pending')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8">{t('admin.distribution')}</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8">{t('admin.latest_registered')}</h3>
            <div className="space-y-4">
              {businesses.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-100">
                      <img src={b.photos[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{b.category} • {b.city}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
