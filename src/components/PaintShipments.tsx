import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Truck, TrendingUp, DollarSign, Plus, Eye, Receipt, MapPin } from 'lucide-react';
import { PaintShipment, PaintShipmentStatus, PaintType, PaintFinish, PaintShipmentExpense, PaintExpenseStageCameroun, PaintOrigin } from '../types';

export function PaintShipments() {
  const { paintShipments, addPaintShipment, addExpenseToPaintShipment } = useApp();
  const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<PaintShipment | null>(null);

  const [formData, setFormData] = useState({
    supplier: '',
    origin: 'Cameroun' as PaintOrigin,
    orderDate: new Date().toISOString().split('T')[0],
    bankPaymentDate: '',
    paymentReceiptNumber: '',
    amountPaid: 0,
    status: 'commandé' as PaintShipmentStatus,
    brand: '',
    paintType: 'Faume Universel' as PaintType,
    color: '',
    unitVolume: '5L',
    finish: 'Mate' as PaintFinish,
    totalUnits: 0,
    unitPrice: 0,
    departureCamerounDate: '',
    expectedArrivalTchad: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    stage: 'Chargement (Cameroun)' as PaintExpenseStageCameroun,
    type: '',
    description: '',
    amount: '',
    referenceNumber: '',
    numberOfWorkers: '',
    weight: ''
  });

  const generateShipmentId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = paintShipments.length + 1;
    return `PEIN-${dateStr}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmitShipment = () => {
    if (!formData.supplier || !formData.paymentReceiptNumber || !formData.bankPaymentDate ||
        formData.totalUnits === 0 || formData.unitPrice === 0 || formData.amountPaid === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const shipment: PaintShipment = {
      id: Date.now().toString(),
      shipmentId: generateShipmentId(),
      supplier: formData.supplier,
      origin: formData.origin,
      orderDate: formData.orderDate,
      bankPaymentDate: formData.bankPaymentDate,
      paymentReceiptNumber: formData.paymentReceiptNumber,
      amountPaid: formData.amountPaid,
      status: formData.status,
      brand: formData.brand,
      paintType: formData.paintType,
      color: formData.color,
      unitVolume: formData.unitVolume,
      finish: formData.finish,
      totalUnits: formData.totalUnits,
      unitsSold: 0,
      unitPrice: formData.unitPrice,
      basePurchasePrice: formData.totalUnits * formData.unitPrice,
      expenses: [],
      departureCamerounDate: formData.departureCamerounDate || undefined,
      expectedArrivalTchad: formData.expectedArrivalTchad || undefined,
      vehicleNumber: formData.vehicleNumber || undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      averageSellingPrice: 0,
      totalRevenue: 0,
      stockMovements: []
    };

    addPaintShipment(shipment);
    resetShipmentForm();
    setIsNewShipmentDialogOpen(false);
  };

  const resetShipmentForm = () => {
    setFormData({
      supplier: '',
      origin: 'Cameroun',
      orderDate: new Date().toISOString().split('T')[0],
      bankPaymentDate: '',
      paymentReceiptNumber: '',
      amountPaid: 0,
      status: 'commandé',
      brand: '',
      paintType: 'Faume Universel',
      color: '',
      unitVolume: '5L',
      finish: 'Mate',
      totalUnits: 0,
      unitPrice: 0,
      departureCamerounDate: '',
      expectedArrivalTchad: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: ''
    });
  };

  const openAddExpenseDialog = (shipment: PaintShipment) => {
    setSelectedShipment(shipment);
    setIsAddExpenseDialogOpen(true);
  };

  const handleAddExpense = () => {
    if (!selectedShipment || !expenseForm.description || !expenseForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expense: PaintShipmentExpense = {
      id: Date.now().toString(),
      date: expenseForm.date,
      stage: expenseForm.stage,
      type: expenseForm.type,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      referenceNumber: expenseForm.referenceNumber || undefined,
      numberOfWorkers: expenseForm.numberOfWorkers ? parseInt(expenseForm.numberOfWorkers) : undefined,
      weight: expenseForm.weight || undefined,
      addedBy: 'Administrateur'
    };

    addExpenseToPaintShipment(selectedShipment.id, expense);
    resetExpenseForm();
    setIsAddExpenseDialogOpen(false);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      stage: 'Chargement (Cameroun)',
      type: '',
      description: '',
      amount: '',
      referenceNumber: '',
      numberOfWorkers: '',
      weight: ''
    });
  };

  const getTotalExpenses = (shipment: PaintShipment) => {
    return shipment.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalCost = (shipment: PaintShipment) => {
    return shipment.amountPaid + getTotalExpenses(shipment);
  };

  const getCostPerPiece = (shipment: PaintShipment) => {
    return shipment.totalUnits > 0 ? getTotalCost(shipment) / shipment.totalUnits : 0;
  };

  const getRemainingUnits = (shipment: PaintShipment) => {
    return shipment.totalUnits - shipment.unitsSold;
  };

  const getNetProfit = (shipment: PaintShipment) => {
    return shipment.totalRevenue - getTotalCost(shipment);
  };

  const getProfitMargin = (shipment: PaintShipment) => {
    return shipment.totalRevenue > 0 ? (getNetProfit(shipment) / shipment.totalRevenue) * 100 : 0;
  };

  const getStatusColor = (status: PaintShipmentStatus) => {
    const colors = {
      'commandé': 'bg-gray-400',
      'payé': 'bg-gray-500',
      'en transit': 'bg-blue-500',
      'arrivé': 'bg-blue-600',
      'en stock': 'bg-yellow-500',
      'vendu': 'bg-green-600',
      'clôturé': 'bg-emerald-800'
    };
    return colors[status];
  };

  const getRowColor = (shipment: PaintShipment) => {
    const profit = getNetProfit(shipment);
    const status = shipment.status;

    if (status === 'vendu' && profit > 0) return 'bg-green-50';
    if (status === 'en stock') return 'bg-yellow-50';
    if (status === 'en transit') return 'bg-blue-50';
    if (profit < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  const activeShipments = useMemo(() => {
    return paintShipments.filter(s => s.status === 'en stock');
  }, [paintShipments]);

  const totalActiveUnits = useMemo(() => {
    return activeShipments.reduce((sum, s) => sum + getRemainingUnits(s), 0);
  }, [activeShipments]);

  const totalStockValue = useMemo(() => {
    return activeShipments.reduce((sum, s) => sum + (getRemainingUnits(s) * getCostPerPiece(s)), 0);
  }, [activeShipments]);

  const totalPotentialProfit = useMemo(() => {
    return activeShipments.reduce((sum, s) => {
      const avgPrice = s.averageSellingPrice || (getCostPerPiece(s) * 1.25);
      const remaining = getRemainingUnits(s);
      return sum + (remaining * (avgPrice - getCostPerPiece(s)));
    }, 0);
  }, [activeShipments]);

  const getExpenseTypesByStage = (stage: PaintExpenseStageCameroun): string[] => {
    const types = {
      'Chargement (Cameroun)': ['Main d\'Œuvre Chargement'],
      'Transport (Cameroun → Tchad)': ['Frais de Transport', 'Carburant', 'Péage', 'Autre'],
      'Sortie Cameroun': ['Frais de Sortie Cameroun'],
      'Douane Tchad': ['Droits de Douane'],
      'BNFT': ['Frais BNFT'],
      'Mairie': ['Taxes Mairie'],
      'Bascule': ['Frais de Bascule'],
      'Déchargement (Tchad)': ['Main d\'Œuvre Déchargement'],
      'Autres Frais': ['Autre']
    };
    return types[stage] || [];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cargaisons Actives</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeShipments.length}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Stock Disponible</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActiveUnits} unités</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valeur du Stock</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalStockValue.toLocaleString()} FCFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Profit Potentiel</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalPotentialProfit.toLocaleString()} FCFA</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Cargaisons de Peinture (Paint)
              <Badge variant="outline" className="ml-2">{paintShipments.length} cargaisons</Badge>
            </CardTitle>
            <Button onClick={() => setIsNewShipmentDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Cargaison de Peinture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paintShipments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune cargaison de peinture enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dark:text-gray-200 w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">N° Cargaison</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Fournisseur</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date Commande</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">N° Reçu</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type de Peinture</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Qté Totale</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Qté Vendue</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Qté Restante</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Coût Total</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Revenu</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Profit Net</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Marge (%)</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paintShipments.map((shipment) => (
                    <tr key={shipment.id} className={`${getRowColor(shipment)} hover:opacity-75 transition-opacity`}>
                      <td className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200">{shipment.shipmentId}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{shipment.supplier}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                        {new Date(shipment.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 py-2 text-gray-600 font-medium">{shipment.paymentReceiptNumber}</td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{shipment.paintType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{shipment.finish}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-blue-700">{shipment.totalUnits}</td>
                      <td className="px-3 py-2 text-right font-medium text-orange-700">{shipment.unitsSold}</td>
                      <td className="px-3 py-2 text-right font-bold text-green-700">{getRemainingUnits(shipment)}</td>
                      <td className="px-3 py-2 text-right text-purple-700 font-medium">
                        {getTotalCost(shipment).toLocaleString()} FCFA
                      </td>
                      <td className="px-3 py-2 text-right text-blue-700 font-medium">
                        {shipment.totalRevenue.toLocaleString()} FCFA
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${getNetProfit(shipment) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {getNetProfit(shipment).toLocaleString()} FCFA
                      </td>
                      <td className={`px-3 py-2 text-right font-bold ${getProfitMargin(shipment) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {getProfitMargin(shipment).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`${getStatusColor(shipment.status)} text-white text-xs capitalize`}>
                          {shipment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddExpenseDialog(shipment)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Ajouter frais"
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setIsDetailsDialogOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Voir détails"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isNewShipmentDialogOpen} onOpenChange={(open) => {
        setIsNewShipmentDialogOpen(open);
        if (!open) resetShipmentForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Cargaison de Peinture</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base">Section 1 - Informations Cargaison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <Label>N° Cargaison (Auto-généré)</Label>
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{generateShipmentId()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Fournisseur *</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Nom du fournisseur"
                      required
                    />
                  </div>
                  <div>
                    <Label>Pays d'Origine</Label>
                    <Input value="Cameroun" disabled className="bg-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="orderDate">Date de Commande *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankPaymentDate">Date Paiement Bancaire *</Label>
                    <Input
                      id="bankPaymentDate"
                      type="date"
                      value={formData.bankPaymentDate}
                      onChange={(e) => setFormData({ ...formData, bankPaymentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Statut Initial</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as PaintShipmentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commandé">Commandé</SelectItem>
                        <SelectItem value="payé">Payé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentReceiptNumber">N° Reçu Paiement Bancaire *</Label>
                    <Input
                      id="paymentReceiptNumber"
                      value={formData.paymentReceiptNumber}
                      onChange={(e) => setFormData({ ...formData, paymentReceiptNumber: e.target.value })}
                      placeholder="Ex: REC-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amountPaid">Montant Payé au Fournisseur (FCFA) *</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      value={formData.amountPaid || ''}
                      onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base">Section 2 - Détails du Peinture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="paintType">Type de Peinture *</Label>
                    <Select
                      value={formData.paintType}
                      onValueChange={(value) => setFormData({ ...formData, paintType: value as PaintType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Faume Universel">Faume Universel</SelectItem>
                        <SelectItem value="Faume National">Faume National</SelectItem>
                        <SelectItem value="Plastique">Plastique</SelectItem>
                        <SelectItem value="Peinture à l'Huile">Peinture à l'Huile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="color">Couleur</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Blanc, Beige, Bleu..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitVolume">Volume par Unité *</Label>
                    <Select
                      value={formData.unitVolume}
                      onValueChange={(value) => setFormData({ ...formData, unitVolume: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1L">1 Litre</SelectItem>
                        <SelectItem value="5L">5 Litres</SelectItem>
                        <SelectItem value="10L">10 Litres</SelectItem>
                        <SelectItem value="20L">20 Litres</SelectItem>
                        <SelectItem value="25L">25 Litres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalUnits">Nombre Total de Unités *</Label>
                    <Input
                      id="totalUnits"
                      type="number"
                      value={formData.totalUnits || ''}
                      onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Prix Unitaire (FCFA) *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={formData.unitPrice || ''}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label>Prix Total</Label>
                    <div className="h-10 flex items-center px-3 bg-white border rounded-md">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {(formData.totalUnits * formData.unitPrice).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-base">Section 3 - Informations Transport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureCamerounDate">Date Départ Cameroun</Label>
                    <Input
                      id="departureCamerounDate"
                      type="date"
                      value={formData.departureCamerounDate}
                      onChange={(e) => setFormData({ ...formData, departureCamerounDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedArrivalTchad">Date Arrivée Prévue Tchad</Label>
                    <Input
                      id="expectedArrivalTchad"
                      type="date"
                      value={formData.expectedArrivalTchad}
                      onChange={(e) => setFormData({ ...formData, expectedArrivalTchad: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicleNumber">N° Véhicule</Label>
                    <Input
                      id="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="Ex: CM-XXX-YYY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverName">Nom du Chauffeur</Label>
                    <Input
                      id="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Nom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverPhone">Téléphone</Label>
                    <Input
                      id="driverPhone"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Section 4 - Coût Initial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Montant Payé au Fournisseur:</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formData.amountPaid.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">N° Reçu: {formData.paymentReceiptNumber || '(à saisir)'}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-700 font-medium">
                    Les frais de transport seront ajoutés selon les étapes:
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Chargement → Transport → Sortie Cameroun → Douane Tchad → BNFT → Mairie → Bascule → Déchargement
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmitShipment} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12">
                Enregistrer Cargaison
              </Button>
              <Button variant="outline" onClick={() => setIsNewShipmentDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseDialogOpen} onOpenChange={(open) => {
        setIsAddExpenseDialogOpen(open);
        if (!open) resetExpenseForm();
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ajouter un Frais
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Cargaison:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">{selectedShipment.shipmentId} - {selectedShipment.supplier}</p>
              </div>

              <div>
                <Label htmlFor="expenseStage">Étape *</Label>
                <Select
                  value={expenseForm.stage}
                  onValueChange={(value) => {
                    setExpenseForm({ ...expenseForm, stage: value as PaintExpenseStageCameroun, type: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chargement (Cameroun)">Chargement (Cameroun)</SelectItem>
                    <SelectItem value="Transport (Cameroun → Tchad)">Transport (Cameroun → Tchad)</SelectItem>
                    <SelectItem value="Sortie Cameroun">Sortie Cameroun</SelectItem>
                    <SelectItem value="Douane Tchad">Douane Tchad</SelectItem>
                    <SelectItem value="BNFT">BNFT</SelectItem>
                    <SelectItem value="Mairie">Mairie</SelectItem>
                    <SelectItem value="Bascule">Bascule</SelectItem>
                    <SelectItem value="Déchargement (Tchad)">Déchargement (Tchad)</SelectItem>
                    <SelectItem value="Autres Frais">Autres Frais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expenseType">Type de Frais</Label>
                <Select
                  value={expenseForm.type}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getExpenseTypesByStage(expenseForm.stage).map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expenseDate">Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expenseDescription">Description *</Label>
                <Input
                  id="expenseDescription"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Détails du frais"
                  required
                />
              </div>

              <div>
                <Label htmlFor="expenseAmount">Montant (FCFA) *</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              {(['Chargement (Cameroun)', 'Déchargement (Tchad)'] as PaintExpenseStageCameroun[]).includes(expenseForm.stage) && (
                <div>
                  <Label htmlFor="numberOfWorkers">Nombre de Travailleurs</Label>
                  <Input
                    id="numberOfWorkers"
                    type="number"
                    value={expenseForm.numberOfWorkers}
                    onChange={(e) => setExpenseForm({ ...expenseForm, numberOfWorkers: e.target.value })}
                    placeholder="0"
                  />
                </div>
              )}

              {['Sortie Cameroun', 'Douane Tchad', 'BNFT', 'Mairie'].includes(expenseForm.stage) && (
                <div>
                  <Label htmlFor="referenceNumber">N° Document/Référence</Label>
                  <Input
                    id="referenceNumber"
                    value={expenseForm.referenceNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, referenceNumber: e.target.value })}
                    placeholder="Optionnel"
                  />
                </div>
              )}

              {expenseForm.stage === 'Bascule' && (
                <div>
                  <Label htmlFor="weight">Poids Mesuré</Label>
                  <Input
                    id="weight"
                    value={expenseForm.weight}
                    onChange={(e) => setExpenseForm({ ...expenseForm, weight: e.target.value })}
                    placeholder="Ex: 5000 kg"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddExpense} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  <Receipt className="h-4 w-4 mr-2" />
                  Enregistrer Frais
                </Button>
                <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails de la Cargaison
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <p className="text-center text-gray-500 dark:text-gray-400">Les détails complets seront affichés ici</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
