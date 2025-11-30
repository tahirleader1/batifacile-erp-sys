import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, DollarSign, AlertCircle, Plus } from 'lucide-react';
import { Customer, PaymentMethod } from '../types';

export function CustomersSimple() {
  const { customers = [], sales, updateCustomer } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'cash' as PaymentMethod,
    notes: ''
  });

  const formatCurrency = (amount: number) => amount.toLocaleString();

  const handlePaymentSubmit = () => {
    if (!selectedCustomer || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    const paymentAmount = parseFloat(paymentForm.amount);

    if (paymentAmount > selectedCustomer.balance) {
      alert('Le montant du paiement ne peut pas dépasser le solde restant');
      return;
    }

    const newPayment = {
      id: `PAY-${Date.now()}`,
      date: new Date(paymentForm.date).toISOString(),
      customerId: selectedCustomer.id,
      amount: paymentAmount,
      method: paymentForm.method,
      notes: paymentForm.notes || undefined,
      saleReceiptNumber: 'Paiement Direct',
      receivedBy: 'Admin'
    };

    const updatedCustomer = {
      ...selectedCustomer,
      totalPaid: selectedCustomer.totalPaid + paymentAmount,
      balance: selectedCustomer.balance - paymentAmount,
      paymentHistory: [...(selectedCustomer.paymentHistory || []), newPayment]
    };

    updateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);

    setShowPaymentModal(false);
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      method: 'cash',
      notes: ''
    });
  };

  if (selectedCustomer) {
    const unpaidSales = sales.filter(s =>
      s.customerId === selectedCustomer.id &&
      (s.paymentStatus === 'partial' || s.paymentStatus === 'unpaid')
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          {selectedCustomer.balance > 0 && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer Paiement
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedCustomer.name}</h1>
                {selectedCustomer.company && (
                  <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm md:text-base">{selectedCustomer.company}</p>
                )}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Tél: {selectedCustomer.phone || 'Non renseigné'}
                </p>
              </div>
              <Badge className={`text-white text-xs md:text-sm px-3 py-1 ${
                selectedCustomer.type === 'gros' ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {selectedCustomer.type === 'gros' ? 'CLIENT GROS' : 'CLIENT DÉTAIL'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Achats</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {formatCurrency(selectedCustomer.totalPurchases)} FCFA
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Total Payé</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(selectedCustomer.totalPaid)} FCFA
                </p>
              </div>

              <div className={`rounded-lg p-6 border-l-4 ${
                selectedCustomer.balance > 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`h-5 w-5 ${
                    selectedCustomer.balance > 0 ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Reste à Payer</p>
                </div>
                <p className={`text-3xl font-bold ${
                  selectedCustomer.balance > 0 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {formatCurrency(selectedCustomer.balance)} FCFA
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
                  {selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0 ? (
                    selectedCustomer.paymentHistory.map((payment) => (
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

        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un Paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1 text-base h-12"
                />
              </div>

              <div>
                <Label>Montant Payé (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  max={selectedCustomer.balance}
                  step="100"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0"
                  className="mt-1 text-base h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solde restant: {formatCurrency(selectedCustomer.balance)} FCFA
                </p>
              </div>

              <div>
                <Label>Méthode de Paiement</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value: PaymentMethod) => setPaymentForm({ ...paymentForm, method: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Espèces</SelectItem>
                    <SelectItem value="mobile">📱 Mobile Money</SelectItem>
                    <SelectItem value="bank">🏦 Virement</SelectItem>
                    <SelectItem value="check">📝 Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (optionnel)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Notes sur le paiement..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1 h-12 text-base">
                  Annuler
                </Button>
                <Button onClick={handlePaymentSubmit} className="flex-1 h-12 text-base">
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Liste des Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun client enregistré
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total Achats</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total Payé</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Balance</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{customer.name}</p>
                        {customer.company && <p className="text-xs text-gray-500">{customer.company}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm">{customer.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={customer.type === 'gros' ? 'bg-green-600' : 'bg-blue-600'}>
                          {customer.type === 'gros' ? 'Gros' : 'Détail'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(customer.totalPurchases)} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {formatCurrency(customer.totalPaid)} FCFA
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {formatCurrency(customer.balance)} FCFA
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" onClick={() => setSelectedCustomer(customer)}>
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{customer.name}</h3>
                      {customer.company && <p className="text-xs text-gray-500 dark:text-gray-400">{customer.company}</p>}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{customer.phone}</p>
                    </div>
                    <Badge className={`text-xs ${customer.type === 'gros' ? 'bg-green-600' : 'bg-blue-600'}`}>
                      {customer.type === 'gros' ? 'Gros' : 'Détail'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Achats:</span>
                      <span className="font-semibold">{formatCurrency(customer.totalPurchases)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Payé:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(customer.totalPaid)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                      <span className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatCurrency(customer.balance)} FCFA
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-3 py-3" onClick={() => setSelectedCustomer(customer)}>
                    Voir Détails
                  </Button>
                </div>
              ))}
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
