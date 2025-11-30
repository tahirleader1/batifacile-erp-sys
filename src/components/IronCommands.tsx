import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Truck, Weight, Package, AlertCircle, CheckCircle, TrendingDown, TrendingUp, Plus, Eye, DollarSign, Receipt, Trash2 } from 'lucide-react';
import { IronCommand, IronCommandStatus, IronDiameter, IronCommandItem, IronCommandExpense, IronExpenseStage, IronReception, IronDiscrepancy } from '../types';

export function IronCommands() {
  const { ironCommands, addIronCommand, addExpenseToIronCommand, receiveIronCommand, updateIronCommand, addProduct } = useApp();
  const [isNewCommandDialogOpen, setIsNewCommandDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isReceptionDialogOpen, setIsReceptionDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<IronCommand | null>(null);

  const [formData, setFormData] = useState({
    supplier: '',
    originCountry: 'Nigeria',
    orderDate: new Date().toISOString().split('T')[0],
    bankPaymentDate: '',
    paymentReference: '',
    amountPaid: 0,
    status: 'commandé' as IronCommandStatus,
    departureNigeriaDate: '',
    expectedArrivalTchad: '',
    vehicleNigeria: '',
    driverNigeria: ''
  });

  const [commandItems, setCommandItems] = useState<IronCommandItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    diameter: 10 as IronDiameter,
    quantity: 0,
    unitPrice: 0
  });

  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    stage: 'arrivée cameroun - transbordement' as IronExpenseStage,
    type: '',
    description: '',
    amount: '',
    location: '',
    customsReference: '',
    vehicleNumber: ''
  });

  const [receptionForm, setReceptionForm] = useState<{
    date: string;
    location: string;
    responsiblePerson: string;
    receivedQuantities: Record<number, number>;
    missingItemsCompensation: boolean;
    missingItemsNotes: string;
    extraItemsDeduction: boolean;
    extraItemsNotes: string;
    offloadingCost: number;
    numberOfWorkers: number;
    offloadingDateTime: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    location: '',
    responsiblePerson: '',
    receivedQuantities: {},
    missingItemsCompensation: false,
    missingItemsNotes: '',
    extraItemsDeduction: false,
    extraItemsNotes: '',
    offloadingCost: 0,
    numberOfWorkers: 0,
    offloadingDateTime: new Date().toISOString()
  });

  const generateCommandNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = ironCommands.length + 1;
    return `FER-${dateStr}-${String(count).padStart(3, '0')}`;
  };

  const addItemToCommand = () => {
    if (currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Veuillez entrer une quantité et un prix valides');
      return;
    }

    const existingItem = commandItems.find(i => i.diameter === currentItem.diameter);
    if (existingItem) {
      alert('Ce diamètre est déjà ajouté. Modifiez-le directement dans la liste.');
      return;
    }

    const newItem: IronCommandItem = {
      diameter: currentItem.diameter,
      quantityOrdered: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      subtotal: currentItem.quantity * currentItem.unitPrice
    };

    setCommandItems([...commandItems, newItem].sort((a, b) => a.diameter - b.diameter));
    setCurrentItem({ diameter: 10, quantity: 0, unitPrice: 0 });
  };

  const removeItemFromCommand = (diameter: IronDiameter) => {
    setCommandItems(commandItems.filter(i => i.diameter !== diameter));
  };

  const getTotalTonnage = () => {
    return commandItems.reduce((sum, i) => sum + i.quantityOrdered, 0);
  };

  const getTotalAmount = () => {
    return commandItems.reduce((sum, i) => sum + i.subtotal, 0);
  };

  const handleSubmitCommand = () => {
    if (!formData.supplier || !formData.bankPaymentDate || !formData.paymentReference || commandItems.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un article');
      return;
    }

    const command: IronCommand = {
      id: Date.now().toString(),
      commandNumber: generateCommandNumber(),
      supplier: formData.supplier,
      originCountry: formData.originCountry,
      orderDate: formData.orderDate,
      bankPaymentDate: formData.bankPaymentDate,
      paymentReference: formData.paymentReference,
      amountPaid: formData.amountPaid,
      status: formData.status,
      items: commandItems,
      totalTonnageOrdered: getTotalTonnage(),
      totalTonnageReceived: 0,
      departureNigeriaDate: formData.departureNigeriaDate,
      expectedArrivalTchad: formData.expectedArrivalTchad,
      vehicleNigeria: formData.vehicleNigeria,
      driverNigeria: formData.driverNigeria,
      expenses: []
    };

    addIronCommand(command);
    resetCommandForm();
    setIsNewCommandDialogOpen(false);
  };

  const resetCommandForm = () => {
    setFormData({
      supplier: '',
      originCountry: 'Nigeria',
      orderDate: new Date().toISOString().split('T')[0],
      bankPaymentDate: '',
      paymentReference: '',
      amountPaid: 0,
      status: 'commandé',
      departureNigeriaDate: '',
      expectedArrivalTchad: '',
      vehicleNigeria: '',
      driverNigeria: ''
    });
    setCommandItems([]);
  };

  const openAddExpenseDialog = (command: IronCommand) => {
    setSelectedCommand(command);
    setIsAddExpenseDialogOpen(true);
  };

  const openReceptionDialog = (command: IronCommand) => {
    setSelectedCommand(command);
    const initialQuantities: Record<number, number> = {};
    command.items.forEach(item => {
      initialQuantities[item.diameter] = item.quantityOrdered;
    });
    setReceptionForm({
      ...receptionForm,
      receivedQuantities: initialQuantities
    });
    setIsReceptionDialogOpen(true);
  };

  const handleAddExpense = () => {
    if (!selectedCommand || !expenseForm.description || !expenseForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expense: IronCommandExpense = {
      id: Date.now().toString(),
      date: expenseForm.date,
      stage: expenseForm.stage,
      type: expenseForm.type,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      location: expenseForm.location || undefined,
      customsReference: expenseForm.customsReference || undefined,
      vehicleNumber: expenseForm.vehicleNumber || undefined,
      addedBy: 'Administrateur'
    };

    addExpenseToIronCommand(selectedCommand.id, expense);

    if (expenseForm.vehicleNumber && expenseForm.stage === 'arrivée cameroun - transbordement') {
      updateIronCommand(selectedCommand.id, { vehicleCameroun: expenseForm.vehicleNumber });
    }

    resetExpenseForm();
    setIsAddExpenseDialogOpen(false);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      stage: 'arrivée cameroun - transbordement',
      type: '',
      description: '',
      amount: '',
      location: '',
      customsReference: '',
      vehicleNumber: ''
    });
  };

  const handleReceiveCommand = () => {
    if (!selectedCommand || !receptionForm.location || !receptionForm.responsiblePerson) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const discrepancies: IronDiscrepancy[] = selectedCommand.items.map(item => {
      const received = receptionForm.receivedQuantities[item.diameter] || 0;
      const difference = received - item.quantityOrdered;
      let status: 'conforme' | 'manquant' | 'excédent' = 'conforme';

      if (difference < 0) status = 'manquant';
      else if (difference > 0) status = 'excédent';

      return {
        diameter: item.diameter,
        ordered: item.quantityOrdered,
        received,
        difference,
        status
      };
    });

    const reception: IronReception = {
      date: receptionForm.date,
      location: receptionForm.location,
      responsiblePerson: receptionForm.responsiblePerson,
      discrepancies,
      missingItemsCompensation: receptionForm.missingItemsCompensation,
      missingItemsNotes: receptionForm.missingItemsNotes,
      extraItemsDeduction: receptionForm.extraItemsDeduction,
      extraItemsNotes: receptionForm.extraItemsNotes,
      offloadingCost: receptionForm.offloadingCost,
      numberOfWorkers: receptionForm.numberOfWorkers,
      offloadingDateTime: receptionForm.offloadingDateTime
    };

    receiveIronCommand(selectedCommand.id, reception);

    const totalCost = getTotalCost(selectedCommand) + receptionForm.offloadingCost;
    const totalReceivedTonnage = discrepancies.reduce((sum, d) => sum + d.received, 0);
    const costPerTonne = totalReceivedTonnage > 0 ? totalCost / totalReceivedTonnage : 0;

    discrepancies.forEach(disc => {
      if (disc.received > 0) {
        const ironProduct = {
          id: `iron-${selectedCommand.id}-${disc.diameter}-${Date.now()}`,
          name: `Fer à béton HA ${disc.diameter}mm`,
          category: 'fer' as const,
          attributes: {
            type: 'Haute Adhérence',
            size: `${disc.diameter}mm`,
            length: '12m',
            weight: `${(disc.diameter * disc.diameter * 0.00617).toFixed(2)}kg/m`,
            brand: selectedCommand.supplier
          },
          wholesalePrice: Math.round(costPerTonne * 1.15 * 1000),
          retailPrice: Math.round(costPerTonne * 1.30 * 1000),
          stockQuantity: disc.received * 1000,
          location: 'magasin' as const,
          unit: 'kg',
          sourceType: 'iron_command' as const,
          sourceId: selectedCommand.id,
          supplier: selectedCommand.supplier,
          costPerUnit: costPerTonne,
          warehouseLocation: receptionForm.location,
          addedDate: receptionForm.date
        };
        addProduct(ironProduct);
      }
    });

    alert(`✓ Réception confirmée! ${discrepancies.length} articles ajoutés à l'inventaire.`);
    setIsReceptionDialogOpen(false);
  };

  const getTotalExpenses = (command: IronCommand) => {
    return command.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalCost = (command: IronCommand) => {
    return command.amountPaid + getTotalExpenses(command);
  };

  const getDiscrepancyPercentage = (command: IronCommand) => {
    if (command.totalTonnageOrdered === 0) return 0;
    return ((command.totalTonnageReceived - command.totalTonnageOrdered) / command.totalTonnageOrdered) * 100;
  };

  const getStatusColor = (status: IronCommandStatus) => {
    const colors = {
      'commandé': 'bg-gray-500',
      'payé': 'bg-gray-600',
      'en transit nigeria': 'bg-blue-500',
      'en transit cameroun': 'bg-blue-600',
      'en transit tchad': 'bg-blue-700',
      'arrivé': 'bg-yellow-500',
      'en déchargement': 'bg-yellow-600',
      'vérifié': 'bg-green-500',
      'clôturé': 'bg-emerald-700'
    };
    return colors[status];
  };

  const getRowColor = (command: IronCommand) => {
    if (!command.reception) return 'bg-gray-50';

    const discrepancyPct = Math.abs(getDiscrepancyPercentage(command));

    if (command.status === 'vérifié' && discrepancyPct === 0) return 'bg-green-50';
    if (discrepancyPct > 5) return 'bg-red-50';
    if (discrepancyPct > 0) return 'bg-orange-50';
    if (command.status.includes('transit')) return 'bg-blue-50';

    return 'bg-gray-50';
  };

  const activeCommands = ironCommands.filter(c =>
    ['en transit nigeria', 'en transit cameroun', 'en transit tchad', 'arrivé', 'en déchargement'].includes(c.status)
  );

  const totalActiveValue = activeCommands.reduce((sum, c) => sum + getTotalCost(c), 0);
  const totalActiveTonnage = activeCommands.reduce((sum, c) => sum + c.totalTonnageOrdered, 0);

  const verifiedCommands = ironCommands.filter(c => c.status === 'vérifié' || c.status === 'clôturé');
  const conformanceRate = verifiedCommands.length > 0
    ? (verifiedCommands.filter(c => Math.abs(getDiscrepancyPercentage(c)) < 2).length / verifiedCommands.length) * 100
    : 0;

  const getExpenseTypesByStage = (stage: IronExpenseStage): string[] => {
    const types = {
      'arrivée cameroun - transbordement': ['Main d\'Œuvre Chargement', 'Location Véhicule Cameroun', 'Autre'],
      'transport cameroun → tchad': ['Frais de Transport', 'Carburant', 'Péage', 'Autre'],
      'frais frontaliers et douanes': ['Sortie Nigeria', 'Douane Cameroun', 'Bascule', 'Douane Tchad', 'Autre'],
      'arrivée tchad': ['Main d\'Œuvre Déchargement', 'Gardiennage', 'Stockage', 'Autre'],
      'autres frais': ['Autre']
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
                <p className="text-sm text-gray-600 dark:text-gray-300">Commandes En Cours</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCommands.length}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tonnage En Transit</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalActiveTonnage.toFixed(1)} T</p>
              </div>
              <Weight className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valeur des Commandes</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalActiveValue.toLocaleString()} FCFA</p>
              </div>
              <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Taux de Conformité</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{conformanceRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-6 w-6" />
              Commandes de Fer
              <Badge variant="outline" className="ml-2">{ironCommands.length} commandes</Badge>
            </CardTitle>
            <Button onClick={() => setIsNewCommandDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Commande de Fer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ironCommands.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Weight className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune commande de fer enregistrée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dark:text-gray-200 w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">N° Commande</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Fournisseur</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date Commande</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date Paiement</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Tonnage Commandé</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Tonnage Reçu</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Écart</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Coût Total</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ironCommands.map((command) => (
                    <tr key={command.id} className={`${getRowColor(command)} hover:opacity-75 transition-opacity`}>
                      <td className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200">{command.commandNumber}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{command.supplier}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                        {new Date(command.orderDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                        {new Date(command.bankPaymentDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-blue-700">
                        {command.totalTonnageOrdered.toFixed(2)} T
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">
                        {command.totalTonnageReceived > 0 ? `${command.totalTonnageReceived.toFixed(2)} T` : '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {command.totalTonnageReceived > 0 ? (
                          <span className={`font-bold ${
                            command.totalTonnageReceived < command.totalTonnageOrdered ? 'text-red-600' :
                            command.totalTonnageReceived > command.totalTonnageOrdered ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {(command.totalTonnageReceived - command.totalTonnageOrdered).toFixed(2)} T
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`${getStatusColor(command.status)} text-white text-xs capitalize`}>
                          {command.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-purple-700">
                        {getTotalCost(command).toLocaleString()} FCFA
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddExpenseDialog(command)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Ajouter frais"
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          {(command.status === 'arrivé' || command.status === 'en déchargement') && !command.reception && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReceptionDialog(command)}
                              className="text-green-600 hover:text-green-700"
                              title="Réception"
                            >
                              <Package className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCommand(command);
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

      <Dialog open={isNewCommandDialogOpen} onOpenChange={(open) => {
        setIsNewCommandDialogOpen(open);
        if (!open) resetCommandForm();
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Commande de Fer</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base">Section 1 - Informations Commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <Label>N° Commande (Auto-généré)</Label>
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{generateCommandNumber()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Fournisseur *</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="Ex: Nigerian Iron Works Ltd"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originCountry">Pays d'Origine</Label>
                    <Input
                      id="originCountry"
                      value={formData.originCountry}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="bankPaymentDate">Date de Paiement Bancaire *</Label>
                    <Input
                      id="bankPaymentDate"
                      type="date"
                      value={formData.bankPaymentDate}
                      onChange={(e) => setFormData({ ...formData, bankPaymentDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentReference">Référence Paiement *</Label>
                    <Input
                      id="paymentReference"
                      value={formData.paymentReference}
                      onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                      placeholder="Ex: TRF-2024-001"
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

                <div>
                  <Label htmlFor="status">Statut Initial</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as IronCommandStatus })}
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
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base">Section 2 - Composition de la Commande (par diamètre de fer)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <Label>Diamètre (mm)</Label>
                    <Select
                      value={currentItem.diameter.toString()}
                      onValueChange={(value) => setCurrentItem({ ...currentItem, diameter: parseInt(value) as IronDiameter })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 8, 10, 12, 14, 16, 20, 25, 32, 40].map(d => (
                          <SelectItem key={d} value={d.toString()}>{d} mm</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>Quantité (tonnes)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentItem.quantity || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Prix Unitaire/Tonne (FCFA)</Label>
                    <Input
                      type="number"
                      value={currentItem.unitPrice || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3 flex items-end">
                    <Button onClick={addItemToCommand} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {commandItems.length > 0 && (
                  <div className="border-t pt-4">
                    <table className="dark:text-gray-200 w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-2 py-2 text-left">Diamètre</th>
                          <th className="px-2 py-2 text-right">Quantité (T)</th>
                          <th className="px-2 py-2 text-right">Prix Unit.</th>
                          <th className="px-2 py-2 text-right">Sous-total</th>
                          <th className="px-2 py-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandItems.map((item) => (
                          <tr key={item.diameter} className="border-b">
                            <td className="px-2 py-2 font-medium">{item.diameter} mm</td>
                            <td className="px-2 py-2 text-right">{item.quantityOrdered.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                            <td className="px-2 py-2 text-right font-bold">{item.subtotal.toLocaleString()} FCFA</td>
                            <td className="px-2 py-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItemFromCommand(item.diameter)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                        <tr>
                          <td className="px-2 py-2">Total:</td>
                          <td className="px-2 py-2 text-right text-blue-600 dark:text-blue-400">{getTotalTonnage().toFixed(2)} T</td>
                          <td className="px-2 py-2"></td>
                          <td className="px-2 py-2 text-right text-green-600 dark:text-green-400">{getTotalAmount().toLocaleString()} FCFA</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-base">Section 3 - Informations Transport</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureNigeriaDate">Date de Départ Nigeria</Label>
                    <Input
                      id="departureNigeriaDate"
                      type="date"
                      value={formData.departureNigeriaDate}
                      onChange={(e) => setFormData({ ...formData, departureNigeriaDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedArrivalTchad">Date d'Arrivée Prévue Tchad</Label>
                    <Input
                      id="expectedArrivalTchad"
                      type="date"
                      value={formData.expectedArrivalTchad}
                      onChange={(e) => setFormData({ ...formData, expectedArrivalTchad: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleNigeria">N° Véhicule Nigeria</Label>
                    <Input
                      id="vehicleNigeria"
                      value={formData.vehicleNigeria}
                      onChange={(e) => setFormData({ ...formData, vehicleNigeria: e.target.value })}
                      placeholder="Ex: NG-XXX-YYY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverNigeria">Chauffeur Nigeria</Label>
                    <Input
                      id="driverNigeria"
                      value={formData.driverNigeria}
                      onChange={(e) => setFormData({ ...formData, driverNigeria: e.target.value })}
                      placeholder="Nom du chauffeur"
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
                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm text-orange-600 font-medium">
                    Les frais de transport et douane seront ajoutés progressivement
                  </p>
                  <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                    <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Transport au Nigeria est INCLUS dans le prix fournisseur
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmitCommand} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12">
                Enregistrer Commande
              </Button>
              <Button variant="outline" onClick={() => setIsNewCommandDialogOpen(false)}>
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
          {selectedCommand && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">Commande:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">{selectedCommand.commandNumber} - {selectedCommand.supplier}</p>
              </div>

              <div>
                <Label htmlFor="expenseStage">Étape *</Label>
                <Select
                  value={expenseForm.stage}
                  onValueChange={(value) => {
                    setExpenseForm({ ...expenseForm, stage: value as IronExpenseStage, type: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrivée cameroun - transbordement">Arrivée Cameroun - Transbordement</SelectItem>
                    <SelectItem value="transport cameroun → tchad">Transport Cameroun → Tchad</SelectItem>
                    <SelectItem value="frais frontaliers et douanes">Frais Frontaliers et Douanes</SelectItem>
                    <SelectItem value="arrivée tchad">Arrivée Tchad</SelectItem>
                    <SelectItem value="autres frais">Autres Frais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expenseType">Type de Frais *</Label>
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

              {expenseForm.stage === 'arrivée cameroun - transbordement' && expenseForm.type === 'Location Véhicule Cameroun' && (
                <div>
                  <Label htmlFor="vehicleNumber">N° Véhicule Cameroun</Label>
                  <Input
                    id="vehicleNumber"
                    value={expenseForm.vehicleNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vehicleNumber: e.target.value })}
                    placeholder="Ex: CM-XXX-YYY"
                  />
                </div>
              )}

              {expenseForm.stage === 'frais frontaliers et douanes' && (
                <>
                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Select
                      value={expenseForm.location}
                      onValueChange={(value) => setExpenseForm({ ...expenseForm, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Frontière Nigeria-Cameroun">Frontière Nigeria-Cameroun</SelectItem>
                        <SelectItem value="Frontière Cameroun-Tchad">Frontière Cameroun-Tchad</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="customsReference">N° Référence Douane</Label>
                    <Input
                      id="customsReference"
                      value={expenseForm.customsReference}
                      onChange={(e) => setExpenseForm({ ...expenseForm, customsReference: e.target.value })}
                      placeholder="Optionnel"
                    />
                  </div>
                </>
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

      <Dialog open={isReceptionDialogOpen} onOpenChange={setIsReceptionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réception et Vérification de la Commande</DialogTitle>
          </DialogHeader>
          {selectedCommand && (
            <div className="space-y-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-sm">Section 1 - Date et Lieu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="receptionDate">Date de Réception *</Label>
                      <Input
                        id="receptionDate"
                        type="date"
                        value={receptionForm.date}
                        onChange={(e) => setReceptionForm({ ...receptionForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="receptionLocation">Lieu de Déchargement *</Label>
                      <Input
                        id="receptionLocation"
                        value={receptionForm.location}
                        onChange={(e) => setReceptionForm({ ...receptionForm, location: e.target.value })}
                        placeholder="Ex: Entrepôt Principal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="responsiblePerson">Responsable Réception *</Label>
                      <Input
                        id="responsiblePerson"
                        value={receptionForm.responsiblePerson}
                        onChange={(e) => setReceptionForm({ ...receptionForm, responsiblePerson: e.target.value })}
                        placeholder="Nom"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-sm">Section 2 - Vérification par Diamètre</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="dark:text-gray-200 w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th className="px-2 py-2 text-left">Diamètre</th>
                        <th className="px-2 py-2 text-right">Commandé (T)</th>
                        <th className="px-2 py-2 text-center">Reçu (T)</th>
                        <th className="px-2 py-2 text-right">Écart</th>
                        <th className="px-2 py-2 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCommand.items.map((item) => {
                        const received = receptionForm.receivedQuantities[item.diameter] || item.quantityOrdered;
                        const difference = received - item.quantityOrdered;
                        return (
                          <tr key={item.diameter} className="border-b">
                            <td className="px-2 py-2 font-medium">{item.diameter} mm</td>
                            <td className="px-2 py-2 text-right">{item.quantityOrdered.toFixed(2)}</td>
                            <td className="px-2 py-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={received}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setReceptionForm({
                                    ...receptionForm,
                                    receivedQuantities: {
                                      ...receptionForm.receivedQuantities,
                                      [item.diameter]: val
                                    }
                                  });
                                }}
                                className="text-center"
                              />
                            </td>
                            <td className={`px-2 py-2 text-right font-bold ${
                              difference < 0 ? 'text-red-600' :
                              difference > 0 ? 'text-blue-600' :
                              'text-green-600'
                            }`}>
                              {difference.toFixed(2)}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {difference === 0 ? (
                                <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                              ) : difference < 0 ? (
                                <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                      <tr>
                        <td className="px-2 py-2">Total:</td>
                        <td className="px-2 py-2 text-right text-blue-600 dark:text-blue-400">
                          {selectedCommand.totalTonnageOrdered.toFixed(2)} T
                        </td>
                        <td className="px-2 py-2 text-center text-green-600 dark:text-green-400">
                          {Object.values(receptionForm.receivedQuantities).reduce((sum, q) => sum + q, 0).toFixed(2)} T
                        </td>
                        <td className="px-2 py-2 text-right">
                          {(Object.values(receptionForm.receivedQuantities).reduce((sum, q) => sum + q, 0) - selectedCommand.totalTonnageOrdered).toFixed(2)} T
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-sm">Section 3 - Gestion des Écarts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="missingCompensation"
                        checked={receptionForm.missingItemsCompensation}
                        onCheckedChange={(checked) =>
                          setReceptionForm({ ...receptionForm, missingItemsCompensation: !!checked })
                        }
                      />
                      <Label htmlFor="missingCompensation">
                        Le fournisseur compensera lors de la prochaine commande
                      </Label>
                    </div>
                    <Textarea
                      placeholder="Notes sur les articles manquants"
                      value={receptionForm.missingItemsNotes}
                      onChange={(e) => setReceptionForm({ ...receptionForm, missingItemsNotes: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="extraDeduction"
                        checked={receptionForm.extraItemsDeduction}
                        onCheckedChange={(checked) =>
                          setReceptionForm({ ...receptionForm, extraItemsDeduction: !!checked })
                        }
                      />
                      <Label htmlFor="extraDeduction">
                        Montant sera déduit de la prochaine commande
                      </Label>
                    </div>
                    <Textarea
                      placeholder="Notes sur les articles excédentaires"
                      value={receptionForm.extraItemsNotes}
                      onChange={(e) => setReceptionForm({ ...receptionForm, extraItemsNotes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm">Section 4 - Frais de Déchargement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="offloadingCost">Frais Main d'Œuvre (FCFA)</Label>
                      <Input
                        id="offloadingCost"
                        type="number"
                        value={receptionForm.offloadingCost || ''}
                        onChange={(e) => setReceptionForm({ ...receptionForm, offloadingCost: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numberOfWorkers">Nombre de Travailleurs</Label>
                      <Input
                        id="numberOfWorkers"
                        type="number"
                        value={receptionForm.numberOfWorkers || ''}
                        onChange={(e) => setReceptionForm({ ...receptionForm, numberOfWorkers: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="offloadingDateTime">Date et Heure</Label>
                      <Input
                        id="offloadingDateTime"
                        type="datetime-local"
                        value={receptionForm.offloadingDateTime.substring(0, 16)}
                        onChange={(e) => setReceptionForm({ ...receptionForm, offloadingDateTime: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleReceiveCommand} className="flex-1 bg-green-600 hover:bg-green-700 h-12">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer Réception
                </Button>
                <Button variant="outline" onClick={() => setIsReceptionDialogOpen(false)}>
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
              Détails de la Commande
            </DialogTitle>
          </DialogHeader>
          {selectedCommand && (
            <div className="space-y-4">
              <p className="text-center text-gray-500 dark:text-gray-400">Les détails complets seront affichés ici</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
