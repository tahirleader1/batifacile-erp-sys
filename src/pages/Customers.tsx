import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, ArrowLeft, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Customer, PaymentRecord, Sale, PaymentMethod } from '../types';

export function Customers() {
  const { customers = [], addCustomer, updateCustomer, sales, updateSale } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    type: 'détail' as 'détail' | 'gros',
    creditLimit: 0,
    allowCredit: false
  });

  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'cash' as PaymentMethod,
    reference: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomerForm.name,
      phone: newCustomerForm.phone || undefined,
      email: newCustomerForm.email || undefined,
      company: newCustomerForm.company || undefined,
      type: newCustomerForm.type,
      balance: 0,
      totalPurchases: 0,
      totalPaid: 0,
      creditLimit: newCustomerForm.creditLimit,
      allowCredit: newCustomerForm.allowCredit,
      createdDate: new Date().toISOString(),
      paymentHistory: [],
      notes: ''
    };

    addCustomer(customer);
    setShowAddCustomerDialog(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      type: 'détail',
      creditLimit: 0,
      allowCredit: false
    });
  };

  const getUnpaidSales = (customerId: string): Sale[] => {
    return sales.filter(s =>
      s.customerId === customerId &&
      s.paymentStatus !== 'paid'
    );
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      date: paymentForm.date,
      customerId: selectedCustomer.id,
      saleId: selectedSale?.id,
      saleReceiptNumber: selectedSale?.id || 'Paiement Général',
      amount: paymentForm.amount,
      method: paymentForm.method,
      reference: paymentForm.reference || undefined,
      notes: paymentForm.notes || undefined,
      receivedBy: 'Bechir Saleh'
    };

    const updatedCustomer = { ...selectedCustomer };
    updatedCustomer.paymentHistory.push(payment);
    updatedCustomer.totalPaid += payment.amount;
    updatedCustomer.balance -= payment.amount;
    updatedCustomer.lastPaymentDate = payment.date;

    if (selectedSale) {
      const updatedSale = { ...selectedSale };
      updatedSale.amountPaid += payment.amount;
      updatedSale.amountDue -= payment.amount;
      updatedSale.paymentStatus = updatedSale.amountDue === 0 ? 'paid' : 'partial';
      updateSale(updatedSale);
    } else {
      let remainingAmount = payment.amount;
      const unpaidSales = getUnpaidSales(selectedCustomer.id).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (const sale of unpaidSales) {
        if (remainingAmount <= 0) break;

        const amountToApply = Math.min(remainingAmount, sale.amountDue);
        const updatedSale = { ...sale };
        updatedSale.amountPaid += amountToApply;
        updatedSale.amountDue -= amountToApply;
        updatedSale.paymentStatus = updatedSale.amountDue === 0 ? 'paid' : 'partial';

        updateSale(updatedSale);
        remainingAmount -= amountToApply;
      }
    }

    updateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setShowPaymentModal(false);
    setSelectedSale(null);
    setPaymentForm({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'cash',
      reference: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => amount.toLocaleString();

  if (selectedCustomer) {
    const unpaidSales = getUnpaidSales(selectedCustomer.id);
    const totalUnpaidAmount = unpaidSales.reduce((sum, s) => sum + s.total, 0);
    const totalPaidAmount = unpaidSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const totalRemainingAmount = unpaidSales.reduce((sum, s) => sum + s.amountDue, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Détails Client</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedCustomer.name}</h2>
                {selectedCustomer.company && (
                  <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.company}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Tél: {selectedCustomer.phone}</p>
              </div>
              <Badge className={`${selectedCustomer.type === 'gros' ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                {selectedCustomer.type === 'gros' ? 'CLIENT GROS' : 'CLIENT DÉTAIL'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Achats</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(selectedCustomer.totalPurchases)} FCFA
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Payé</p>
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
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className={`h-4 w-4 ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reste à Payer</p>
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

        {selectedCustomer.balance > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Ventes Impayées / Partiellement Payées</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedSale(null);
                    setShowPaymentModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Enregistrer Paiement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date Vente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">N° Reçu</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Montant Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Déjà Payé</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Reste</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
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
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${
                            sale.amountPaid === 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {sale.amountPaid === 0 ? 'IMPAYÉ' : 'PARTIEL'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setPaymentForm({ ...paymentForm, amount: sale.amountDue });
                              setShowPaymentModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Payer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold">
                    <tr>
                      <td colSpan={2} className="px-4 py-3">TOTAL:</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totalUnpaidAmount)} FCFA</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(totalPaidAmount)} FCFA</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totalRemainingAmount)} FCFA</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique des Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date Paiement</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Pour Vente</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Montant Payé</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Méthode</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Reçu par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedCustomer.paymentHistory.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm">
                        {new Date(payment.date).toLocaleDateString('fr-FR')} {new Date(payment.date).toLocaleTimeString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{payment.saleReceiptNumber}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {formatCurrency(payment.amount)} FCFA
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{payment.method}</td>
                      <td className="px-4 py-3 text-sm">{payment.receivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedCustomer.paymentHistory.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucun paiement enregistré
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enregistrer un Paiement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              {selectedSale ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm font-semibold mb-1">Vente: {selectedSale.id}</p>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-semibold">{formatCurrency(selectedSale.total)} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Déjà Payé:</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(selectedSale.amountPaid)} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t mt-1 pt-1">
                    <span>Reste à Payer:</span>
                    <span className="text-red-600">{formatCurrency(selectedSale.amountDue)} FCFA</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                  <p className="text-sm font-semibold mb-1">Paiement Général</p>
                  <div className="flex justify-between">
                    <span>Total Dû:</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedCustomer.balance)} FCFA</span>
                  </div>
                </div>
              )}

              <div>
                <Label>Date du Paiement</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Montant Payé (FCFA)</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedSale ? selectedSale.amountDue : selectedCustomer.balance}
                  step="100"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="text-lg font-bold"
                  placeholder="Montant..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(selectedSale ? selectedSale.amountDue : selectedCustomer.balance)} FCFA
                </p>
              </div>

              {paymentForm.amount > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Après ce paiement, reste:</span>
                    <span className="font-bold">
                      {formatCurrency((selectedSale ? selectedSale.amountDue : selectedCustomer.balance) - paymentForm.amount)} FCFA
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label>Méthode de Paiement</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value as PaymentMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Espèces</SelectItem>
                    <SelectItem value="mobile">📱 Mobile Money</SelectItem>
                    <SelectItem value="bank">🏦 Virement Bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Référence (optionnel)</Label>
                <Input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="Ex: N° transaction, chèque..."
                />
              </div>

              <div>
                <Label>Notes (optionnel)</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Remarques..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  ✓ Enregistrer Paiement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gestion des Clients
            </CardTitle>
            <Button onClick={() => setShowAddCustomerDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
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
                {filteredCustomers.map((customer) => (
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

            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Aucun client trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom *</Label>
              <Input
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="+235..."
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <Label>Entreprise</Label>
              <Input
                value={newCustomerForm.company}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div>
              <Label>Type de Client</Label>
              <Select
                value={newCustomerForm.type}
                onValueChange={(value) => setNewCustomerForm({ ...newCustomerForm, type: value as 'détail' | 'gros' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="détail">Détail</SelectItem>
                  <SelectItem value="gros">Gros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCustomerForm.allowCredit}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, allowCredit: e.target.checked })}
                className="h-4 w-4"
              />
              <Label>Autoriser le crédit</Label>
            </div>

            {newCustomerForm.allowCredit && (
              <div>
                <Label>Limite de Crédit (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={newCustomerForm.creditLimit}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddCustomerDialog(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleAddCustomer} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Créer Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
