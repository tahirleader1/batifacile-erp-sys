import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ShoppingBag, Eye, DollarSign, Receipt, Truck, AlertTriangle, TrendingDown } from 'lucide-react';
import { PurchaseOrder, POProduct, ProductCategory, POExpense, ExpenseType, ShipmentStatus } from '../types';
import { CementShipments } from '../components/CementShipments';
import { IronCommands } from '../components/IronCommands';
import { WoodShipments } from '../components/WoodShipments';
import { PaintShipments } from '../components/PaintShipments';

export function Procurement() {
  const { purchaseOrders, addPurchaseOrder, addExpenseToPO, updatePurchaseOrder, receivePurchaseOrder, products } = useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [isNewPODialogOpen, setIsNewPODialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [formData, setFormData] = useState({
    supplierName: '',
    origin: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedArrivalDate: '',
    vehicleId: '',
    shipmentStatus: 'commandé' as ShipmentStatus
  });

  const [poProducts, setPOProducts] = useState<POProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState({
    productName: '',
    category: 'ciment' as ProductCategory,
    quantity: '',
    unitPurchasePrice: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Transport' as ExpenseType,
    description: '',
    amount: '',
    receiptReference: ''
  });

  const addProductToPO = () => {
    if (!currentProduct.productName || !currentProduct.quantity || !currentProduct.unitPurchasePrice) {
      alert('Veuillez remplir tous les champs du produit');
      return;
    }

    const quantity = parseInt(currentProduct.quantity);
    const unitPrice = parseFloat(currentProduct.unitPurchasePrice);

    const newProduct: POProduct = {
      productName: currentProduct.productName,
      category: currentProduct.category,
      quantity,
      unitPurchasePrice: unitPrice,
      subtotal: quantity * unitPrice
    };

    setPOProducts([...poProducts, newProduct]);
    setCurrentProduct({
      productName: '',
      category: 'ciment',
      quantity: '',
      unitPurchasePrice: ''
    });
  };

  const removeProductFromPO = (index: number) => {
    setPOProducts(poProducts.filter((_, i) => i !== index));
  };

  const calculateBasePurchasePrice = () => {
    return poProducts.reduce((sum, p) => sum + p.subtotal, 0);
  };

  const handleSubmitPO = () => {
    if (!formData.supplierName || !formData.origin || !formData.expectedArrivalDate || poProducts.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un produit');
      return;
    }

    const po: PurchaseOrder = {
      id: Date.now().toString(),
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierName: formData.supplierName,
      origin: formData.origin,
      orderDate: formData.orderDate,
      expectedArrivalDate: formData.expectedArrivalDate,
      vehicleId: formData.vehicleId,
      products: poProducts,
      basePurchasePrice: calculateBasePurchasePrice(),
      expenses: [],
      shipmentStatus: formData.shipmentStatus
    };

    addPurchaseOrder(po);
    resetPOForm();
    setIsNewPODialogOpen(false);
  };

  const resetPOForm = () => {
    setFormData({
      supplierName: '',
      origin: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedArrivalDate: '',
      vehicleId: '',
      shipmentStatus: 'commandé'
    });
    setPOProducts([]);
    setCurrentProduct({
      productName: '',
      category: 'ciment',
      quantity: '',
      unitPurchasePrice: ''
    });
  };

  const openAddExpenseDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsAddExpenseDialogOpen(true);
  };

  const handleAddExpense = () => {
    if (!selectedPO || !expenseForm.description || !expenseForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expense: POExpense = {
      id: Date.now().toString(),
      date: expenseForm.date,
      type: expenseForm.type,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      receiptReference: expenseForm.receiptReference || undefined,
      addedBy: 'Administrateur'
    };

    addExpenseToPO(selectedPO.id, expense);
    resetExpenseForm();
    setIsAddExpenseDialogOpen(false);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Transport',
      description: '',
      amount: '',
      receiptReference: ''
    });
  };

  const openDetailsDialog = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailsDialogOpen(true);
  };

  const getTotalExpenses = (po: PurchaseOrder) => {
    return po.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getPOProducts = (poId: string) => {
    return products.filter(p => p.poId === poId);
  };

  const getUnitsSold = (poId: string) => {
    const poProducts = getPOProducts(poId);
    let totalSold = 0;

    poProducts.forEach(product => {
      const sold = (product.originalQuantity || 0) - product.stockQuantity;
      totalSold += sold;
    });

    return totalSold;
  };

  const hasActiveSales = (poId: string) => {
    return getUnitsSold(poId) > 0;
  };

  const calculateProfitImpact = useMemo(() => {
    if (!selectedPO || !expenseForm.amount) return null;

    const newExpenseAmount = parseFloat(expenseForm.amount) || 0;
    if (newExpenseAmount === 0) return null;

    const totalUnits = selectedPO.products.reduce((sum, p) => sum + p.quantity, 0);
    const currentTotalExpenses = getTotalExpenses(selectedPO);
    const currentTotalCost = selectedPO.basePurchasePrice + currentTotalExpenses;
    const currentCostPerUnit = totalUnits > 0 ? currentTotalCost / totalUnits : 0;

    const newTotalCost = currentTotalCost + newExpenseAmount;
    const newCostPerUnit = totalUnits > 0 ? newTotalCost / totalUnits : 0;
    const costPerUnitIncrease = newCostPerUnit - currentCostPerUnit;

    const unitsSold = getUnitsSold(selectedPO.id);
    const unitsRemaining = totalUnits - unitsSold;

    const wholesalePrice = Math.round(currentCostPerUnit * 1.15);
    const currentProfit = wholesalePrice - currentCostPerUnit;
    const newProfit = wholesalePrice - newCostPerUnit;
    const profitReduction = currentProfit - newProfit;
    const profitMarginReduction = currentProfit > 0 ? (profitReduction / currentProfit) * 100 : 0;

    const totalProfitLossOnSoldUnits = profitReduction * unitsSold;
    const totalProfitLossOnRemainingUnits = profitReduction * unitsRemaining;

    return {
      currentCostPerUnit,
      newCostPerUnit,
      costPerUnitIncrease,
      unitsSold,
      unitsRemaining,
      wholesalePrice,
      currentProfit,
      newProfit,
      profitReduction,
      profitMarginReduction,
      totalProfitLossOnSoldUnits,
      totalProfitLossOnRemainingUnits,
      hasActiveSales: unitsSold > 0
    };
  }, [selectedPO, expenseForm.amount, products]);

  const getTotalCurrentCost = (po: PurchaseOrder) => {
    return po.basePurchasePrice + getTotalExpenses(po);
  };

  const getCostPerUnit = (po: PurchaseOrder) => {
    const totalUnits = po.products.reduce((sum, p) => sum + p.quantity, 0);
    return totalUnits > 0 ? getTotalCurrentCost(po) / totalUnits : 0;
  };

  const getExpensesByType = (po: PurchaseOrder) => {
    const byType: Record<string, number> = {};
    po.expenses.forEach(exp => {
      byType[exp.type] = (byType[exp.type] || 0) + exp.amount;
    });
    return byType;
  };

  const getStatusColor = (status: ShipmentStatus) => {
    const colors = {
      'commandé': 'bg-blue-500',
      'en transit': 'bg-yellow-500',
      'à la frontière': 'bg-orange-500',
      'dédouanement': 'bg-purple-500',
      'arrivé': 'bg-green-500',
      'en stock': 'bg-emerald-600'
    };
    return colors[status];
  };

  const handleReceivePO = (id: string) => {
    if (confirm('Marquer cette commande comme reçue? Les produits seront ajoutés à l\'inventaire.')) {
      receivePurchaseOrder(id);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full max-w-4xl grid-cols-5">
        <TabsTrigger value="orders">Commandes d'Achat</TabsTrigger>
        <TabsTrigger value="cement">Cargaisons de Ciment</TabsTrigger>
        <TabsTrigger value="iron">Commandes de Fer</TabsTrigger>
        <TabsTrigger value="wood">Cargaisons de Bois</TabsTrigger>
        <TabsTrigger value="paint">Cargaisons de Peinture</TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Commandes d'Achat
              <Badge variant="outline" className="ml-2">{purchaseOrders.length} commandes</Badge>
            </CardTitle>
            <Button onClick={() => setIsNewPODialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Commande
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune commande d'achat enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dark:text-gray-200 w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">N° Commande</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Fournisseur</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Produits</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Prix d'Achat</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Frais Ajoutés</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Coût Total</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Coût/Unité</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 dark:bg-gray-700">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{po.poNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{po.supplierName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{po.origin}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(po.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{po.products.length} produit(s)</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">
                        {po.basePurchasePrice.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-orange-700">
                        {getTotalExpenses(po).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-purple-700">
                        {getTotalCurrentCost(po).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {getCostPerUnit(po).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${getStatusColor(po.shipmentStatus)} text-white capitalize`}>
                          {po.shipmentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddExpenseDialog(po)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Ajouter un frais"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailsDialog(po)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.shipmentStatus !== 'en stock' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReceivePO(po.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Marquer comme reçu"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
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

      <Dialog open={isNewPODialogOpen} onOpenChange={(open) => {
        setIsNewPODialogOpen(open);
        if (!open) resetPOForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Commande d'Achat</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Section 1 - Informations Fournisseur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Nom du Fournisseur *</Label>
                    <Input
                      id="supplierName"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      placeholder="Ex: CIMAF Cameroun"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="origin">Origine/Pays *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="Ex: Nigeria, Cameroun"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
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
                    <Label htmlFor="expectedArrivalDate">Date d'Arrivée Prévue *</Label>
                    <Input
                      id="expectedArrivalDate"
                      type="date"
                      value={formData.expectedArrivalDate}
                      onChange={(e) => setFormData({ ...formData, expectedArrivalDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleId">ID Véhicule</Label>
                    <Input
                      id="vehicleId"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      placeholder="Ex: TC-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipmentStatus">Statut d'Expédition</Label>
                    <Select
                      value={formData.shipmentStatus}
                      onValueChange={(value) => setFormData({ ...formData, shipmentStatus: value as ShipmentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commandé">Commandé</SelectItem>
                        <SelectItem value="en transit">En Transit</SelectItem>
                        <SelectItem value="à la frontière">À la Frontière</SelectItem>
                        <SelectItem value="dédouanement">Dédouanement</SelectItem>
                        <SelectItem value="arrivé">Arrivé</SelectItem>
                        <SelectItem value="en stock">En Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base">Section 2 - Produits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Label>Nom du Produit</Label>
                    <Input
                      value={currentProduct.productName}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, productName: e.target.value })}
                      placeholder="Ex: Ciment Portland 50kg"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={currentProduct.category}
                      onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value as ProductCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ciment">Ciment</SelectItem>
                        <SelectItem value="fer">Fer</SelectItem>
                        <SelectItem value="bois">Bois</SelectItem>
                        <SelectItem value="peinture">Peinture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      value={currentProduct.quantity}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Prix Unitaire (FCFA)</Label>
                    <Input
                      type="number"
                      value={currentProduct.unitPurchasePrice}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, unitPurchasePrice: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button onClick={addProductToPO} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {poProducts.length > 0 && (
                  <div className="border-t pt-4">
                    <table className="dark:text-gray-200 w-full">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs">Produit</th>
                          <th className="px-2 py-2 text-left text-xs">Catégorie</th>
                          <th className="px-2 py-2 text-right text-xs">Quantité</th>
                          <th className="px-2 py-2 text-right text-xs">Prix Unit.</th>
                          <th className="px-2 py-2 text-right text-xs">Sous-total</th>
                          <th className="px-2 py-2 text-center text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {poProducts.map((product, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-2 py-2 text-sm">{product.productName}</td>
                            <td className="px-2 py-2 text-sm capitalize">{product.category}</td>
                            <td className="px-2 py-2 text-right text-sm">{product.quantity}</td>
                            <td className="px-2 py-2 text-right text-sm">{product.unitPurchasePrice.toLocaleString()}</td>
                            <td className="px-2 py-2 text-right text-sm font-bold">{product.subtotal.toLocaleString()} FCFA</td>
                            <td className="px-2 py-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeProductFromPO(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <td colSpan={4} className="px-2 py-2 text-right font-semibold">Total Achats:</td>
                          <td className="px-2 py-2 text-right font-bold text-green-600 dark:text-green-400">
                            {calculateBasePurchasePrice().toLocaleString()} FCFA
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Section 3 - Coût Initial d'Achat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Prix d'Achat de Base:</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {calculateBasePurchasePrice().toLocaleString()} FCFA
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-orange-600 font-medium">
                    Les frais additionnels seront ajoutés au fur et à mesure pendant l'expédition
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Vous pourrez ajouter les frais (transport, douane, etc.) en cliquant sur "Ajouter un Frais" après avoir créé cette commande
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmitPO} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12">
                Enregistrer la Commande
              </Button>
              <Button variant="outline" onClick={() => setIsNewPODialogOpen(false)}>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ajouter un Frais
            </DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Commande:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">{selectedPO.poNumber} - {selectedPO.supplierName}</p>
              </div>

              <div>
                <Label htmlFor="expenseDate">Date du Frais *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expenseType">Type de Frais *</Label>
                <Select
                  value={expenseForm.type}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, type: value as ExpenseType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Douane/Taxes">Douane/Taxes</SelectItem>
                    <SelectItem value="Frais de Dédouanement">Frais de Dédouanement</SelectItem>
                    <SelectItem value="Chargement/Déchargement">Chargement/Déchargement</SelectItem>
                    <SelectItem value="Frais de Stockage">Frais de Stockage</SelectItem>
                    <SelectItem value="Autres Frais">Autres Frais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expenseDescription">Description *</Label>
                <Input
                  id="expenseDescription"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Ex: Transport Lagos → N'Djamena"
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

              <div>
                <Label htmlFor="expenseReceipt">N° de Reçu/Référence</Label>
                <Input
                  id="expenseReceipt"
                  value={expenseForm.receiptReference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receiptReference: e.target.value })}
                  placeholder="Optionnel"
                />
              </div>

              {hasActiveSales(selectedPO.id) && (
                <Card className="bg-yellow-50 border-yellow-400 border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-yellow-800 mb-1">Attention: Ventes Actives</p>
                        <p className="text-sm text-yellow-700">
                          Cette expédition a des ventes actives. L'ajout de frais réduira la marge bénéficiaire.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {calculateProfitImpact && (
                <Card className="bg-red-50 border-red-300 border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      Impact sur la Rentabilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200">
                      <p className="text-xs text-gray-600 mb-2">Coût par Unité:</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Actuel:</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{calculateProfitImpact.currentCostPerUnit.toLocaleString()} FCFA</p>
                        </div>
                        <div className="text-red-600 px-2">→</div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Nouveau:</p>
                          <p className="font-bold text-red-600 dark:text-red-400">{calculateProfitImpact.newCostPerUnit.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-red-100 px-2 py-1 rounded">
                          <p className="text-xs text-red-700">+{calculateProfitImpact.costPerUnitIncrease.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200">
                      <p className="text-xs text-gray-600 mb-2">Réduction de la Marge Bénéficiaire:</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{calculateProfitImpact.profitMarginReduction.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Marge: {calculateProfitImpact.currentProfit.toLocaleString()} → {calculateProfitImpact.newProfit.toLocaleString()} FCFA/unité
                      </p>
                    </div>

                    {calculateProfitImpact.hasActiveSales && (
                      <div className="space-y-2">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200">
                          <p className="text-xs text-gray-600 dark:text-gray-300">Unités déjà vendues:</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{calculateProfitImpact.unitsSold} unités</p>
                          <p className="text-sm text-red-600 mt-1">
                            Perte de profit: -{calculateProfitImpact.totalProfitLossOnSoldUnits.toLocaleString()} FCFA
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200">
                          <p className="text-xs text-gray-600 dark:text-gray-300">Unités restantes:</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{calculateProfitImpact.unitsRemaining} unités</p>
                          <p className="text-sm text-orange-600 mt-1">
                            Impact sur profit futur: -{calculateProfitImpact.totalProfitLossOnRemainingUnits.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddExpense} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  <Receipt className="h-4 w-4 mr-2" />
                  Enregistrer le Frais
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails de la Commande
            </DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">Section 1 - Informations d'Achat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">N° Commande:</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{selectedPO.poNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Fournisseur:</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{selectedPO.supplierName} ({selectedPO.origin})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Date de Commande:</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(selectedPO.orderDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Arrivée Prévue:</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(selectedPO.expectedArrivalDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Produits:</p>
                    <table className="dark:text-gray-200 w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-2 py-1 text-left">Produit</th>
                          <th className="px-2 py-1 text-right">Quantité</th>
                          <th className="px-2 py-1 text-right">Prix Unit.</th>
                          <th className="px-2 py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPO.products.map((p, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-2 py-1">{p.productName}</td>
                            <td className="px-2 py-1 text-right">{p.quantity}</td>
                            <td className="px-2 py-1 text-right">{p.unitPurchasePrice.toLocaleString()}</td>
                            <td className="px-2 py-1 text-right font-bold">{p.subtotal.toLocaleString()} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Prix d'Achat de Base:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{selectedPO.basePurchasePrice.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Section 2 - Historique des Frais</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        openAddExpenseDialog(selectedPO);
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un Frais
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedPO.expenses.length === 0 ? (
                    <p className="text-center py-4 text-gray-500 text-sm">Aucun frais ajouté</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPO.expenses.map((expense, index) => {
                        const runningTotal = selectedPO.basePurchasePrice +
                          selectedPO.expenses.slice(0, index + 1).reduce((sum, e) => sum + e.amount, 0);

                        return (
                          <div key={expense.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{expense.type}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{expense.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(expense.date).toLocaleDateString('fr-FR')} • {expense.addedBy}
                                  {expense.receiptReference && ` • Réf: ${expense.receiptReference}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600 dark:text-orange-400">{expense.amount.toLocaleString()} FCFA</p>
                                <p className="text-xs text-gray-500 mt-1">Total: {runningTotal.toLocaleString()} FCFA</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-base">Section 3 - Résumé des Coûts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Prix d'Achat de Base:</span>
                    <span className="font-semibold">{selectedPO.basePurchasePrice.toLocaleString()} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span>Total des Frais:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{getTotalExpenses(selectedPO).toLocaleString()} FCFA</span>
                  </div>

                  {Object.entries(getExpensesByType(selectedPO)).length > 0 && (
                    <div className="pl-4 space-y-1 border-l-2 border-orange-300">
                      {Object.entries(getExpensesByType(selectedPO)).map(([type, amount]) => (
                        <div key={type} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                          <span>• {type}:</span>
                          <span>{amount.toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t-2 border-purple-300">
                    <span className="text-lg font-bold">COÛT TOTAL RENDU:</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getTotalCurrentCost(selectedPO).toLocaleString()} FCFA
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Total des Unités:</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        {selectedPO.products.reduce((sum, p) => sum + p.quantity, 0)} unités
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Coût par Unité:</p>
                      <p className="font-bold text-purple-600 dark:text-purple-400">{getCostPerUnit(selectedPO).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Select
                  value={selectedPO.shipmentStatus}
                  onValueChange={(value) => updatePurchaseOrder(selectedPO.id, { shipmentStatus: value as ShipmentStatus })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commandé">Commandé</SelectItem>
                    <SelectItem value="en transit">En Transit</SelectItem>
                    <SelectItem value="à la frontière">À la Frontière</SelectItem>
                    <SelectItem value="dédouanement">Dédouanement</SelectItem>
                    <SelectItem value="arrivé">Arrivé</SelectItem>
                    <SelectItem value="en stock">En Stock</SelectItem>
                  </SelectContent>
                </Select>
                {selectedPO.shipmentStatus !== 'en stock' && (
                  <Button
                    onClick={() => {
                      handleReceivePO(selectedPO.id);
                      setIsDetailsDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Marquer comme Reçu
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </TabsContent>

      <TabsContent value="cement">
        <CementShipments />
      </TabsContent>

      <TabsContent value="iron">
        <IronCommands />
      </TabsContent>

      <TabsContent value="wood">
        <WoodShipments />
      </TabsContent>

      <TabsContent value="paint">
        <PaintShipments />
      </TabsContent>
    </Tabs>
  );
}
