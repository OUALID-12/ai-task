import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';


const Layout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('Layout: Navigation to', location.pathname);
    console.log('Layout: Location object:', location);
  }, [location.pathname, location]);
  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Sidebar - TOUJOURS VISIBLE SUR DESKTOP */}
      <Sidebar />
      
      {/* Contenu principal - avec scroll activé */}
      <main className="flex-1 flex flex-col overflow-y-auto">{/* Conteneur avec scroll vertical */}
        {/* Header desktop avec breadcrumbs */}
        <header className="bg-white border-b border-secondary-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10">{/* Header sticky */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-secondary-900 hidden lg:block">
                AI Task Extraction System
              </h1>
              <div className="text-sm text-secondary-500 lg:mt-1">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            

          </div>
          
          {/* Breadcrumbs */}
          <Breadcrumbs />
        </header>
        
        {/* Contenu pleine largeur pour Dashboard31 - avec scroll activé */}
        <div className="flex-1 min-h-0">
          <div className="p-6">
            {/* Le contenu des pages prend toute la largeur disponible */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
