import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, Reservation } from '../types';
import { ShoppingBag, Calendar, Settings, User as UserIcon, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../context/LanguageContext';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      try {
        const ordersQ = query(
          collection(db, 'orders'),
          where('customerId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
        const ordersSnap = await getDocs(ordersQ);
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

        const resQ = query(
          collection(db, 'reservations'),
          where('customerId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
        const resSnap = await getDocs(resQ);
        setReservations(resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (!profile) return <div className="p-20 text-center">{t('profile.login_prompt')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-emerald-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
              {profile.role}
            </div>
          </div>

          <nav className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                {t('profile.orders')}
              </div>
              <ChevronRight size={18} />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                {t('profile.reservations')}
              </div>
              <ChevronRight size={18} />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={20} />
                {t('profile.settings')}
              </div>
              <ChevronRight size={18} />
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">{t('profile.order_history')}</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t('profile.order_id')} #{order.id.slice(-6)}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), 'PPp', { locale: language === 'fr' ? fr : enUS })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{order.total} CFA</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{order.type}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                <p className="text-gray-500">{t('profile.no_orders')}</p>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">{t('profile.your_reservations')}</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.map(res => (
                  <div key={res.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Calendar size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t('profile.reservation_for')} {res.guests} pers.</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(res.date), 'PPp', { locale: language === 'fr' ? fr : enUS })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      res.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {res.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                <p className="text-gray-500">{t('profile.no_reservations')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
