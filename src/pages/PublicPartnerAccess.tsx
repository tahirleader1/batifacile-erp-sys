import { useState, useEffect } from 'react';
import { LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PartnerVehicle, PartnerExpense, PartnerSale, PartnerVehicleStatus } from '../types/partner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PublicPartnerAccess() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<PartnerVehicle | null>(null);
  const [expenses, setExpenses] = useState<PartnerExpense[]>([]);
  const [sales, setSales] = useState<PartnerSale[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  useEffect(() => {
    const savedVehicleId = sessionStorage.getItem('partner_vehicle_id');
    const savedPin = sessionStorage.getItem('partner_access_pin');

    if (savedVehicleId && savedPin) {
      setVehicleId(savedVehicleId);
      setAccessPin(savedPin);
      handleLogin(savedVehicleId, savedPin, true);
    }
  }, []);

  const handleLogin = async (vId?: string, pin?: string, skipValidation = false) => {
    const loginVehicleId = vId || vehicleId;
    const loginPin = pin || accessPin;

    if (!skipValidation && (!loginVehicleId || !loginPin)) {
      setLoginError('Veuillez saisir l\'ID du véhicule et le code d\'accès');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabase
        .from('partner_vehicles')
        .select('*')
        .eq('id', loginVehicleId)
        .eq('access_pin', loginPin)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setLoginError('ID véhicule ou code d\'accès incorrect');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('partner_vehicle_id', loginVehicleId);
      sessionStorage.setItem('partner_access_pin', loginPin);

      await loadVehicleData(loginVehicleId);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleData = async (vId: string) => {
    try {
      const { data: vehicleData } = await supabase
        .from('partner_vehicles')
        .select('*')
        .eq('id', vId)
        .maybeSingle();

      if (vehicleData) {
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
      }

      const { data: expensesData } = await supabase
        .from('partner_expenses')
        .select('*')
        .eq('vehicle_id', vId)
        .order('date', { ascending: false });

      if (expensesData) {
        setExpenses(
          expensesData.map(e => ({
            id: e.id,
            description: e.description,
            amount: parseFloat(e.amount),
            date: new Date(e.date),
          }))
        );
      }

      const { data: salesData } = await supabase
        .from('partner_sales')
        .select('*')
        .eq('vehicle_id', vId)
        .order('date', { ascending: false });

      if (salesData) {
        setSales(
          salesData.map(s => ({
            id: s.id,
            bagsSold: s.bags_sold,
            date: new Date(s.date),
            notes: s.notes,
          }))
        );
      }

      setLastUpdateTime(new Date().toLocaleTimeString('fr-FR'));
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('partner_vehicle_id');
    sessionStorage.removeItem('partner_access_pin');
    setIsLoggedIn(false);
    setVehicle(null);
    setExpenses([]);
    setSales([]);
    setVehicleId('');
    setAccessPin('');
  };

  const handleRefresh = () => {
    if (vehicle) {
      loadVehicleData(vehicle.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: PartnerVehicleStatus) => {
    switch (status) {
      case 'En Route':
        return 'bg-blue-100 text-blue-800';
      case 'Arrivé':
        return 'bg-purple-100 text-purple-800';
      case 'En Vente':
        return 'bg-orange-100 text-orange-800';
      case 'Vendu':
        return 'bg-green-100 text-green-800';
      case 'Clôturé':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Suivi de Véhicule</h1>
            <p className="text-sm text-gray-600">Accès Partenaire</p>
          </div>

          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">ID du Véhicule</Label>
              <Input
                id="vehicleId"
                type="text"
                placeholder="Ex: PART-NIG-20241124-001"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessPin">Code d'Accès (6 chiffres)</Label>
              <Input
                id="accessPin"
                type="text"
                placeholder="Ex: 123456"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                required
                maxLength={6}
                className="font-mono text-lg tracking-widest"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Connexion...' : 'Se Connecter'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Vous avez reçu l'ID du véhicule et le code d'accès de l'administrateur.
              Contactez-le si vous avez des difficultés d'accès.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.bagsSold * 5000), 0);
  const netResult = totalRevenue - totalExpenses;
  const salesPercentage = (vehicle.soldBags / vehicle.totalBags) * 100;
  const averagePricePerBag = vehicle.soldBags > 0 ? totalRevenue / vehicle.soldBags : 5000;
  const projectedRevenue = vehicle.remainingBags * averagePricePerBag;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg">Suivi de Véhicule</h1>
            <p className="text-xs text-gray-600">Accès Partenaire - Lecture Seule</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>

      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Mode Lecture Seule</strong> - Vous pouvez consulter les informations de votre véhicule.
              Pour ajouter des frais ou enregistrer des ventes, contactez l'administrateur.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-xl">Cargaison {vehicle.id}</h2>
              <p className="text-sm text-gray-600">Véhicule: {vehicle.vehiclePlate}</p>
              <p className="text-sm text-gray-600">Chauffeur: {vehicle.driverName}</p>
              <p className="text-sm text-gray-600">Partenaire: {vehicle.partnerName}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{formatDate(vehicle.arrivalDate)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Sacs</p>
            <p className="text-3xl font-bold">{vehicle.totalBags}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Sacs Vendus</p>
            <p className="text-3xl font-bold text-green-600">{vehicle.soldBags}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Sacs Restants</p>
            <p className="text-3xl font-bold text-orange-600">{vehicle.remainingBags}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">Progression des Ventes</span>
            <span className="font-semibold">{salesPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${salesPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">💰 Frais de la Cargaison</h3>
          </div>

          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-semibold text-sm">{expense.description}</p>
                    <p className="text-xs text-gray-600">{formatDate(expense.date)}</p>
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(expense.amount)} FCFA</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun frais enregistré</p>
          )}

          <div className="mt-4 pt-4 border-t-2 flex justify-between">
            <span className="font-bold text-lg">Total Frais:</span>
            <span className="font-bold text-2xl">{formatCurrency(totalExpenses)} FCFA</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">📊 Historique des Ventes</h3>

          {sales.length > 0 ? (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-semibold">{sale.bagsSold} sacs vendus</p>
                    <p className="text-sm text-gray-600">{formatDate(sale.date)}</p>
                    {sale.notes && <p className="text-sm text-gray-500 italic">{sale.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucune vente enregistrée</p>
          )}

          <div className="mt-4 pt-4 border-t-2 flex justify-between">
            <span className="font-bold text-lg">Revenu Total:</span>
            <span className="font-bold text-2xl text-green-600">{formatCurrency(totalRevenue)} FCFA</span>
          </div>
        </div>

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

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>📡 Dernière mise à jour: {lastUpdateTime}</p>
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
}
