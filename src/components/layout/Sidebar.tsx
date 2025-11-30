import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, ShoppingBag, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'pos', label: 'Point de Vente', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventaire', icon: Package },
  { id: 'procurement', label: 'Approvisionnement', icon: ShoppingBag },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'reports', label: 'Rapports', icon: FileText },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'partner-tracking', label: 'Suivi Partenaires', icon: Users },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <aside className={cn(
      "w-64 bg-gradient-to-b from-blue-900 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-40 transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 border-b border-blue-700 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/Blue Minimalist Real Estate Logo copy copy.png"
            alt="BATIFACILE Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:bg-blue-800 p-2 rounded"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    currentPage === item.id
                      ? "bg-white text-blue-900 shadow-lg"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-700">
        <div className="text-xs text-blue-200 text-center">
          <p>© 2024 BATIFACILE</p>
          <p className="mt-1">Construire - Bâtir - Durer</p>
        </div>
      </div>
    </aside>
  );
}
