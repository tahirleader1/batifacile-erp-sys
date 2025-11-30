import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Building2, Save } from 'lucide-react';
import { CompanyInfo } from '../types';

export function Settings() {
  const { companyInfo, updateCompanyInfo } = useApp();
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Paramètres de l'Application
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Informations de l'Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'Entreprise</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="taxId">Numéro d'Identification Fiscale (NIF)</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les Modifications
              </Button>
              {isSaved && (
                <div className="flex items-center text-green-600 font-medium">
                  Modifications enregistrées avec succès!
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu du Reçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border-2 border-dashed border-gray-300 font-mono text-sm">
            <div className="text-center space-y-1 border-b-2 border-dashed border-gray-400 pb-4 mb-4">
              <div className="font-bold text-lg">{formData.name}</div>
              <div>{formData.address}</div>
              <div>{formData.phone}</div>
              <div>{formData.email}</div>
              <div>{formData.taxId}</div>
            </div>
            <div className="space-y-1 text-gray-600 dark:text-gray-300">
              <div>Date: {new Date().toLocaleString('fr-FR')}</div>
              <div>Client: Client Exemple</div>
              <div>Type: Détail</div>
              <div>Paiement: Espèces</div>
              <div>N° Reçu: 123456</div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-400">
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>10,000 FCFA</span>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t-2 border-dashed border-gray-400 text-gray-600 dark:text-gray-300">
              Merci de votre visite!<br />
              À bientôt
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
