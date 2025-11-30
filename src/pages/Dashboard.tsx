import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { products, sales } = useApp();

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const totalStockValue = products.reduce((sum, product) => {
    return sum + (product.stockQuantity * product.wholesalePrice);
  }, 0);

  const lowStockProducts = products.filter(p => p.stockQuantity < 20);

  const stats = [
    {
      title: 'Ventes Aujourd\'hui',
      value: `${todayRevenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: `${todaySales.length} transaction(s)`
    },
    {
      title: 'Valeur du Stock',
      value: `${totalStockValue.toLocaleString()} FCFA`,
      icon: Package,
      color: 'bg-blue-500',
      description: `${products.length} produits`
    },
    {
      title: 'Ventes Totales',
      value: sales.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Toutes périodes'
    },
    {
      title: 'Alertes Stock Faible',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Produits < 20 unités'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Produits en Stock Faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Tous les stocks sont au niveau normal</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600 dark:text-orange-400">{product.stockQuantity} {product.unit}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Dernières Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucune vente enregistrée</p>
            ) : (
              <div className="space-y-3">
                {sales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{sale.customerName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {sale.customerType === 'gros' ? 'Gros' : 'Détail'} - {sale.items.length} article(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">{sale.total.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
