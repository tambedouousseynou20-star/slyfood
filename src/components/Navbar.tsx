import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { auth } from '../firebase';
import { LogOut, User, MapPin, Search, Menu as MenuIcon, X, ShoppingBag, Bell, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isRestaurant } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.discover'), path: '/discover' },
    { name: t('cat.restaurants'), path: '/discover?category=restaurant' },
    { name: t('cat.glaciers'), path: '/discover?category=glacier' },
    { name: t('cat.cafes'), path: '/discover?category=cafe' },
    { name: t('cat.snacks'), path: '/discover?category=snack' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                SalyFood
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 text-gray-500 hover:text-emerald-600 flex items-center gap-1"
              >
                <Globe size={20} />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setLanguage('fr'); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${language === 'fr' ? 'text-emerald-600 font-bold' : 'text-gray-600'}`}
                    >
                      Français
                    </button>
                    <button 
                      onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${language === 'en' ? 'text-emerald-600 font-bold' : 'text-gray-600'}`}
                    >
                      English
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-500 hover:text-emerald-600 relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-semibold text-sm">{t('nav.notifications')}</span>
                          <span className="text-xs text-gray-500">{unreadCount} {t('nav.unread')}</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => {
                                  markAsRead(n.id);
                                  setShowNotifications(false);
                                }}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-emerald-50/50' : ''}`}
                              >
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                              {t('nav.no_notifications')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isRestaurant && (
                  <Link to="/restaurant-dashboard" className="text-sm font-medium text-emerald-600">
                    {t('nav.my_restaurant')}
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin-dashboard" className="text-sm font-medium text-emerald-600">
                    {t('nav.admin')}
                  </Link>
                )}
                <Link to="/profile" className="p-2 text-gray-500 hover:text-emerald-600">
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/login?signup=true"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-500 hover:text-emerald-600"
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-50 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-600"
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 px-3 py-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/login?signup=true"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white"
                    >
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
