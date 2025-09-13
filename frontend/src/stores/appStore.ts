import { create } from 'zustand';
import type { AppState, Notification } from '../types';

interface AppStore extends AppState {
  // Actions pour l'état global
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions pour les notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions pour l'utilisateur
  setUser: (user: AppState['user']) => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // État initial
  user: null,
  notifications: [],
  isLoading: false,
  error: null,

  // Actions pour l'état global
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),

  setError: (error: string | null) => 
    set({ error }),

  // Actions pour les notifications
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markNotificationAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    })),

  clearAllNotifications: () =>
    set({ notifications: [] }),

  // Actions pour l'utilisateur
  setUser: (user) => set({ user }),

  logout: () => set({ user: null, notifications: [] }),
}));

// Hook pour les notifications non lues
export const useUnreadNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  return notifications.filter((notif) => !notif.read);
};

// Hook pour ajouter des notifications facilement
export const useNotifications = () => {
  const addNotification = useAppStore((state) => state.addNotification);
  
  return {
    addSuccess: (title: string, message: string) =>
      addNotification({ type: 'success', title, message }),
    
    addError: (title: string, message: string) =>
      addNotification({ type: 'error', title, message }),
    
    addWarning: (title: string, message: string) =>
      addNotification({ type: 'warning', title, message }),
    
    addInfo: (title: string, message: string) =>
      addNotification({ type: 'info', title, message }),
  };
};
