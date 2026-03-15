import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Business, MenuItem, Order, Reservation, Review } from '../types';
import { MapPin, Phone, Clock, Star, Info, ShoppingCart, Calendar, ChevronRight, Plus, Minus, X, ShoppingBag, Truck, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const BusinessProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ item: MenuItem; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  
  // Reservation form
  const [resDate, setResDate] = useState('');
  const [resGuests, setResGuests] = useState(2);

  // Review form
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const busDoc = await getDoc(doc(db, 'businesses', id));
        if (busDoc.exists()) {
          setBusiness({ id: busDoc.id, ...busDoc.data() } as Business);
        }
        
        const menuSnap = await getDocs(collection(db, 'businesses', id, 'menu'));
        setMenu(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time reviews
    if (id) {
      const q = query(collection(db, 'businesses', id, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      });
      return () => unsubscribe();
    }
  }, [id]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const handleOrder = async (type: 'pickup' | 'delivery') => {
    if (!user || !business) return;
    
    try {
      const order: Partial<Order> = {
        customerId: user.uid,
        businessId: business.id,
        items: cart.map(i => ({
          id: i.item.id,
          name: i.item.name,
          price: i.item.price,
          quantity: i.quantity
        })),
        total: cartTotal + (type === 'delivery' ? business.deliveryFee : 0),
        deliveryFee: type === 'delivery' ? business.deliveryFee : 0,
        type,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'orders'), order);
      
      // Notify restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: business.ownerId,
        title: t('profile.new_order'),
        message: t('profile.new_order_msg').replace('{name}', profile?.displayName || (language === 'fr' ? 'un client' : 'a customer')),
        type: 'order',
        read: false,
        createdAt: new Date().toISOString()
      });

      alert(t('profile.order_success'));
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handleReservation = async () => {
    if (!user || !business) return;
    
    try {
      const reservation: Partial<Reservation> = {
        customerId: user.uid,
        businessId: business.id,
        date: resDate,
        guests: resGuests,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'reservations'), reservation);

      // Notify restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: business.ownerId,
        title: t('profile.new_res'),
        message: t('profile.new_res_msg').replace('{name}', profile?.displayName || (language === 'fr' ? 'Un client' : 'A customer')).replace('{guests}', resGuests.toString()),
        type: 'reservation',
        read: false,
        createdAt: new Date().toISOString()
      });

      alert(t('profile.res_success'));
      setShowReservation(false);
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };

  const submitReview = async () => {
    if (!user || !business || !newReview.comment) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'businesses', business.id, 'reviews'), {
        customerId: user.uid,
        customerName: profile?.displayName || 'Client',
        businessId: business.id,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: new Date().toISOString()
      });
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-20 text-center">{t('profile.loading')}</div>;
  if (!business) return <div className="p-20 text-center">{t('profile.not_found')}</div>;

  return (
    <div className="pb-20">
      {/* Hero Header */}
      <div className="relative h-[400px]">
        <img
          src={business.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80'}
          alt={business.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {business.category}
                </span>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {business.rating} ({business.reviewCount} {t('profile.reviews').toLowerCase()})
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">{business.name}</h1>
              <div className="flex items-center gap-4 mt-4 text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  <span>{business.city}, {business.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={18} />
                  <span>{business.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowReservation(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Calendar size={20} /> {t('profile.reserve_table')}
              </button>
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu');
                  menuSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <ShoppingCart size={20} /> {t('restaurant.orders')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info & Menu */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('profile.about')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {business.description}
            </p>
          </section>

          <section id="menu">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('profile.the_menu')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menu.length > 0 ? (
                menu.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.photo || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-emerald-600">{item.price} CFA</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-2 bg-gray-50 text-gray-900 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-gray-500 italic">
                  {t('profile.no_menu')}
                </p>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section id="reviews">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('profile.reviews')}</h2>
            
            {user && (
              <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                <h4 className="font-bold text-gray-900 mb-4">{t('profile.leave_review')}</h4>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star 
                        size={24} 
                        className={star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder={t('profile.share_exp')}
                  className="w-full p-4 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 mb-4 min-h-[100px]"
                />
                <button
                  disabled={submittingReview || !newReview.comment}
                  onClick={submitReview}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReview ? t('profile.sending') : <><Send size={18} /> {t('profile.publish')}</>}
                </button>
              </div>
            )}

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{review.customerName}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">{t('profile.no_reviews')}</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Info */}
        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-xl">{t('profile.info')}</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="font-bold text-sm text-gray-900">{t('profile.opening_hours')}</p>
                  <div className="mt-1 space-y-1">
                    {Object.entries(business.openingHours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-xs text-gray-500">
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="font-bold text-sm text-gray-900">Services</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.deliveryAvailable && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md uppercase">{t('profile.delivery')}</span>
                    )}
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md uppercase">{t('profile.dine_in')}</span>
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md uppercase">{t('profile.takeaway')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Preview */}
          {cart.length > 0 && (
            <div className="bg-emerald-600 text-white p-8 rounded-[32px] shadow-xl space-y-6 sticky top-24">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">{t('profile.your_cart')}</h3>
                <ShoppingBag size={24} />
              </div>
              
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(i => (
                  <div key={i.item.id} className="flex justify-between items-center gap-4">
                    <div className="flex-grow">
                      <p className="font-bold text-sm">{i.item.name}</p>
                      <p className="text-xs text-emerald-200">{i.item.price} CFA x {i.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(i.item.id, -1)} className="p-1 hover:bg-white/20 rounded"><Minus size={14} /></button>
                      <span className="text-sm font-bold">{i.quantity}</span>
                      <button onClick={() => updateQuantity(i.item.id, 1)} className="p-1 hover:bg-white/20 rounded"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold">{cartTotal} CFA</span>
                </div>
                <button
                  onClick={() => setShowCart(true)}
                  className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  {t('profile.order_now')}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">{t('profile.checkout')}</h3>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">{t('profile.pickup_method')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleOrder('pickup')}
                      className="p-6 border-2 border-emerald-600 bg-emerald-50 rounded-2xl text-center group"
                    >
                      <ShoppingBag className="mx-auto mb-2 text-emerald-600" size={24} />
                      <span className="block font-bold text-emerald-600">{t('profile.takeaway')}</span>
                      <span className="text-xs text-emerald-400">{t('profile.free')}</span>
                    </button>
                    <button
                      disabled={!business.deliveryAvailable}
                      onClick={() => handleOrder('delivery')}
                      className={`p-6 border-2 rounded-2xl text-center group transition-all ${
                        business.deliveryAvailable 
                          ? 'border-gray-100 hover:border-emerald-600 hover:bg-emerald-50' 
                          : 'opacity-50 cursor-not-allowed border-gray-100'
                      }`}
                    >
                      <Truck className="mx-auto mb-2 text-gray-400 group-hover:text-emerald-600" size={24} />
                      <span className="block font-bold text-gray-900 group-hover:text-emerald-600">{t('profile.delivery')}</span>
                      <span className="text-xs text-gray-400">{business.deliveryFee} CFA</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">{t('profile.subtotal')}</span>
                    <span className="font-bold">{cartTotal} CFA</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-emerald-600 font-bold">{cartTotal} CFA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showReservation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReservation(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.reserve_table')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('profile.date_time')}</label>
                  <input
                    type="datetime-local"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('profile.num_people')}</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setResGuests(Math.max(1, resGuests - 1))} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"><Minus size={20} /></button>
                    <span className="text-xl font-bold w-8 text-center">{resGuests}</span>
                    <button onClick={() => setResGuests(resGuests + 1)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"><Plus size={20} /></button>
                  </div>
                </div>

                <button
                  onClick={handleReservation}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors mt-4"
                >
                  {t('profile.confirm_request')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessProfile;
