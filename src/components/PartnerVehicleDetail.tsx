import { useState, useEffect, FormEvent } from 'react';
import { ArrowLeft, Copy, Trash2, CheckCircle2, Edit, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PartnerVehicle, PartnerExpense, PartnerSale, PartnerVehicleStatus } from '../types/partner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PartnerVehicleDetailProps {
  vehicleId: string;
  onBack: () => void;
  onDeleted: () => void;
}

export function PartnerVehicleDetail({ vehicleId, onBack, onDeleted }: PartnerVehicleDetailProps) {
  const [vehicle, setVehicle] = useState<PartnerVehicle | null>(null);
  const [expenses, setExpenses] = useState<PartnerExpense[]>([]);
  const [sales, setSales] = useState<PartnerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PartnerExpense | null>(null);
  const [editingSale, setEditingSale] = useState<PartnerSale | null>(null);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('partner_vehicles')
        .select('*')
        .eq('id', vehicleId)
        .maybeSingle();

      if (vehicleError) throw vehicleError;
      if (!vehicleData) {
        console.error('Vehicle not found');
        return;
      }

      const { data: expensesData } = await supabase
        .from('partner_expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      const { data: salesData } = await supabase
        .from('partner_sales')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      setVehicle({
        id: vehicleData.id,
        partnerName: vehicleData.partner_name,
        partnerPhone: vehicleData.partner_phone,
        partnerEmail: vehicleData.partner_email,
        vehiclePlate: vehicleData.vehicle_plate,
        driverName: vehicleData.driver_name,
        driverPhone: vehicleData.driver_phone,
        totalBags: vehicleData.total_bags,
        soldBags: vehicleData.sold_bags,
        remainingBags: vehicleData.remaining_bags,
        arrivalDate: new Date(vehicleData.arrival_date),
        status: vehicleData.status as PartnerVehicleStatus,
        accessPin: vehicleData.access_pin,
        expenses: [],
        sales: [],
        createdAt: new Date(vehicleData.created_at),
      });

      setExpenses(
        (expensesData || []).map(e => ({
          id: e.id,
          description: e.description,
          amount: parseFloat(e.amount),
          date: new Date(e.date),
        }))
      );

      setSales(
        (salesData || []).map(s => ({
          id: s.id,
          bagsSold: s.bags_sold,
          pricePerBag: parseFloat(s.price_per_bag || '0'),
          date: new Date(s.date),
          notes: s.notes,
        }))
      );
    } catch (error) {
      console.error('Error loading vehicle details:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const copyAccessPin = () => {
    if (vehicle) {
      navigator.clipboard.writeText(vehicle.accessPin);
      showSuccess('✓ Code copié!');
    }
  };

  const regenerateAccessPin = async () => {
    if (!vehicle) return;

    const newPin = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const { error } = await supabase
        .from('partner_vehicles')
        .update({ access_pin: newPin })
        .eq('id', vehicleId);

      if (error) throw error;

      setVehicle({ ...vehicle, accessPin: newPin });
      showSuccess(`✓ Nouveau code généré: ${newPin}`);
    } catch (error) {
      console.error('Error regenerating PIN:', error);
    }
  };

  const markAsClosed = async () => {
    if (!vehicle) return;

    try {
      const { error } = await supabase
        .from('partner_vehicles')
        .update({ status: 'Clôturé' })
        .eq('id', vehicleId);

      if (error) throw error;

      setVehicle({ ...vehicle, status: 'Clôturé' });
      showSuccess('✓ Véhicule marqué comme clôturé');
    } catch (error) {
      console.error('Error closing vehicle:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('partner_vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      onDeleted();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from('partner_expenses').insert({
        vehicle_id: vehicleId,
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        date: formData.get('date') as string,
      });

      if (error) throw error;

      showSuccess('✓ Frais ajouté avec succès');
      setShowAddExpenseModal(false);
      loadVehicleDetails();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExpense) return;

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from('partner_expenses')
        .update({
          description: formData.get('description') as string,
          amount: parseFloat(formData.get('amount') as string),
          date: formData.get('date') as string,
        })
        .eq('id', editingExpense.id);

      if (error) throw error;

      showSuccess('✓ Frais modifié avec succès');
      setShowEditExpenseModal(false);
      setEditingExpense(null);
      loadVehicleDetails();
    } catch (error) {
      console.error('Error editing expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce frais ?')) return;

    try {
      const { error } = await supabase
        .from('partner_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      showSuccess('✓ Frais supprimé');
      loadVehicleDetails();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleAddSale = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vehicle) return;

    const formData = new FormData(e.currentTarget);
    const bagsSold = parseInt(formData.get('bagsSold') as string);
    const pricePerBag = parseFloat(formData.get('pricePerBag') as string);

    if (bagsSold > vehicle.remainingBags) {
      alert('Quantité supérieure aux sacs disponibles!');
      return;
    }

    try {
      const { error: saleError } = await supabase.from('partner_sales').insert({
        vehicle_id: vehicleId,
        bags_sold: bagsSold,
        price_per_bag: pricePerBag,
        date: formData.get('date') as string,
        notes: formData.get('notes') as string || null,
      });

      if (saleError) throw saleError;

      const newSoldBags = vehicle.soldBags + bagsSold;
      const newRemainingBags = vehicle.remainingBags - bagsSold;

      const { error: updateError } = await supabase
        .from('partner_vehicles')
        .update({
          sold_bags: newSoldBags,
          remaining_bags: newRemainingBags,
          status: newRemainingBags === 0 ? 'Vendu' : 'En Vente',
        })
        .eq('id', vehicleId);

      if (updateError) throw updateError;

      showSuccess('✓ Vente enregistrée avec succès');
      setShowAddSaleModal(false);
      loadVehicleDetails();
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const handleEditSale = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSale || !vehicle) return;

    const formData = new FormData(e.currentTarget);
    const newBagsSold = parseInt(formData.get('bagsSold') as string);
    const oldBagsSold = editingSale.bagsSold;
    const pricePerBag = parseFloat(formData.get('pricePerBag') as string);

    const bagsDifference = newBagsSold - oldBagsSold;
    if (bagsDifference > vehicle.remainingBags) {
      alert('Quantité supérieure aux sacs disponibles!');
      return;
    }

    try {
      const { error: saleError } = await supabase
        .from('partner_sales')
        .update({
          bags_sold: newBagsSold,
          price_per_bag: pricePerBag,
          date: formData.get('date') as string,
          notes: formData.get('notes') as string || null,
        })
        .eq('id', editingSale.id);

      if (saleError) throw saleError;

      const newSoldBags = vehicle.soldBags + bagsDifference;
      const newRemainingBags = vehicle.remainingBags - bagsDifference;

      const { error: updateError } = await supabase
        .from('partner_vehicles')
        .update({
          sold_bags: newSoldBags,
          remaining_bags: newRemainingBags,
          status: newRemainingBags === 0 ? 'Vendu' : 'En Vente',
        })
        .eq('id', vehicleId);

      if (updateError) throw updateError;

      showSuccess('✓ Vente modifiée avec succès');
      setShowEditSaleModal(false);
      setEditingSale(null);
      loadVehicleDetails();
    } catch (error) {
      console.error('Error editing sale:', error);
    }
  };

  const handleDeleteSale = async (sale: PartnerSale) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) return;
    if (!vehicle) return;

    try {
      const { error: saleError } = await supabase
        .from('partner_sales')
        .delete()
        .eq('id', sale.id);

      if (saleError) throw saleError;

      const newSoldBags = vehicle.soldBags - sale.bagsSold;
      const newRemainingBags = vehicle.remainingBags + sale.bagsSold;

      const { error: updateError } = await supabase
        .from('partner_vehicles')
        .update({
          sold_bags: newSoldBags,
          remaining_bags: newRemainingBags,
        })
        .eq('id', vehicleId);

      if (updateError) throw updateError;

      showSuccess('✓ Vente supprimée');
      loadVehicleDetails();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const handleEditVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vehicle) return;

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from('partner_vehicles')
        .update({
          partner_name: formData.get('partnerName') as string,
          partner_phone: formData.get('partnerPhone') as string,
          partner_email: formData.get('partnerEmail') as string || null,
          vehicle_plate: formData.get('vehiclePlate') as string,
          driver_name: formData.get('driverName') as string,
          driver_phone: formData.get('driverPhone') as string,
          arrival_date: formData.get('arrivalDate') as string,
          status: formData.get('status') as string,
        })
        .eq('id', vehicleId);

      if (error) throw error;

      showSuccess('✓ Informations mises à jour');
      setShowEditVehicleModal(false);
      loadVehicleDetails();
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getStatusVariant = (status: PartnerVehicleStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'En Route': return 'default';
      case 'Arrivé': return 'secondary';
      case 'En Vente': return 'outline';
      case 'Vendu': return 'default';
      case 'Clôturé': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="text-center text-gray-600">Véhicule non trouvé</div>
      </div>
    );
  }

  const progressPercentage = (vehicle.soldBags / vehicle.totalBags) * 100;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.bagsSold * (s.pricePerBag || 0)), 0);
  const netResult = totalRevenue - totalExpenses;
  const averagePricePerBag = vehicle.soldBags > 0 ? totalRevenue / vehicle.soldBags : 5000;
  const projectedRevenue = vehicle.remainingBags * averagePricePerBag;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la liste
      </Button>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded font-semibold">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{vehicle.id}</h2>
          <p className="text-sm text-gray-600">Partenaire: {vehicle.partnerName}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEditVehicleModal(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier Info
          </Button>
          <Button
            onClick={markAsClosed}
            disabled={vehicle.status === 'Clôturé'}
            variant="default"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Clôturer
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Informations du Véhicule</CardTitle>
            <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Contact Partenaire</h3>
              <p className="text-sm">Nom: {vehicle.partnerName}</p>
              <p className="text-sm">Tél: {vehicle.partnerPhone}</p>
              {vehicle.partnerEmail && <p className="text-sm">Email: {vehicle.partnerEmail}</p>}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Véhicule</h3>
              <p className="text-sm">Plaque: {vehicle.vehiclePlate}</p>
              <p className="text-sm">Arrivée: {formatDate(vehicle.arrivalDate)}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Chauffeur</h3>
              <p className="text-sm">{vehicle.driverName || 'N/A'}</p>
              <p className="text-sm">{vehicle.driverPhone || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code d'Accès Partenaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-blue-600">{vehicle.accessPin}</span>
                <Button variant="ghost" size="sm" onClick={copyAccessPin}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={regenerateAccessPin}>
              Régénérer Code
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Le partenaire utilise ce code pour accéder à son portail de suivi à: /suivi-vehicule
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>État de l'Inventaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Sacs</p>
              <p className="text-2xl font-bold text-blue-600">{vehicle.totalBags}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Vendus</p>
              <p className="text-2xl font-bold text-green-600">{vehicle.soldBags}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Restants</p>
              <p className="text-2xl font-bold text-orange-600">{vehicle.remainingBags}</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progressPercentage.toFixed(1)}% vendu
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              💰 Frais ({expenses.length})
              {expenses.length > 0 && (
                <span className="ml-3 text-base font-normal text-gray-600">
                  Total: {formatCurrency(totalExpenses)} FCFA
                </span>
              )}
            </CardTitle>
            <Button onClick={() => setShowAddExpenseModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Frais
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun frais enregistré</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b pb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{expense.description}</p>
                    <p className="text-xs text-gray-600">{formatDate(expense.date)}</p>
                  </div>
                  <p className="font-bold mr-4">{formatCurrency(expense.amount)} FCFA</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingExpense(expense);
                        setShowEditExpenseModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              📊 Ventes ({sales.length})
              {sales.length > 0 && (
                <span className="ml-3 text-base font-normal text-gray-600">
                  Revenu: {formatCurrency(totalRevenue)} FCFA
                </span>
              )}
            </CardTitle>
            <Button onClick={() => setShowAddSaleModal(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer Vente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune vente enregistrée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">Quantité</th>
                    <th className="px-3 py-2 text-right">Prix/Sac</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b">
                      <td className="px-3 py-2">{formatDate(sale.date)}</td>
                      <td className="px-3 py-2 text-center font-semibold">{sale.bagsSold} sacs</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(sale.pricePerBag || 0)} FCFA</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatCurrency((sale.bagsSold * (sale.pricePerBag || 0)))} FCFA
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => {
                            setEditingSale(sale);
                            setShowEditSaleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6">
        <h3 className="font-bold text-xl mb-4 text-center">💹 Résumé Financier</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded">
            <p className="text-sm text-gray-600">Revenu Total</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)} FCFA</p>
          </div>

          <div className="bg-white p-4 rounded">
            <p className="text-sm text-gray-600">Frais Total</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)} FCFA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">RÉSULTAT NET:</span>
            <span className={`text-3xl font-bold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netResult)} FCFA
            </span>
          </div>

          <p className="text-xs text-gray-600 text-center mt-2">
            Revenu - Frais = Résultat Net
          </p>
        </div>

        {vehicle.remainingBags > 0 && (
          <div className="mt-4 bg-blue-100 p-4 rounded">
            <p className="text-sm font-semibold mb-1">Projection:</p>
            <p className="text-sm text-gray-700">
              {vehicle.remainingBags} sacs restants × {formatCurrency(averagePricePerBag)} FCFA =
              <span className="font-bold text-blue-700 ml-1">
                {formatCurrency(projectedRevenue)} FCFA potentiel
              </span>
            </p>
          </div>
        )}
      </div>

      <Dialog open={showAddExpenseModal} onOpenChange={setShowAddExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un Frais</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Douane, BNFT, etc." required />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input id="amount" name="amount" type="number" min="0" placeholder="0" required />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddExpenseModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditExpenseModal} onOpenChange={setShowEditExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Frais</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={editingExpense.description}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  defaultValue={formatDateForInput(editingExpense.date)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-amount">Montant (FCFA)</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  min="0"
                  defaultValue={editingExpense.amount}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Enregistrer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSaleModal} onOpenChange={setShowAddSaleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer une Vente</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleAddSale}
            className="space-y-4"
            onChange={(e) => {
              const form = e.currentTarget;
              const bags = parseInt((form.elements.namedItem('bagsSold') as HTMLInputElement)?.value || '0');
              const price = parseFloat((form.elements.namedItem('pricePerBag') as HTMLInputElement)?.value || '0');
              const totalElement = form.querySelector('#calculated-total');
              if (totalElement) {
                totalElement.textContent = formatCurrency(bags * price);
              }
            }}
          >
            <div>
              <Label htmlFor="sale-date">Date de Vente</Label>
              <Input
                id="sale-date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="bagsSold">Quantité (sacs)</Label>
              <Input
                id="bagsSold"
                name="bagsSold"
                type="number"
                min="1"
                max={vehicle.remainingBags}
                placeholder="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Disponible: {vehicle.remainingBags} sacs</p>
            </div>

            <div>
              <Label htmlFor="pricePerBag">Prix par Sac (FCFA)</Label>
              <Input
                id="pricePerBag"
                name="pricePerBag"
                type="number"
                min="0"
                defaultValue="5000"
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input id="notes" name="notes" placeholder="Client, remarques..." />
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span id="calculated-total" className="font-bold text-xl">
                  0
                </span>
                <span className="font-bold">FCFA</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddSaleModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditSaleModal} onOpenChange={setShowEditSaleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Vente</DialogTitle>
          </DialogHeader>
          {editingSale && (
            <form
              onSubmit={handleEditSale}
              className="space-y-4"
              onChange={(e) => {
                const form = e.currentTarget;
                const bags = parseInt((form.elements.namedItem('bagsSold') as HTMLInputElement)?.value || '0');
                const price = parseFloat((form.elements.namedItem('pricePerBag') as HTMLInputElement)?.value || '0');
                const totalElement = form.querySelector('#edit-calculated-total');
                if (totalElement) {
                  totalElement.textContent = formatCurrency(bags * price);
                }
              }}
            >
              <div>
                <Label htmlFor="edit-sale-date">Date de Vente</Label>
                <Input
                  id="edit-sale-date"
                  name="date"
                  type="date"
                  defaultValue={formatDateForInput(editingSale.date)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-bagsSold">Quantité (sacs)</Label>
                <Input
                  id="edit-bagsSold"
                  name="bagsSold"
                  type="number"
                  min="1"
                  defaultValue={editingSale.bagsSold}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-pricePerBag">Prix par Sac (FCFA)</Label>
                <Input
                  id="edit-pricePerBag"
                  name="pricePerBag"
                  type="number"
                  min="0"
                  defaultValue={editingSale.pricePerBag || 5000}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes (optionnel)</Label>
                <Input id="edit-notes" name="notes" defaultValue={editingSale.notes || ''} />
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span id="edit-calculated-total" className="font-bold text-xl">
                    {formatCurrency(editingSale.bagsSold * (editingSale.pricePerBag || 0))}
                  </span>
                  <span className="font-bold">FCFA</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditSaleModal(false);
                    setEditingSale(null);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Enregistrer
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditVehicleModal} onOpenChange={setShowEditVehicleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier les Informations du Véhicule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditVehicle} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-partnerName">Nom du Partenaire</Label>
                <Input id="edit-partnerName" name="partnerName" defaultValue={vehicle.partnerName} required />
              </div>

              <div>
                <Label htmlFor="edit-partnerPhone">Téléphone Partenaire</Label>
                <Input id="edit-partnerPhone" name="partnerPhone" defaultValue={vehicle.partnerPhone} required />
              </div>

              <div>
                <Label htmlFor="edit-partnerEmail">Email Partenaire</Label>
                <Input
                  id="edit-partnerEmail"
                  name="partnerEmail"
                  type="email"
                  defaultValue={vehicle.partnerEmail || ''}
                />
              </div>

              <div>
                <Label htmlFor="edit-vehiclePlate">Plaque du Véhicule</Label>
                <Input id="edit-vehiclePlate" name="vehiclePlate" defaultValue={vehicle.vehiclePlate} required />
              </div>

              <div>
                <Label htmlFor="edit-driverName">Nom du Chauffeur</Label>
                <Input id="edit-driverName" name="driverName" defaultValue={vehicle.driverName} required />
              </div>

              <div>
                <Label htmlFor="edit-driverPhone">Téléphone Chauffeur</Label>
                <Input id="edit-driverPhone" name="driverPhone" defaultValue={vehicle.driverPhone} required />
              </div>

              <div>
                <Label htmlFor="edit-arrivalDate">Date d'Arrivée</Label>
                <Input
                  id="edit-arrivalDate"
                  name="arrivalDate"
                  type="date"
                  defaultValue={formatDateForInput(vehicle.arrivalDate)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={vehicle.status}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="En Route">En Route</option>
                  <option value="Arrivé">Arrivé</option>
                  <option value="En Vente">En Vente</option>
                  <option value="Vendu">Vendu</option>
                  <option value="Clôturé">Clôturé</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowEditVehicleModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la Suppression</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer ce véhicule partenaire ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
