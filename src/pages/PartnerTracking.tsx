import { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PartnerVehicle, PartnerVehicleStatus } from '../types/partner';
import { NewPartnerVehicleForm } from '../components/NewPartnerVehicleForm';
import { PartnerVehicleDetail } from '../components/PartnerVehicleDetail';

type FilterType = 'Tous' | 'Actifs' | 'En Transit' | 'Complétés';
type ViewMode = 'list' | 'detail';

export function PartnerTracking() {
  const { user } = useAuth();
  const [partnerVehicles, setPartnerVehicles] = useState<PartnerVehicle[]>([]);
  const [filter, setFilter] = useState<FilterType>('Tous');
  const [loading, setLoading] = useState(true);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerVehicles();
  }, []);

  const loadPartnerVehicles = async () => {
    try {
      let query = supabase
        .from('partner_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const vehicles: PartnerVehicle[] = (data || []).map(v => ({
        id: v.id,
        partnerName: v.partner_name,
        partnerPhone: v.partner_phone,
        partnerEmail: v.partner_email,
        vehiclePlate: v.vehicle_plate,
        driverName: v.driver_name,
        driverPhone: v.driver_phone,
        totalBags: v.total_bags,
        soldBags: v.sold_bags,
        remainingBags: v.remaining_bags,
        arrivalDate: new Date(v.arrival_date),
        status: v.status as PartnerVehicleStatus,
        accessPin: v.access_pin,
        expenses: [],
        sales: [],
        createdAt: new Date(v.created_at),
      }));

      setPartnerVehicles(vehicles);
    } catch (error) {
      console.error('Error loading partner vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVehicles = () => {
    switch (filter) {
      case 'Actifs':
        return partnerVehicles.filter(v =>
          v.status === 'En Route' || v.status === 'Arrivé' || v.status === 'En Vente'
        );
      case 'En Transit':
        return partnerVehicles.filter(v => v.status === 'En Route');
      case 'Complétés':
        return partnerVehicles.filter(v => v.status === 'Vendu' || v.status === 'Clôturé');
      default:
        return partnerVehicles;
    }
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

  const copyAccessCode = (pin: string) => {
    navigator.clipboard.writeText(pin);
  };

  const handleViewVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedVehicleId(null);
    loadPartnerVehicles();
  };

  const handleVehicleDeleted = () => {
    setViewMode('list');
    setSelectedVehicleId(null);
    loadPartnerVehicles();
  };

  const filteredVehicles = getFilteredVehicles();
  const activeVehicles = partnerVehicles.filter(v =>
    v.status === 'En Route' || v.status === 'Arrivé' || v.status === 'En Vente'
  ).length;
  const inTransit = partnerVehicles.filter(v => v.status === 'En Route').length;
  const completed = partnerVehicles.filter(v =>
    v.status === 'Vendu' || v.status === 'Clôturé'
  ).length;
  const totalPartners = new Set(partnerVehicles.map(v => v.partnerName)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedVehicleId) {
    return (
      <PartnerVehicleDetail
        vehicleId={selectedVehicleId}
        onBack={handleBackToList}
        onDeleted={handleVehicleDeleted}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠️ Module de Suivi Partenaires
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Ce module suit les véhicules de partenaires externes. Ces données ne sont PAS incluses dans vos rapports d'affaires ou inventaire.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Véhicules Actifs</p>
          <p className="text-3xl font-bold text-blue-600">{activeVehicles}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Partenaires</p>
          <p className="text-3xl font-bold">{totalPartners}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">En Transit</p>
          <p className="text-3xl font-bold text-orange-600">{inTransit}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Complétés</p>
          <p className="text-3xl font-bold text-green-600">{completed}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['Tous', 'Actifs', 'En Transit', 'Complétés'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowNewVehicleForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Users className="h-5 w-5" />
          Nouveau Véhicule Partenaire
        </button>
      </div>

      {/* Partner Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID Véhicule</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Partenaire</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Plaque</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Total Sacs</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Restants</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Code Accès</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Aucun véhicule partenaire trouvé
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{vehicle.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{vehicle.partnerName}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.partnerPhone}</td>
                    <td className="px-4 py-3 text-sm">{vehicle.vehiclePlate}</td>
                    <td className="px-4 py-3 text-center text-sm">{vehicle.totalBags}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">{vehicle.remainingBags}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => copyAccessCode(vehicle.accessPin)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-mono font-bold"
                        title="Cliquer pour copier"
                      >
                        {vehicle.accessPin}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Vehicle Form Modal */}
      {showNewVehicleForm && (
        <NewPartnerVehicleForm
          onClose={() => setShowNewVehicleForm(false)}
          onSuccess={loadPartnerVehicles}
        />
      )}
    </div>
  );
}
