import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Business, MenuItem, Order, Reservation } from '../../types';
import { 
  LayoutDashboard, Utensils, ShoppingBag, Calendar, Settings, 
  Plus, Edit, Trash2, Check, X, Clock, QrCode as QrIcon 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../../context/LanguageContext';

const RestaurantDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'reservations' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, category: '' });

  const dateLocale = language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (!profile) return;

    const fetchBusiness = async () => {
      const q = query(collection(db, 'businesses'), where('ownerId', '==', profile.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const busData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Business;
        setBusiness(busData);
        
        // Fetch menu
        const menuSnap = await getDocs(collection(db, 'businesses', busData.id, 'menu'));
        setMenu(menuSnap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));

        // Real-time orders
        const ordersUnsub = onSnapshot(
          query(collection(db, 'orders'), where('businessId', '==', busData.id)),
          (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
        );

        // Real-time reservations
        const resUnsub = onSnapshot(
          query(collection(db, 'reservations'), where('businessId', '==', busData.id)),
          (s) => setReservations(s.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)))
        );

        setLoading(false);
        return () => {
          ordersUnsub();
          resUnsub();
        };
      } else {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [profile]);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const handleUpdateResStatus = async (resId: string, status: Reservation['status']) => {
    await updateDoc(doc(db, 'reservations', resId), { status });
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    
    await addDoc(collection(db, 'businesses', business.id, 'menu'), {
      ...newItem,
      businessId: business.id,
      available: true
    });
    
    setShowAddMenu(false);
    setNewItem({ name: '', description: '', price: 0, category: '' });
    // Refresh menu
    const menuSnap = await getDocs(collection(db, 'businesses', business.id, 'menu'));
    setMenu(menuSnap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
  };

  if (loading) return <div className="p-20 text-center">{t('restaurant.loading')}</div>;
  if (!business) return <div className="p-20 text-center">{t('restaurant.no_business')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} /> {t('restaurant.overview')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} /> {t('restaurant.orders')}
            </div>
            {orders.filter(o => o.status === 'sent').length > 0 && (
              <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-full text-[10px]">
                {orders.filter(o => o.status === 'sent').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'reservations' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Calendar size={20} /> {t('restaurant.reservations')}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'menu' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Utensils size={20} /> {t('restaurant.menu')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} /> {t('restaurant.settings')}
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('restaurant.orders_today')}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{orders.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('restaurant.revenue')}</p>
                  <p className="text-4xl font-bold text-emerald-600 mt-2">
                    {orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('restaurant.avg_rating')}</p>
                  <p className="text-4xl font-bold text-amber-500 mt-2">{business.rating}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{t('restaurant.qr_title')}</h3>
                  <button className="text-emerald-600 font-bold text-sm hover:underline">{t('restaurant.download')}</button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <QRCodeSVG 
                      value={`${window.location.origin}/business/${business.id}`} 
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <div className="max-w-md space-y-4">
                    <p className="text-gray-600">
                      {t('restaurant.qr_desc')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                      <QrIcon size={18} />
                      <span>{window.location.origin}/business/{business.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">{t('restaurant.order_mgmt')}</h3>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          order.status === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{language === 'fr' ? "Commande" : "Order"} #{order.id.slice(-6)}</p>
                          <p className="text-xs text-gray-500">{order.items.length} {t('restaurant.items')} • {order.total} CFA</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.type}</p>
                          <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'HH:mm')}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {order.status === 'sent' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                            >
                              {t('restaurant.accept')}
                            </button>
                          )}
                          {order.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700"
                            >
                              {t('restaurant.prepare')}
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                              className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700"
                            >
                              {t('restaurant.ready')}
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black"
                            >
                              {t('restaurant.delivered')}
                            </button>
                          )}
                          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500">{t('restaurant.no_orders')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">{t('restaurant.menu_mgmt')}</h3>
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={20} /> {t('restaurant.add_item')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menu.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-6 group">
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                          <span className="font-bold text-emerald-600">{item.price} CFA</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showAddMenu && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMenu(false)} />
                  <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('restaurant.add_item')}</h3>
                    <form onSubmit={handleAddMenuItem} className="space-y-4">
                      <input
                        type="text"
                        placeholder={t('restaurant.dish_name')}
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                      <textarea
                        placeholder="Description"
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-24"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder={t('restaurant.price_cfa')}
                          required
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                          value={newItem.price || ''}
                          onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                        />
                        <input
                          type="text"
                          placeholder={t('restaurant.category')}
                          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors mt-4"
                      >
                        {t('restaurant.add_to_menu')}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">{t('restaurant.table_res')}</h3>
              <div className="space-y-4">
                {reservations.length > 0 ? (
                  reservations.map(res => (
                    <div key={res.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t('restaurant.table_for')} {res.guests} {t('restaurant.people')}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(res.date), 'PPp', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {res.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateResStatus(res.id, 'confirmed')}
                              className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 flex items-center gap-1"
                            >
                              <Check size={14} /> {t('restaurant.confirm')}
                            </button>
                            <button
                              onClick={() => handleUpdateResStatus(res.id, 'cancelled')}
                              className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 flex items-center gap-1"
                            >
                              <X size={14} /> {t('restaurant.refuse')}
                            </button>
                          </>
                        )}
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                          res.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {res.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500">{t('restaurant.no_reservations')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
