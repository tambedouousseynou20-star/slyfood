import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useLanguage } from '../context/LanguageContext';

const Layout: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                SalyFood
              </span>
              <p className="mt-4 text-gray-500 max-w-xs">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('footer.platform')}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/about" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.about')}</Link></li>
                <li><Link to="/discover" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.restaurants')}</Link></li>
                <li><Link to="/login?signup=true&role=restaurant" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.partnership')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('footer.support')}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/help" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.help')}</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.contact')}</Link></li>
                <li><Link to="/terms" className="text-gray-500 hover:text-emerald-600 text-sm">{t('footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 SalyFood. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-gray-400">Saly, Sénégal</span>
              <span className="text-xs text-gray-400">Mbour, Sénégal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
