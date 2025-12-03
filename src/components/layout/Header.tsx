import { Calendar, User, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme-provider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 lg:px-8 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            <div className="hidden sm:flex items-center gap-2 mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              <span className="capitalize">{today}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-9 w-9 md:h-10 md:w-10"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            )}
          </Button>
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Administrateur</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}
