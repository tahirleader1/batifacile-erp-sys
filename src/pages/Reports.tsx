import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

export function Reports() {
  const { sales, products } = useApp();
  const [filterPeriod, setFilterPeriod] = useState('all');

  const filterSalesByPeriod = () => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      switch (filterPeriod) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredSales = filterSalesByPeriod();

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
  const wholesaleSales = filteredSales.filter(s => s.customerType === 'gros').length;
  const retailSales = filteredSales.filter(s => s.customerType === 'détail').length;

  const productSales = products.map(product => {
    const totalSold = filteredSales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.productId === product.id);
      return sum + (item?.quantity || 0);
    }, 0);

    const revenue = filteredSales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.productId === product.id);
      return sum + (item?.total || 0);
    }, 0);

    return {
      ...product,
      totalSold,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Rapports de Vente
            </CardTitle>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute la période</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Revenu Total
            </CardTitle>
            <div className="bg-green-500 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {totalRevenue.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">{filteredSales.length} vente(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Vente Moyenne
            </CardTitle>
            <div className="bg-blue-500 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {averageSale.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-gray-500 mt-1">Par transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Ventes en Gros
            </CardTitle>
            <div className="bg-purple-500 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {wholesaleSales}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSales.length > 0 ? Math.round((wholesaleSales / filteredSales.length) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Ventes au Détail
            </CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {retailSales}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredSales.length > 0 ? Math.round((retailSales / filteredSales.length) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meilleures Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {productSales.filter(p => p.totalSold > 0).length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune vente enregistrée</p>
            ) : (
              <div className="space-y-3">
                {productSales.filter(p => p.totalSold > 0).slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">{product.revenue.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.totalSold} {product.unit} vendus</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune vente enregistrée</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredSales.map(sale => (
                  <div key={sale.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{sale.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sale.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Badge className={sale.customerType === 'gros' ? 'bg-green-600' : 'bg-blue-600'}>
                        {sale.customerType === 'gros' ? 'Gros' : 'Détail'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{sale.items.length} article(s)</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{sale.total.toLocaleString()} FCFA</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">Paiement: {sale.paymentMethod}</p>
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
