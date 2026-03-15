import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Business, BusinessCategory, City } from '../types';
import BusinessCard from '../components/BusinessCard';
import { Filter, Map as MapIcon, List, Search, SlidersHorizontal, ChevronDown, Utensils, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Discover: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const categoryFilter = searchParams.get('category') as BusinessCategory | null;
  const cityFilter = searchParams.get('city') as City | null;
  const priceFilter = searchParams.get('price');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'businesses'), where('status', '==', 'approved'));
        
        if (categoryFilter) {
          q = query(q, where('category', '==', categoryFilter));
        }
        if (cityFilter) {
          q = query(q, where('city', '==', cityFilter));
        }

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        
        if (priceFilter) {
          results = results.filter(b => b.priceRange === priceFilter);
        }

        setBusinesses(results);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryFilter, cityFilter, priceFilter]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{t('discover.title')}</h1>
          <p className="text-gray-500 mt-2">{t('discover.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <List size={18} /> {t('discover.list')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'map' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <MapIcon size={18} /> {t('discover.map')}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-600" />
                {t('discover.filters')}
              </h3>
              {(categoryFilter || cityFilter || priceFilter) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  {t('discover.reset')}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">{t('discover.category')}</label>
                <div className="space-y-2">
                  {['restaurant', 'glacier', 'cafe', 'snack'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', categoryFilter === cat ? null : cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        categoryFilter === cat ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t(`cat.${cat}s`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">{t('discover.city')}</label>
                <div className="space-y-2">
                  {['Saly', 'Mbour'].map(city => (
                    <button
                      key={city}
                      onClick={() => updateFilter('city', cityFilter === city ? null : city)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        cityFilter === city ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">{t('discover.price')}</label>
                <div className="flex gap-2">
                  {['$', '$$', '$$$', '$$$$'].map(price => (
                    <button
                      key={price}
                      onClick={() => updateFilter('price', priceFilter === price ? null : price)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        priceFilter === price ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          {viewMode === 'list' ? (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl aspect-[4/5] animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {businesses.map(business => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-32 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('discover.no_results')}</h3>
                <p className="text-gray-500 mt-2">{t('discover.no_results_subtitle')}</p>
              </div>
            )
          ) : (
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm h-[600px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapIcon size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">{t('discover.interactive_map')}</p>
                  <p className="text-xs text-gray-400 mt-2">{t('discover.visualize_all')}</p>
                </div>
              </div>
              
              {/* Mock markers */}
              {businesses.map((b, i) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBusiness(b)}
                  className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 ${selectedBusiness?.id === b.id ? 'bg-emerald-600 scale-125' : 'bg-emerald-500'}`}
                  style={{
                    top: `${30 + (i * 15) % 40}%`,
                    left: `${20 + (i * 20) % 60}%`
                  }}
                >
                  <Utensils size={18} className="text-white" />
                </div>
              ))}

              {/* Business Info Popup */}
              <AnimatePresence>
                {selectedBusiness && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-4 z-20 flex gap-4 border border-gray-100"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={selectedBusiness.photos[0]} alt={selectedBusiness.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">{selectedBusiness.name}</h4>
                        <button onClick={() => setSelectedBusiness(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t(`cat.${selectedBusiness.category}s`)} • {selectedBusiness.city}</p>
                      <div className="flex items-center gap-1 text-amber-500 mt-2">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{selectedBusiness.rating}</span>
                      </div>
                      <Link to={`/business/${selectedBusiness.id}`} className="block mt-3 text-xs font-bold text-emerald-600 hover:underline">
                        {t('discover.view_profile')}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
