import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Package, Search, Building2, Truck, ExternalLink } from 'lucide-react';
import { Product, ProductCategory, ProductLocation, CementAttributes, IronAttributes, WoodAttributes, PaintAttributes } from '../types';

export function Inventory() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'ciment' as ProductCategory,
    wholesalePrice: '',
    retailPrice: '',
    stockQuantity: '',
    location: 'magasin' as ProductLocation,
    unit: 'sac',
    brand: '',
    bagWeight: '',
    origin: '',
    arrivalDate: '',
    vehicleId: '',
    type: '',
    size: '',
    length: '',
    weight: '',
    dimensions: '',
    qualityGrade: '',
    color: '',
    volume: '',
    finish: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let attributes: CementAttributes | IronAttributes | WoodAttributes | PaintAttributes;

    switch (formData.category) {
      case 'ciment':
        attributes = {
          brand: formData.brand,
          bagWeight: formData.bagWeight,
          origin: formData.origin,
          arrivalDate: formData.arrivalDate,
          ...(formData.vehicleId && { vehicleId: formData.vehicleId })
        } as CementAttributes;
        break;
      case 'fer':
        attributes = {
          type: formData.type,
          size: formData.size,
          length: formData.length,
          weight: formData.weight,
          brand: formData.brand
        } as IronAttributes;
        break;
      case 'bois':
        attributes = {
          type: formData.type,
          dimensions: formData.dimensions,
          qualityGrade: formData.qualityGrade
        } as WoodAttributes;
        break;
      case 'peinture':
        attributes = {
          brand: formData.brand,
          type: formData.type,
          color: formData.color,
          volume: formData.volume,
          finish: formData.finish
        } as PaintAttributes;
        break;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      attributes,
      wholesalePrice: parseFloat(formData.wholesalePrice),
      retailPrice: parseFloat(formData.retailPrice),
      stockQuantity: parseInt(formData.stockQuantity),
      location: formData.location,
      unit: formData.unit
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ciment',
      wholesalePrice: '',
      retailPrice: '',
      stockQuantity: '',
      location: 'magasin',
      unit: 'sac',
      brand: '',
      bagWeight: '',
      origin: '',
      arrivalDate: '',
      vehicleId: '',
      type: '',
      size: '',
      length: '',
      weight: '',
      dimensions: '',
      qualityGrade: '',
      color: '',
      volume: '',
      finish: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const attrs = product.attributes as any;
    setFormData({
      name: product.name,
      category: product.category,
      wholesalePrice: product.wholesalePrice.toString(),
      retailPrice: product.retailPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      location: product.location,
      unit: product.unit,
      brand: attrs.brand || '',
      bagWeight: attrs.bagWeight || '',
      origin: attrs.origin || '',
      arrivalDate: attrs.arrivalDate || '',
      vehicleId: attrs.vehicleId || '',
      type: attrs.type || '',
      size: attrs.size || '',
      length: attrs.length || '',
      weight: attrs.weight || '',
      dimensions: attrs.dimensions || '',
      qualityGrade: attrs.qualityGrade || '',
      color: attrs.color || '',
      volume: attrs.volume || '',
      finish: attrs.finish || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      deleteProduct(id);
    }
  };

  const getCategoryColor = (category: ProductCategory) => {
    const colors = {
      ciment: 'bg-gray-500',
      fer: 'bg-slate-600',
      bois: 'bg-amber-600',
      peinture: 'bg-blue-600'
    };
    return colors[category];
  };

  const renderCategoryFields = () => {
    switch (formData.category) {
      case 'ciment':
        return (
          <>
            <div>
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: CIMAF"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bagWeight">Poids du Sac</Label>
                <Input
                  id="bagWeight"
                  value={formData.bagWeight}
                  onChange={(e) => setFormData({ ...formData, bagWeight: e.target.value })}
                  placeholder="Ex: 50kg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="origin">Origine</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Ex: Cameroun"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalDate">Date d'Arrivée</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleId">ID Véhicule (optionnel)</Label>
                <Input
                  id="vehicleId"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  placeholder="Ex: TC-001"
                />
              </div>
            </div>
          </>
        );

      case 'fer':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Haute Adhérence"
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: ArcelorMittal"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="size">Diamètre</Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Ex: 10mm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="length">Longueur</Label>
                <Input
                  id="length"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  placeholder="Ex: 12m"
                  required
                />
              </div>
              <div>
                <Label htmlFor="weight">Poids</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Ex: 7.4kg"
                  required
                />
              </div>
            </div>
          </>
        );

      case 'bois':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: PVC, Contreplaqué"
                  required
                />
              </div>
              <div>
                <Label htmlFor="qualityGrade">Qualité</Label>
                <Select
                  value={formData.qualityGrade}
                  onValueChange={(value) => setFormData({ ...formData, qualityGrade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Économique">Économique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="Ex: 6m x 25cm"
                required
              />
            </div>
          </>
        );

      case 'peinture':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Dulux"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Murale, Extérieure"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Ex: Blanc"
                  required
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="Ex: 25L"
                  required
                />
              </div>
              <div>
                <Label htmlFor="finish">Finition</Label>
                <Select
                  value={formData.finish}
                  onValueChange={(value) => setFormData({ ...formData, finish: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mat">Mat</SelectItem>
                    <SelectItem value="Satiné">Satiné</SelectItem>
                    <SelectItem value="Brillant">Brillant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
    }
  };

  const getAttributeDisplay = (product: Product) => {
    const attrs = product.attributes as any;
    switch (product.category) {
      case 'ciment':
        return `${attrs.brand} • ${attrs.bagWeight} • ${attrs.origin}`;
      case 'fer':
        return `${attrs.type} • ${attrs.size} • ${attrs.length}`;
      case 'bois':
        return `${attrs.type} • ${attrs.dimensions} • ${attrs.qualityGrade}`;
      case 'peinture':
        return `${attrs.brand} • ${attrs.color} • ${attrs.volume}`;
      default:
        return '';
    }
  };

  const getSourceLabel = (sourceType?: string) => {
    if (!sourceType) return null;
    const labels = {
      'iron_command': 'Commande Fer',
      'wood_shipment': 'Cargaison Bois',
      'paint_shipment': 'Cargaison Peinture',
      'cement_shipment': 'Cargaison Ciment',
      'purchase_order': 'Bon de Commande'
    };
    return labels[sourceType as keyof typeof labels] || 'Autre';
  };

  const goToSource = (sourceType?: string, sourceId?: string) => {
    if (!sourceType || !sourceId) return;

    if (sourceType === 'iron_command') {
      navigate('/procurement');
    } else if (sourceType === 'wood_shipment') {
      navigate('/procurement');
    } else if (sourceType === 'paint_shipment') {
      navigate('/procurement');
    } else if (sourceType === 'cement_shipment') {
      navigate('/procurement');
    } else if (sourceType === 'purchase_order') {
      navigate('/procurement');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Gestion de l'Inventaire
              <Badge variant="outline" className="ml-2">{filteredProducts.length} produits</Badge>
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du Produit</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Ciment Portland 50kg CIMAF"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ciment">Ciment</SelectItem>
                        <SelectItem value="fer">Fer</SelectItem>
                        <SelectItem value="bois">Bois/Plafond</SelectItem>
                        <SelectItem value="peinture">Peinture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {renderCategoryFields()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wholesalePrice">Prix Gros (FCFA)</Label>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        value={formData.wholesalePrice}
                        onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="retailPrice">Prix Détail (FCFA)</Label>
                      <Input
                        id="retailPrice"
                        type="number"
                        value={formData.retailPrice}
                        onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stockQuantity">Quantité en Stock</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unité</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="Ex: sac, barre, pot"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Emplacement</Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value as ProductLocation })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="magasin">Magasin</SelectItem>
                        <SelectItem value="véhicule">Véhicule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {editingProduct ? 'Modifier' : 'Ajouter'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="ciment">Ciment</SelectItem>
                <SelectItem value="fer">Fer</SelectItem>
                <SelectItem value="bois">Bois/Plafond</SelectItem>
                <SelectItem value="peinture">Peinture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="dark:text-gray-200 w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Catégorie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Détails</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Source</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Coût Unitaire</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Prix Gros</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Prix Détail</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Emplacement</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:bg-gray-700">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.unit}</p>
                      {product.warehouseLocation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">📍 {product.warehouseLocation}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getCategoryColor(product.category)} text-white capitalize`}>
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{getAttributeDisplay(product)}</p>
                      {product.supplier && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fournisseur: {product.supplier}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.sourceId ? (
                        <button
                          onClick={() => goToSource(product.sourceType, product.sourceId)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                          title="Voir la source"
                        >
                          <span className="text-xs">{getSourceLabel(product.sourceType)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">Manuel</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {product.costPerUnit ? (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {product.costPerUnit.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      {product.wholesalePrice.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                      {product.retailPrice.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${product.stockQuantity < 20 ? 'text-orange-600' : 'text-green-600'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center" title={product.location === 'magasin' ? 'Magasin' : 'Véhicule'}>
                        {product.location === 'magasin' ? (
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun produit trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
