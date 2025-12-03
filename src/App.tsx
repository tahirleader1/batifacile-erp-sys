import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Procurement } from './pages/Procurement';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { PartnerTracking } from './pages/PartnerTracking';
import { CustomersSimple } from './pages/CustomersSimple';
import { useAuth } from './contexts/AuthContext';

type Page = 'dashboard' | 'pos' | 'inventory' | 'procurement' | 'reports' | 'settings' | 'partner-tracking' | 'customers';

const pageConfig = {
  dashboard: { title: 'Tableau de Bord', component: Dashboard },
  pos: { title: 'Point de Vente', component: POS },
  inventory: { title: 'Inventaire', component: Inventory },
  procurement: { title: 'Approvisionnement', component: Procurement },
  customers: { title: 'Clients', component: CustomersSimple },
  reports: { title: 'Rapports', component: Reports },
  settings: { title: 'Paramètres', component: Settings },
  'partner-tracking': { title: 'Suivi Partenaires', component: PartnerTracking },
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  const PageComponent = pageConfig[currentPage].component;

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}

        <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
          <Header
            title={pageConfig[currentPage].title}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
            <PageComponent />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
