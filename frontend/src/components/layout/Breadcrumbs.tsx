import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Palette } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Configuration des pages pour génération automatique
const pageConfig: Record<string, { label: string; icon?: React.ReactNode }> = {
  '/': { label: 'Dashboard', icon: <Home size={16} /> },
  '/tasks': { label: 'Gestion des Tâches' },
  '/meetings': { label: 'Validation des Réunions' },
  '/demo': { label: 'Design System', icon: <Palette size={16} /> },
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const location = useLocation();
  
  // Génération automatique des breadcrumbs si pas fournie
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname);
  
  if (breadcrumbItems.length <= 1) {
    return null; // Pas de breadcrumbs si une seule page
  }

  return (
    <nav 
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={14} className="text-secondary-400 flex-shrink-0" />
            )}
            
            {isLast ? (
              <span className="flex items-center text-secondary-900 font-medium">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href || '/'}
                className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Fonction utilitaire pour générer les breadcrumbs depuis le path
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  // Toujours commencer par Dashboard
  items.push({
    label: pageConfig['/'].label,
    icon: pageConfig['/'].icon,
    href: '/'
  });
  
  // Ajouter la page actuelle si ce n'est pas le dashboard
  if (pathname !== '/') {
    const config = pageConfig[pathname];
    if (config) {
      items.push({
        label: config.label,
        icon: config.icon,
        href: pathname
      });
    }
  }
  
  return items;
}

export default Breadcrumbs;
