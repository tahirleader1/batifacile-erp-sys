import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, Package, TrendingUp, DollarSign, AlertTriangle, Plus, Eye, Receipt } from 'lucide-react';
import { CementShipment, CementOrigin, CementShipmentStatus, CementType, LocationType, StorageReason, CementShipmentExpense } from '../types';

export function CementShipments() {
  const { cementShipments, addCementShipment, addExpenseToShipment } = useApp();
  const [originFilter, setOriginFilter] = useState<CementOrigin | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<LocationType | 'all'>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<CementOrigin>('Nigeria');
  const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<CementShipment | null>(null);
  const [showOriginSelector, setShowOriginSelector] = useState(false);

  const [formData, setFormData] = useState({
    supplier: '',
    vehicleId: '',
    driverName: '',
    driverPhone: '',
    orderDate: new Date().toISOString().split('T')[0],
    bankPaymentDate: '',
    paymentReceiptNumber: '',
    amountPaid: 0,
    departureDate: new Date().toISOString().split('T')[0],
    expectedArrivalDate: '',
    status: 'commandé' as CementShipmentStatus,
    cementType: 'Dangote 42.5kg' as CementType,
    brand: '',
    weightPerBag: 50,
    totalBags: 0,
    pricePerBag: 0,
    location: 'sur véhicule' as LocationType,
    storageReason: '' as StorageReason | '',
    collectionLocation: '',
    distance: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    stage: '' as CementShipmentExpense['stage'],
    type: '',
    description: '',
    amount: '',
    receiptReference: ''
  });

  const getOriginColor = (origin: CementOrigin) => {
    const colors = { 'Nigeria': 'bg-orange-500', 'Cameroun': 'bg-blue-500', 'Tchad': 'bg-green-500' };
    return colors[origin];
  };

  const getOriginBadge = (origin: CementOrigin) => {
    const badges = { 'Nigeria': 'Vendu du Véhicule', 'Cameroun': 'Vendu de l\'Entrepôt', 'Tchad': 'Vendu de l\'Entrepôt' };
    return badges[origin];
  };

  const getExpenseStagesByOrigin = (origin: CementOrigin): string[] => {
    if (origin === 'Nigeria') {
      return ['Transport (Nigeria → Tchad)', 'Douane/Taxes', 'Frais Frontaliers', 'Chargement/Déchargement', 'Gardiennage', 'Frais de Stockage', 'Autres'];
    } else if (origin === 'Cameroun') {
      return ['Chargement (Cameroun)', 'Transport (Cameroun → Tchad)', 'Sortie Cameroun', 'Douane Tchad', 'BNFT', 'Mairie', 'Bascule', 'Déchargement/Stockage Entrepôt', 'Autres Frais'];
    } else {
      return ['Chargement', 'Transport Local', 'Mairie', 'Bascule', 'Déchargement/Stockage Entrepôt', 'Autres Frais'];
    }
  };

  const generateShipmentId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = cementShipments.filter(s => s.origin === selectedOrigin).length + 1;
    const prefix = selectedOrigin === 'Nigeria' ? 'CIMENT-NIG' :
                   selectedOrigin === 'Cameroun' ? 'CIMENT-CAM' : 'CIMENT-TCD';
    return `${prefix}-${dateStr}-${String(count).padStart(3, '0')}`;
  };

  const filteredShipments = useMemo(() => {
    let filtered = cementShipments;

    if (originFilter !== 'all') {
      filtered = filtered.filter(s => s.origin === originFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(s => s.location === locationFilter);
    }

    return filtered;
  }, [cementShipments, originFilter, locationFilter]);

  const handleSubmitShipment = () => {
    const supplier = selectedOrigin === 'Nigeria' ? 'DANGOTE' : formData.supplier;
    const brand = selectedOrigin === 'Nigeria' ? 'DANGOTE' : formData.brand;

    if (!supplier || !formData.expectedArrivalDate || !brand || !formData.paymentReceiptNumber) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.totalBags || formData.totalBags <= 0) {
      alert('Le nombre total de sacs doit être supérieur à 0');
      return;
    }

    if (!formData.pricePerBag || formData.pricePerBag <= 0) {
      alert('Le prix par sac doit être supérieur à 0');
      return;
    }

    if (!formData.amountPaid || formData.amountPaid <= 0) {
      alert('Le montant payé doit être supérieur à 0');
      return;
    }

    if (selectedOrigin === 'Nigeria' && !formData.vehicleId) {
      alert('Le N° Véhicule est obligatoire pour le ciment du Nigeria');
      return;
    }

    const shipment: CementShipment = {
      id: Date.now().toString(),
      shipmentId: generateShipmentId(),
      origin: selectedOrigin,
      supplier: selectedOrigin === 'Nigeria' ? 'DANGOTE' : formData.supplier,
      vehicleId: formData.vehicleId || undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      orderDate: formData.orderDate,
      bankPaymentDate: formData.bankPaymentDate,
      paymentReceiptNumber: formData.paymentReceiptNumber,
      amountPaid: formData.amountPaid,
      departureDate: formData.departureDate,
      expectedArrivalDate: formData.expectedArrivalDate,
      status: formData.status,
      cementType: formData.cementType,
      brand: selectedOrigin === 'Nigeria' ? 'DANGOTE' : formData.brand,
      weightPerBag: formData.weightPerBag,
      totalBags: formData.totalBags,
      bagsSold: 0,
      pricePerBag: formData.pricePerBag,
      basePurchasePrice: formData.totalBags * formData.pricePerBag,
      expenses: [],
      location: selectedOrigin === 'Nigeria' ? formData.location : 'en entrepôt',
      storageReason: formData.storageReason || undefined,
      averageSellingPrice: 0,
      totalRevenue: 0,
      collectionLocation: formData.collectionLocation || undefined,
      distance: formData.distance || undefined
    };

    addCementShipment(shipment);
    resetShipmentForm();
    setIsNewShipmentDialogOpen(false);
  };

  const resetShipmentForm = () => {
    setFormData({
      supplier: '',
      vehicleId: '',
      driverName: '',
      driverPhone: '',
      orderDate: new Date().toISOString().split('T')[0],
      bankPaymentDate: '',
      paymentReceiptNumber: '',
      amountPaid: 0,
      departureDate: new Date().toISOString().split('T')[0],
      expectedArrivalDate: '',
      status: 'commandé',
      cementType: 'Dangote 42.5kg',
      brand: '',
      weightPerBag: 50,
      totalBags: 0,
      pricePerBag: 0,
      location: 'sur véhicule',
      storageReason: '',
      collectionLocation: '',
      distance: ''
    });
  };

  const openAddExpenseDialog = (shipment: CementShipment) => {
    setSelectedShipment(shipment);
    setIsAddExpenseDialogOpen(true);
  };

  const handleAddExpense = () => {
    if (!selectedShipment || !expenseForm.stage || !expenseForm.description || !expenseForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expense: CementShipmentExpense = {
      id: Date.now().toString(),
      date: expenseForm.date,
      stage: expenseForm.stage as CementShipmentExpense['stage'],
      type: expenseForm.type,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      receiptReference: expenseForm.receiptReference || undefined,
      addedBy: 'Administrateur'
    };

    addExpenseToShipment(selectedShipment.id, expense);
    resetExpenseForm();
    setIsAddExpenseDialogOpen(false);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      stage: '' as CementShipmentExpense['stage'],
      type: '',
      description: '',
      amount: '',
      receiptReference: ''
    });
  };

  const getTotalExpenses = (shipment: CementShipment) => {
    return shipment.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalCost = (shipment: CementShipment) => {
    return shipment.basePurchasePrice + getTotalExpenses(shipment);
  };

  const getCostPerBag = (shipment: CementShipment) => {
    return shipment.totalBags > 0 ? getTotalCost(shipment) / shipment.totalBags : 0;
  };

  const getRemainingBags = (shipment: CementShipment) => {
    return shipment.totalBags - shipment.bagsSold;
  };

  const getNetProfit = (shipment: CementShipment) => {
    return shipment.totalRevenue - getTotalCost(shipment);
  };

  const getProfitMargin = (shipment: CementShipment) => {
    return shipment.totalRevenue > 0 ? (getNetProfit(shipment) / shipment.totalRevenue) * 100 : 0;
  };

  const getStatusColor = (status: CementShipmentStatus) => {
    const colors = {
      'commandé': 'bg-gray-400',
      'payé': 'bg-gray-500',
      'en route': 'bg-blue-400',
      'arrivé': 'bg-blue-600',
      'disponible à la vente': 'bg-green-500',
      'en vente': 'bg-yellow-500',
      'vendu': 'bg-emerald-600',
      'clôturé': 'bg-emerald-800'
    };
    return colors[status];
  };

  const getRowColor = (shipment: CementShipment) => {
    const profit = getNetProfit(shipment);
    const status = shipment.status;

    if (status === 'vendu' && profit > 0) return 'bg-green-50';
    if (status === 'en vente') return 'bg-yellow-50';
    if (profit < 0) return 'bg-red-50';
    if (status === 'disponible à la vente') return 'bg-blue-50';
    return 'bg-gray-50';
  };

  const activeShipments = useMemo(() => {
    return cementShipments.filter(s =>
      s.status === 'disponible à la vente' || s.status === 'en vente'
    );
  }, [cementShipments]);

  // const nigeriaShipments = useMemo(() => {
  //   return activeShipments.filter(s => s.origin === 'Nigeria');
  // }, [activeShipments]);

  // const camerounShipments = useMemo(() => {
  //   return activeShipments.filter(s => s.origin === 'Cameroun');
  // }, [activeShipments]);

  // const tchadShipments = useMemo(() => {
  //   return activeShipments.filter(s => s.origin === 'Tchad');
  // }, [activeShipments]);

  const totalActiveBags = useMemo(() => {
    return activeShipments.reduce((sum, s) => sum + getRemainingBags(s), 0);
  }, [activeShipments]);

  const totalStockValue = useMemo(() => {
    return activeShipments.reduce((sum, s) => sum + (getRemainingBags(s) * getCostPerBag(s)), 0);
  }, [activeShipments]);

  const totalPotentialProfit = useMemo(() => {
    return activeShipments.reduce((sum, s) => {
      const avgPrice = s.averageSellingPrice || (getCostPerBag(s) * 1.20);
      const remaining = getRemainingBags(s);
      return sum + (remaining * (avgPrice - getCostPerBag(s)));
    }, 0);
  }, [activeShipments]);

  // Multi-origin summary stats (for future use)
  // const nigeriaBagsOnVehicle = useMemo(() => {
  //   return nigeriaShipments.filter(s => s.location === 'sur véhicule')
  //     .reduce((sum, s) => sum + getRemainingBags(s), 0);
  // }, [nigeriaShipments]);

  // const nigeriaBagsInWarehouse = useMemo(() => {
  //   return nigeriaShipments.filter(s => s.location === 'en entrepôt')
  //     .reduce((sum, s) => sum + getRemainingBags(s), 0);
  // }, [nigeriaShipments]);

  // const camerounBags = useMemo(() => {
  //   return camerounShipments.reduce((sum, s) => sum + getRemainingBags(s), 0);
  // }, [camerounShipments]);

  // const tchadBags = useMemo(() => {
  //   return tchadShipments.reduce((sum, s) => sum + getRemainingBags(s), 0);
  // }, [tchadShipments]);

  const hasActiveSales = (shipment: CementShipment) => {
    return shipment.bagsSold > 0;
  };

  const calculateExpenseImpact = useMemo(() => {
    if (!selectedShipment || !expenseForm.amount) return null;

    const newExpenseAmount = parseFloat(expenseForm.amount) || 0;
    if (newExpenseAmount === 0) return null;

    const currentCostPerBag = getCostPerBag(selectedShipment);
    const newTotalCost = getTotalCost(selectedShipment) + newExpenseAmount;
    const newCostPerBag = selectedShipment.totalBags > 0 ? newTotalCost / selectedShipment.totalBags : 0;
    const costPerBagIncrease = newCostPerBag - currentCostPerBag;

    const avgSellingPrice = selectedShipment.averageSellingPrice || (currentCostPerBag * 1.20);
    const currentProfit = avgSellingPrice - currentCostPerBag;
    const newProfit = avgSellingPrice - newCostPerBag;
    const profitReduction = currentProfit - newProfit;
    const profitMarginReduction = currentProfit > 0 ? (profitReduction / currentProfit) * 100 : 0;

    const bagsSold = selectedShipment.bagsSold;
    const bagsRemaining = getRemainingBags(selectedShipment);

    const profitLossOnSold = profitReduction * bagsSold;
    const profitLossOnRemaining = profitReduction * bagsRemaining;

    return {
      currentCostPerBag,
      newCostPerBag,
      costPerBagIncrease,
      profitMarginReduction,
      bagsSold,
      bagsRemaining,
      profitLossOnSold,
      profitLossOnRemaining,
      hasActiveSales: bagsSold > 0
    };
  }, [selectedShipment, expenseForm.amount]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-6 w-6" />
            Sources de Ciment - Sélectionnez l'Origine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={originFilter === 'Nigeria' ? 'default' : 'outline'}
              className={`h-auto py-4 flex flex-col gap-2 ${originFilter === 'Nigeria' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              onClick={() => setOriginFilter(originFilter === 'Nigeria' ? 'all' : 'Nigeria')}
            >
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span className="font-bold">Ciment Nigeria (DANGOTE)</span>
              </div>
              <Badge className="bg-orange-600">Vendu du Véhicule</Badge>
              <p className="text-xs opacity-80">{cementShipments.filter(s => s.origin === 'Nigeria').length} cargaison(s)</p>
            </Button>

            <Button
              variant={originFilter === 'Cameroun' ? 'default' : 'outline'}
              className={`h-auto py-4 flex flex-col gap-2 ${originFilter === 'Cameroun' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
              onClick={() => setOriginFilter(originFilter === 'Cameroun' ? 'all' : 'Cameroun')}
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-bold">Ciment Cameroun</span>
              </div>
              <Badge className="bg-blue-600">Vendu de l'Entrepôt</Badge>
              <p className="text-xs opacity-80">{cementShipments.filter(s => s.origin === 'Cameroun').length} cargaison(s)</p>
            </Button>

            <Button
              variant={originFilter === 'Tchad' ? 'default' : 'outline'}
              className={`h-auto py-4 flex flex-col gap-2 ${originFilter === 'Tchad' ? 'bg-green-500 hover:bg-green-600' : ''}`}
              onClick={() => setOriginFilter(originFilter === 'Tchad' ? 'all' : 'Tchad')}
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-bold">Ciment Tchad</span>
              </div>
              <Badge className="bg-green-600">Vendu de l'Entrepôt</Badge>
              <p className="text-xs opacity-80">{cementShipments.filter(s => s.origin === 'Tchad').length} cargaison(s)</p>
            </Button>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOriginFilter('all')}
              className={originFilter === 'all' ? 'font-bold' : ''}
            >
              {originFilter === 'all' ? '✓ ' : ''}Afficher Toutes les Origins
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocationFilter(locationFilter === 'sur véhicule' ? 'all' : 'sur véhicule')}
                className={locationFilter === 'sur véhicule' ? 'bg-orange-100 dark:bg-orange-900/20' : ''}
              >
                <Truck className="h-4 w-4 mr-1" />
                Sur Véhicule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocationFilter(locationFilter === 'en entrepôt' ? 'all' : 'en entrepôt')}
                className={locationFilter === 'en entrepôt' ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
              >
                <Package className="h-4 w-4 mr-1" />
                En Entrepôt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <p className="text-sm text-gray-600 dark:text-gray-300">Sacs Disponibles</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalActiveBags.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
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

      {activeShipments.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base">Cargaisons Actives - Vue Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeShipments.map(shipment => (
                <Card key={shipment.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{shipment.shipmentId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{shipment.vehicleId}</p>
                      </div>
                      <Badge className={`${getStatusColor(shipment.status)} text-white text-xs`}>
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{getRemainingBags(shipment)}</strong> sacs restants
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {getCostPerBag(shipment).toLocaleString()} FCFA/sac
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      Vendre de Cette Cargaison
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Liste des Cargaisons
              <Badge variant="outline" className="ml-2">{cementShipments.length} cargaisons</Badge>
            </CardTitle>
            <div className="flex gap-3">
              <Badge variant="outline" className="ml-2">
                Toutes origines
              </Badge>
              <Button onClick={() => setShowOriginSelector(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Cargaison
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Truck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune cargaison de ciment enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dark:text-gray-200 w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">ID Cargaison</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Véhicule</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Chauffeur</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Origine</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date Arrivée</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Total Sacs</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Sacs Vendus</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Sacs Restants</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Coût Total</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Revenu</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Profit Net</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Marge (%)</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className={`${getRowColor(shipment)} hover:opacity-75 transition-opacity`}>
                      <td className="px-3 py-3">
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{shipment.shipmentId}</p>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">{shipment.vehicleId}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{shipment.driverName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{shipment.driverPhone}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge className={`${getOriginColor(shipment.origin)} text-white`}>
                            {shipment.origin}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            {shipment.location === 'sur véhicule' ? (
                              <><Truck className="h-3 w-3" /> Véhicule</>
                            ) : (
                              <><Package className="h-3 w-3" /> Entrepôt</>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(shipment.expectedArrivalDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-gray-800 dark:text-gray-200">{shipment.totalBags}</td>
                      <td className="px-3 py-3 text-right font-medium text-orange-700">{shipment.bagsSold}</td>
                      <td className="px-3 py-3 text-right font-bold text-green-700">{getRemainingBags(shipment)}</td>
                      <td className="px-3 py-3 text-right text-sm text-purple-700 font-medium">
                        {getTotalCost(shipment).toLocaleString()} FCFA
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-blue-700 font-medium">
                        {shipment.totalRevenue.toLocaleString()} FCFA
                      </td>
                      <td className={`px-3 py-3 text-right text-sm font-bold ${getNetProfit(shipment) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {getNetProfit(shipment).toLocaleString()} FCFA
                      </td>
                      <td className={`px-3 py-3 text-right text-sm font-bold ${getProfitMargin(shipment) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {getProfitMargin(shipment).toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge className={`${getStatusColor(shipment.status)} text-white text-xs capitalize`}>
                          {shipment.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddExpenseDialog(shipment)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Ajouter un frais"
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

      <Dialog open={showOriginSelector} onOpenChange={setShowOriginSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Nouvelle Cargaison - Sélectionnez l'Origine du Ciment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choisissez la provenance du ciment pour afficher le formulaire approprié:
            </p>

            <RadioGroup value={selectedOrigin} onValueChange={(value) => setSelectedOrigin(value as CementOrigin)}>
              <Card className="cursor-pointer hover:border-orange-500 transition-all" onClick={() => setSelectedOrigin('Nigeria')}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="Nigeria" id="origin-nigeria" />
                    <div className="flex-1">
                      <Label htmlFor="origin-nigeria" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-5 w-5 text-orange-500" />
                          <span className="font-bold text-lg">Nigeria (DANGOTE)</span>
                          <Badge className="bg-orange-500">Vendu du Véhicule</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Système spécial: vente directe du véhicule. Marque DANGOTE fixe.
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          ⚠️ Vente du véhicule ou stockage temporaire en saison des pluies
                        </p>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-blue-500 transition-all" onClick={() => setSelectedOrigin('Cameroun')}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="Cameroun" id="origin-cameroun" />
                    <div className="flex-1">
                      <Label htmlFor="origin-cameroun" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-blue-500" />
                          <span className="font-bold text-lg">Cameroun</span>
                          <Badge className="bg-blue-500">Vendu de l'Entrepôt</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Stockage entrepôt standard. Achat international avec transit Cameroun → Tchad.
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          ✓ 9 étapes de frais: Chargement → Transport → Douanes → Stockage
                        </p>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-green-500 transition-all" onClick={() => setSelectedOrigin('Tchad')}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="Tchad" id="origin-tchad" />
                    <div className="flex-1">
                      <Label htmlFor="origin-tchad" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-green-500" />
                          <span className="font-bold text-lg">Tchad (Achat Local)</span>
                          <Badge className="bg-green-500">Vendu de l'Entrepôt</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Achat local N'Djamena. Stockage entrepôt immédiat.
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Économie sur frais internationaux - 6 étapes seulement
                        </p>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowOriginSelector(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setShowOriginSelector(false);
                  setIsNewShipmentDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuer avec {selectedOrigin}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewShipmentDialogOpen} onOpenChange={(open) => {
        setIsNewShipmentDialogOpen(open);
        if (!open) resetShipmentForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Nouvelle Cargaison de Ciment
              <Badge className={`${getOriginColor(selectedOrigin)} text-white`}>
                {selectedOrigin}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base">Section 1 - Informations Cargaison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <Label>ID Cargaison (Auto-généré)</Label>
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{generateShipmentId()}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicleId">ID Véhicule *</Label>
                    <Input
                      id="vehicleId"
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      placeholder="Ex: TC-001"
                      required
                    />
                  </div>
                  <div>
                    <Label>Origine</Label>
                    <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-600 border rounded-md">
                      <Badge className="bg-orange-500 text-white">
                        {selectedOrigin}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Fournisseur *</Label>
                    {selectedOrigin === 'Nigeria' ? (
                      <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-600 border rounded-md">
                        <span className="font-semibold">DANGOTE</span>
                      </div>
                    ) : (
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="Nom du fournisseur"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driverName">Nom du Chauffeur *</Label>
                    <Input
                      id="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Ex: Ibrahim Musa"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverPhone">Téléphone du Chauffeur</Label>
                    <Input
                      id="driverPhone"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
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
                    <Label htmlFor="bankPaymentDate">Date de Paiement Banque *</Label>
                    <Input
                      id="bankPaymentDate"
                      type="date"
                      value={formData.bankPaymentDate}
                      onChange={(e) => setFormData({ ...formData, bankPaymentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentReceiptNumber">N° Reçu de Paiement *</Label>
                    <Input
                      id="paymentReceiptNumber"
                      value={formData.paymentReceiptNumber}
                      onChange={(e) => setFormData({ ...formData, paymentReceiptNumber: e.target.value })}
                      placeholder="Ex: REC-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amountPaid">Montant Payé (FCFA) *</Label>
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="departureDate">Date de Départ *</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
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
                    <Label htmlFor="status">Statut *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as CementShipmentStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en route">En Route</SelectItem>
                        <SelectItem value="arrivé">Arrivé</SelectItem>
                        <SelectItem value="disponible à la vente">Disponible à la Vente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base">Section 2 - Détails Ciment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cementType">Type de Ciment *</Label>
                    <Select
                      value={formData.cementType}
                      onValueChange={(value) => setFormData({ ...formData, cementType: value as CementType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Portland">Portland</SelectItem>
                        <SelectItem value="Composé">Composé</SelectItem>
                        <SelectItem value="Blanc">Blanc</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand">Marque *</Label>
                    {selectedOrigin === 'Nigeria' ? (
                      <div className="h-10 flex items-center px-3 bg-gray-100 dark:bg-gray-600 border rounded-md">
                        <span className="font-semibold">DANGOTE</span>
                      </div>
                    ) : (
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Ex: CIMAF, CIMENCAM"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weightPerBag">Poids par Sac (kg) *</Label>
                    <Input
                      id="weightPerBag"
                      type="number"
                      value={formData.weightPerBag}
                      onChange={(e) => setFormData({ ...formData, weightPerBag: parseInt(e.target.value) || 50 })}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalBags">Nombre Total de Sacs *</Label>
                    <Input
                      id="totalBags"
                      type="number"
                      value={formData.totalBags || ''}
                      onChange={(e) => setFormData({ ...formData, totalBags: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricePerBag">Prix d'Achat par Sac (FCFA) *</Label>
                    <Input
                      id="pricePerBag"
                      type="number"
                      value={formData.pricePerBag || ''}
                      onChange={(e) => setFormData({ ...formData, pricePerBag: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label>Prix d'Achat Total</Label>
                    <div className="h-10 flex items-center px-3 bg-white border rounded-md">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {(formData.totalBags * formData.pricePerBag).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-base">Section 3 - Coût Initial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Prix d'Achat Total:</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(formData.totalBags * formData.pricePerBag).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-orange-600 font-medium">
                    Les frais supplémentaires seront ajoutés pendant le transport
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-base">Section 4 - Localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedOrigin === 'Nigeria' ? (
                  <>
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded border border-orange-300">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-400">
                        ⚠️ DANGOTE Nigeria: Vente directe du véhicule. Utiliser POS spécial ciment.
                      </p>
                    </div>
                    <div>
                      <Label>Emplacement *</Label>
                      <RadioGroup
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value as LocationType })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sur véhicule" id="vehicle" />
                          <Label htmlFor="vehicle">Sur Véhicule</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="en entrepôt" id="warehouse" />
                          <Label htmlFor="warehouse">En Entrepôt (Saison des Pluies)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.location === 'en entrepôt' && (
                      <div>
                        <Label htmlFor="storageReason">Raison de Stockage</Label>
                        <Select
                          value={formData.storageReason}
                          onValueChange={(value) => setFormData({ ...formData, storageReason: value as StorageReason })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saison des pluies">Saison des Pluies</SelectItem>
                            <SelectItem value="surplus">Surplus</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={`p-4 rounded border ${
                      selectedOrigin === 'Cameroun'
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300'
                        : 'bg-green-100 dark:bg-green-900/30 border-green-300'
                    }`}>
                      <div className="flex items-start gap-2">
                        <Package className={`h-5 w-5 flex-shrink-0 ${
                          selectedOrigin === 'Cameroun' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                        <div>
                          <p className={`font-bold ${
                            selectedOrigin === 'Cameroun'
                              ? 'text-blue-800 dark:text-blue-400'
                              : 'text-green-800 dark:text-green-400'
                          }`}>
                            ✓ Emplacement: En Entrepôt (Fixe)
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {selectedOrigin === 'Cameroun'
                              ? 'Ce ciment sera stocké en entrepôt et vendu depuis l\'inventaire standard.'
                              : 'Achat local - stocké en entrepôt et vendu depuis l\'inventaire standard.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedOrigin === 'Tchad' && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          ✓ Pas de frais de douane pour achat local
                        </p>
                      </div>
                    )}
                  </>
                )}
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
                <p className="font-bold text-gray-800 dark:text-gray-200">{selectedShipment.shipmentId} - {selectedShipment.vehicleId}</p>
              </div>

              {hasActiveSales(selectedShipment) && (
                <Card className="bg-yellow-50 border-yellow-400 border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-yellow-800 mb-1">Attention: Ventes Actives</p>
                        <p className="text-sm text-yellow-700">
                          Cette cargaison a déjà des ventes. L'ajout de frais réduira la marge bénéficiaire.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, type: value as CementShipmentExpense['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getExpenseStagesByOrigin(selectedShipment.origin).map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
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

              {calculateExpenseImpact && (
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-300 border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Impact sur la Rentabilité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800">
                      <p className="text-xs text-gray-600 mb-2">Coût par Sac:</p>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Ancien:</p>
                          <p className="font-bold">{calculateExpenseImpact.currentCostPerBag.toLocaleString()} FCFA</p>
                        </div>
                        <div className="text-red-600 dark:text-red-400">→</div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Nouveau:</p>
                          <p className="font-bold text-red-600 dark:text-red-400">{calculateExpenseImpact.newCostPerBag.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Impact sur Profit:</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        -{calculateExpenseImpact.profitMarginReduction.toFixed(1)}%
                      </p>
                    </div>

                    {calculateExpenseImpact.hasActiveSales && (
                      <div className="space-y-2">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-red-200 dark:border-red-800 text-sm">
                          <p className="text-gray-600 dark:text-gray-300">Sacs vendus: {calculateExpenseImpact.bagsSold}</p>
                          <p className="text-red-600 font-bold">
                            Perte: -{calculateExpenseImpact.profitLossOnSold.toLocaleString()} FCFA
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded border border-orange-200 dark:border-orange-800 text-sm">
                          <p className="text-gray-600 dark:text-gray-300">Sacs restants: {calculateExpenseImpact.bagsRemaining}</p>
                          <p className="text-orange-600 font-bold">
                            Impact futur: -{calculateExpenseImpact.profitLossOnRemaining.toLocaleString()} FCFA
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Détails de la Cargaison
              {selectedShipment && (
                <Badge className={`${getOriginColor(selectedShipment.origin)} text-white ml-2`}>
                  {selectedShipment.origin} - {getOriginBadge(selectedShipment.origin)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">N° Cargaison</p>
                      <p className="font-bold">{selectedShipment.shipmentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Origine</p>
                      <Badge className={`${getOriginColor(selectedShipment.origin)} text-white`}>
                        {selectedShipment.origin}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Emplacement</p>
                      <div className="flex items-center gap-1">
                        {selectedShipment.location === 'sur véhicule' ? (
                          <><Truck className="h-4 w-4" /> Sur Véhicule</>
                        ) : (
                          <><Package className="h-4 w-4" /> En Entrepôt</>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                      <Badge className={`${getStatusColor(selectedShipment.status)} text-white`}>
                        {selectedShipment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">N° Reçu Paiement</p>
                      <p className="font-medium">{selectedShipment.paymentReceiptNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Montant Payé</p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {selectedShipment.amountPaid.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sacs</p>
                      <p className="text-2xl font-bold">{selectedShipment.totalBags}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sacs Vendus</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedShipment.bagsSold}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sacs Restants</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getRemainingBags(selectedShipment)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analyse Financière</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Coût d'Achat</span>
                      <span className="font-medium">{selectedShipment.basePurchasePrice.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Frais Supplémentaires</span>
                      <span className="font-medium">
                        {selectedShipment.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Coût Total</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {getTotalCost(selectedShipment).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Revenu</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {selectedShipment.totalRevenue.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Profit Net</span>
                      <span className={`font-bold ${getNetProfit(selectedShipment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getNetProfit(selectedShipment).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Marge</span>
                      <span className={`font-bold ${getProfitMargin(selectedShipment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {getProfitMargin(selectedShipment).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
