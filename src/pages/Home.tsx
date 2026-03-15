import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Business } from '../types';
import BusinessCard from '../components/BusinessCard';
import { Search, MapPin, Utensils, Coffee, IceCream, Zap, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('status', '==', 'approved'),
          limit(8)
        );
        const querySnapshot = await getDocs(q);
        const businesses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
        setFeaturedBusinesses(businesses);
      } catch (error) {
        console.error("Error fetching featured businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const categories = [
    { name: t('cat.restaurants'), icon: Utensils, color: 'bg-emerald-100 text-emerald-600', slug: 'restaurant' },
    { name: t('cat.glaciers'), icon: IceCream, color: 'bg-pink-100 text-pink-600', slug: 'glacier' },
    { name: t('cat.cafes'), icon: Coffee, color: 'bg-amber-100 text-amber-600', slug: 'cafe' },
    { name: t('cat.snacks'), icon: Zap, color: 'bg-yellow-100 text-yellow-600', slug: 'snack' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
            alt="Hero"
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {t('hero.title')} <span className="text-emerald-500">Saly & Mbour</span>
            </h1>
            <p className="mt-6 text-xl text-gray-200">
              {t('hero.subtitle')}
            </p>
            
            <div className="mt-10 bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-grow flex items-center px-4 gap-3">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('hero.search_placeholder')}
                  className="w-full py-3 outline-none text-gray-700 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center px-4 gap-3 border-l border-gray-100 hidden md:flex">
                <MapPin className="text-gray-400" size={20} />
                <select className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer">
                  <option>Saly</option>
                  <option>Mbour</option>
                </select>
              </div>
              <Link
                to={`/discover?q=${searchQuery}`}
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {t('hero.search_button')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={`/discover?category=${cat.slug}`}
                className="flex flex-col items-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className={`${cat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <cat.icon size={32} />
                </div>
                <span className="mt-4 font-bold text-gray-900">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Places */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('home.featured')}</h2>
            <p className="text-gray-500 mt-2">{t('home.featured_subtitle')}</p>
          </div>
          <Link to="/discover" className="text-emerald-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            {t('home.view_all')} <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.length > 0 ? (
              featuredBusinesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500">{t('home.no_results')}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Call to Action Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[40px] overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80"
              alt="Restaurant Partner"
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 p-12 lg:p-20 lg:w-3/5">
            <h2 className="text-4xl font-bold text-white leading-tight">
              {t('home.partner_title')}
            </h2>
            <p className="mt-6 text-xl text-gray-400">
              {t('home.partner_subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/login?signup=true&role=restaurant"
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
              >
                {t('home.partner_button')}
              </Link>
              <Link
                to="/partnership"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors"
              >
                {t('home.learn_more')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
