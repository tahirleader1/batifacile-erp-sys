import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customers, sales } = useApp();

  const customer = customers.find(c => c.id === customerId);

  if (!customer) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="mt-6 text-center text-gray-500">
          Client non trouvé
        </div>
      </div>
    );
  }

  const unpaidSales = sales.filter(s =>
    s.customerId === customer.id &&
    (s.paymentStatus === 'partial' || s.paymentStatus === 'unpaid')
  );

  const formatCurrency = (amount: number) => amount.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{customer.name}</h1>
              {customer.company && (
                <p className="text-gray-600 dark:text-gray-400 mb-1">{customer.company}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tél: {customer.phone || 'Non renseigné'}
              </p>
            </div>
            <Badge className={`text-white ${
              customer.type === 'gros' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              {customer.type === 'gros' ? 'CLIENT GROS' : 'CLIENT DÉTAIL'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Achats</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(customer.totalPurchases)} FCFA
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Payé</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(customer.totalPaid)} FCFA
              </p>
            </div>

            <div className={`rounded-lg p-6 border-l-4 ${
              customer.balance > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`h-5 w-5 ${
                  customer.balance > 0 ? 'text-red-600' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Reste à Payer</p>
              </div>
              <p className={`text-3xl font-bold ${
                customer.balance > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {formatCurrency(customer.balance)} FCFA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {unpaidSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ventes Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">N° Reçu</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Montant Total</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Déjà Payé</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Reste à Payer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {unpaidSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{sale.id}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(sale.total)} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(sale.amountPaid)} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-bold">
                        {formatCurrency(sale.amountDue)} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold">
                  <tr>
                    <td colSpan={2} className="px-4 py-3">TOTAL:</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(unpaidSales.reduce((sum, s) => sum + s.total, 0))} FCFA
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatCurrency(unpaidSales.reduce((sum, s) => sum + s.amountPaid, 0))} FCFA
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {formatCurrency(unpaidSales.reduce((sum, s) => sum + s.amountDue, 0))} FCFA
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date Paiement</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Méthode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Pour Vente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customer.paymentHistory && customer.paymentHistory.length > 0 ? (
                  customer.paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm">
                        {new Date(payment.date).toLocaleDateString('fr-FR')} {new Date(payment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {formatCurrency(payment.amount)} FCFA
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="capitalize">
                          {payment.method === 'cash' && '💵 Espèces'}
                          {payment.method === 'mobile' && '📱 Mobile Money'}
                          {payment.method === 'bank' && '🏦 Virement'}
                          {payment.method === 'credit' && '📝 Crédit'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{payment.saleReceiptNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Aucun paiement enregistré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
