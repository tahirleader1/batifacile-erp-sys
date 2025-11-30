import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewPartnerVehicleFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NewPartnerVehicleForm({ onClose, onSuccess }: NewPartnerVehicleFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    partnerName: '',
    partnerPhone: '',
    partnerEmail: '',
    vehiclePlate: '',
    totalBags: '',
    driverName: '',
    driverPhone: '',
    arrivalDate: new Date().toISOString().split('T')[0],
  });

  const generateVehicleId = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PART-NIG-${dateStr}-${randomNum}`;
  };

  const generateAccessPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const vehicleId = generateVehicleId();
      const accessPin = generateAccessPin();
      const totalBags = parseInt(formData.totalBags);

      const { error: insertError } = await supabase
        .from('partner_vehicles')
        .insert({
          id: vehicleId,
          partner_name: formData.partnerName,
          partner_phone: formData.partnerPhone,
          partner_email: formData.partnerEmail || null,
          vehicle_plate: formData.vehiclePlate,
          driver_name: formData.driverName,
          driver_phone: formData.driverPhone,
          total_bags: totalBags,
          sold_bags: 0,
          remaining_bags: totalBags,
          arrival_date: formData.arrivalDate,
          status: 'En Route',
          access_pin: accessPin,
          user_id: user?.id,
        });

      if (insertError) throw insertError;

      setSuccessMessage(`✓ Véhicule créé avec succès! Code d'accès: ${accessPin}`);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating partner vehicle:', err);
      setError('Erreur lors de la création du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Véhicule Partenaire</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Partner Info */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-lg">Informations Partenaire</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Nom du Partenaire *</Label>
                <Input
                  id="partnerName"
                  type="text"
                  required
                  value={formData.partnerName}
                  onChange={(e) => handleChange('partnerName', e.target.value)}
                  placeholder="Ex: Mohamed Ibrahim"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnerPhone">Téléphone *</Label>
                <Input
                  id="partnerPhone"
                  type="tel"
                  required
                  value={formData.partnerPhone}
                  onChange={(e) => handleChange('partnerPhone', e.target.value)}
                  placeholder="Ex: 66123456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerEmail">Email (optionnel)</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={formData.partnerEmail}
                onChange={(e) => handleChange('partnerEmail', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* SECTION 2: Vehicle Info */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-lg">Informations Véhicule</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Plaque du Véhicule *</Label>
                <Input
                  id="vehiclePlate"
                  type="text"
                  required
                  value={formData.vehiclePlate}
                  onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                  placeholder="Ex: TC-456-NJ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBags">Nombre Total de Sacs *</Label>
                <Input
                  id="totalBags"
                  type="number"
                  required
                  min="1"
                  value={formData.totalBags}
                  onChange={(e) => handleChange('totalBags', e.target.value)}
                  placeholder="Ex: 600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Nom du Chauffeur</Label>
                <Input
                  id="driverName"
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => handleChange('driverName', e.target.value)}
                  placeholder="Ex: Hassan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverPhone">Téléphone Chauffeur</Label>
                <Input
                  id="driverPhone"
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => handleChange('driverPhone', e.target.value)}
                  placeholder="Ex: 68999888"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrivalDate">Date d'Arrivée Prévue</Label>
              <Input
                id="arrivalDate"
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => handleChange('arrivalDate', e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 3: Access Code (Auto-generated) */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-lg">Code d'Accès</h3>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Un code d'accès à 6 chiffres sera généré automatiquement pour ce véhicule.
              </p>
              <p className="text-sm text-gray-700">
                Le partenaire utilisera ce code sur:{' '}
                <span className="font-mono font-semibold">yourapp.com/suivi-vehicule</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Création...' : 'Créer Véhicule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
