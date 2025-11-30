import { useState } from 'react';
import { Sale } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptGenerator } from './ReceiptGenerator';
import { User, Phone, Receipt, Truck } from 'lucide-react';

interface ReceiptDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  receiptNumber: string;
  companyName?: string;
}

export function ReceiptDetailsForm({
  isOpen,
  onClose,
  sale,
  receiptNumber,
  companyName
}: ReceiptDetailsFormProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    vehiclePlate: '',
    driverName: '',
    driverPhone: '',
    sellerName: 'Bechir Saleh',
    sellerPhone: '60555020'
  });

  const handleGenerateReceipt = () => {
    setShowReceipt(true);
  };

  const handleClose = () => {
    setShowReceipt(false);
    setFormData({
      clientName: '',
      clientPhone: '',
      vehiclePlate: '',
      driverName: '',
      driverPhone: '',
      sellerName: 'Bechir Saleh',
      sellerPhone: '60555020'
    });
    onClose();
  };

  const handleBack = () => {
    setShowReceipt(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showReceipt ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Receipt className="h-6 w-6" />
                Finaliser la Vente - Informations du Reçu
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5" />
                    INFORMATIONS CLIENT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Nom Client (optionnel)</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Ex: Jean Dupont"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Laissez vide pour un client anonyme
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="clientPhone" className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Téléphone (optionnel)
                    </Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="Ex: 60123456"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    DÉTAILS VÉHICULE (Optionnel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehiclePlate">Plaque du Véhicule (optionnel)</Label>
                    <Input
                      id="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      placeholder="Ex: TC-456-NJ"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverName">Nom du Chauffeur (optionnel)</Label>
                    <Input
                      id="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      placeholder="Ex: Ahmed Mohamed"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="driverPhone" className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Téléphone du Chauffeur (optionnel)
                    </Label>
                    <Input
                      id="driverPhone"
                      value={formData.driverPhone}
                      onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                      placeholder="Ex: 60987654"
                      className="mt-1"
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Remplir si le client utilise un véhicule pour le transport
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5" />
                    VENDEUR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sellerName">Nom *</Label>
                    <Input
                      id="sellerName"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      placeholder="Nom du vendeur"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sellerPhone" className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Téléphone *
                    </Label>
                    <Input
                      id="sellerPhone"
                      value={formData.sellerPhone}
                      onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                      placeholder="Téléphone du vendeur"
                      className="mt-1"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">N° Reçu</p>
                    <p className="font-bold text-lg">{receiptNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total à Payer</p>
                    <p className="font-bold text-2xl text-green-600 dark:text-green-400">
                      {sale.total.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleGenerateReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.sellerName || !formData.sellerPhone}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Générer le Reçu
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Reçu de Vente
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div id="printable-receipt">
                <ReceiptGenerator
                  sale={{
                    ...sale,
                    customerName: formData.clientName || 'Client'
                  }}
                  receiptNumber={receiptNumber}
                  companyName={companyName}
                  clientInfo={{
                    name: formData.clientName,
                    phone: formData.clientPhone
                  }}
                  vehicleInfo={{
                    plate: formData.vehiclePlate,
                    driverName: formData.driverName,
                    driverPhone: formData.driverPhone
                  }}
                  sellerInfo={{
                    name: formData.sellerName,
                    phone: formData.sellerPhone
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Imprimer
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Terminer
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Utilisez le bouton "Imprimer" pour imprimer ce reçu, ou "Terminer" pour revenir au POS
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
