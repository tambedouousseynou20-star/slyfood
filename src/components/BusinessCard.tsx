import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Truck } from 'lucide-react';
import { Business } from '../types';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
      <Link to={`/business/${business.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={business.photos[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-900">{business.rating}</span>
          </div>
          {business.deliveryAvailable && (
            <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
              <Truck size={12} />
              {t('discover.delivery')}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {business.name}
            </h3>
            <span className="text-xs font-bold text-emerald-600">{business.priceRange} CFA</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <MapPin size={12} />
            <span>{business.city}, {business.address}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {t(`cat.${business.category}s`)}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-[10px] font-medium">
              <Clock size={12} />
              <span>{t('discover.open')}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BusinessCard;
