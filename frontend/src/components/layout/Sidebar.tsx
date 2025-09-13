import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Menu, 
  X,
  Bell,
  Settings,
  Tag
} from 'lucide-react';
import { useUnreadNotifications } from '../../stores/appStore';
import { Badge } from '../ui';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const unreadNotifications = useUnreadNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Sidebar: Component rendered, current location:', location.pathname);
  console.log('Sidebar: navigate function available:', !!navigate);

  // Détection de la taille d'écran pour forcer le comportement desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false); // Fermer le menu mobile si on passe en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Tâches',
      href: '/tasks',
      icon: CheckSquare,
      description: 'Gestion complète'
    },
    {
      name: 'Meeting',
      href: '/meetings',
      icon: Bell,
      description: 'Réunions'
    }
  ];

  const handleNavigation = (href: string) => {
    console.log('Sidebar: handleNavigation called with href:', href);
    console.log('Sidebar: Current location:', window.location.href);
    console.log('Sidebar: navigate function:', typeof navigate);

    try {
      navigate(href);
      console.log('Sidebar: navigate() called successfully');
    } catch (error) {
      console.error('Sidebar: Error during navigation:', error);
    }

    if (!isDesktop) {
      setIsMobileOpen(false); // Fermer le menu mobile après navigation
    }
  };

  const NavItem: React.FC<{
    item: typeof navigationItems[0];
    isCollapsed: boolean;
  }> = ({ item, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === item.href || (item.href === '/' && location.pathname === '/');

    return (
      <button
        onClick={() => {
          console.log('Sidebar: Button clicked for item:', item.name, 'href:', item.href);
          handleNavigation(item.href);
        }}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left ${
          isActive
            ? 'bg-red-600 text-white shadow-lg border border-red-700'
            : 'text-gray-800 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200'
        }`}
      >
        <item.icon size={20} />
        {!isCollapsed && (
          <div className="ml-3">
            <div className="text-sm font-semibold">{item.name}</div>
            <div className="text-xs text-gray-600 font-medium">{item.description}</div>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Bouton menu mobile - SEULEMENT VISIBLE SUR MOBILE */}
      {!isDesktop && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      )}

      {/* Overlay mobile */}
      {!isDesktop && isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - TOUJOURS VISIBLE SUR DESKTOP */}
      <div className={`
        ${!isDesktop ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${isDesktop ? 'static' : 'fixed'} inset-y-0 left-0 z-40 
        ${isCollapsed && isDesktop ? 'w-20' : 'w-72'}
        bg-white border-r border-gray-200 ${!isDesktop ? 'shadow-xl' : 'shadow-none'}
        flex flex-col transition-all duration-300 ease-in-out
      `}>
        
        {/* Header Sidebar - DESIGN ROUGE SUR BLANC */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-red-700">AI Tasks</h2>
              <p className="text-sm text-gray-600 font-medium">Extraction System</p>
            </div>
          )}
          
          {/* Bouton collapse - SEULEMENT DESKTOP */}
          {isDesktop && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Navigation - DESIGN ROUGE */}
        <nav className="flex-1 px-4 py-6 space-y-3">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              isCollapsed={isCollapsed && isDesktop} 
            />
          ))}
        </nav>

        {/* Notifications - DESIGN SYSTEM */}
        {(!isCollapsed || !isDesktop) && unreadNotifications.length > 0 && (
          <div className="px-4 py-3 border-t border-secondary-200">
            <div className="flex items-center justify-between text-sm bg-primary-50 p-3 rounded-lg border border-primary-200">
              <div className="flex items-center">
                <Bell size={16} className="text-primary-600" />
                <span className="ml-2 font-medium text-primary-700">
                  Notifications
                </span>
              </div>
              <Badge variant="primary" size="sm">
                {unreadNotifications.length}
              </Badge>
            </div>
          </div>
        )}

        {/* Footer - DESIGN MODERNE */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-red-50 to-white">
          {(!isCollapsed || !isDesktop) ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border border-red-100">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">Utilisateur</div>
                <div className="text-xs text-gray-600 truncate">user@example.com</div>
              </div>
              <Settings size={18} className="text-gray-500 hover:text-red-600 transition-colors" />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-md">
                <span className="text-sm font-bold text-white">U</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
