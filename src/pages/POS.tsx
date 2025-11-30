import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, CreditCard, Smartphone, Banknote, FileText, Package2, Palette, Hammer, Box } from 'lucide-react';
import { Sale, SaleItem, CustomerType, PaymentMethod } from '../types';
import { ReceiptDetailsForm } from '../components/ReceiptDetailsForm';

export function POS() {
  const { products, addSale, companyInfo, customers = [], updateCustomer } = useApp();
  const [customerType, setCustomerType] = useState<CustomerType>('détail');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [pendingSale, setPendingSale] = useState<Sale | null>(null);
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');

  const availableProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return p.stockQuantity > 0 && matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const price = customerType === 'gros' ? product.wholesalePrice : product.retailPrice;
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        setCart(cart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: price,
        total: price
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, Math.min(item.quantity + delta, product.stockQuantity));
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    const percent = parseFloat(discountPercent) || 0;
    return (calculateSubtotal() * percent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const canCompleteSale = () => {
    if (cart.length === 0) return false;

    if (paymentMethod === 'credit') {
      if (!selectedCustomer || selectedCustomer === 'new' || selectedCustomer === 'anonymous') return false;
      const customer = customers.find(c => c.id === selectedCustomer);
      if (!customer || !customer.allowCredit) return false;
      const newBalance = customer.balance + (total - amountPaid);
      if (newBalance > customer.creditLimit) return false;
      return true;
    } else {
      if (amountPaid > 0 && amountPaid < total) {
        if (!selectedCustomer || selectedCustomer === 'new' || selectedCustomer === 'anonymous') return false;
        const customer = customers.find(c => c.id === selectedCustomer);
        return customer !== undefined;
      }
      return amountPaid >= total;
    }
  };

  const handleCheckout = () => {
    if (!canCompleteSale()) {
      alert('Vérifiez les conditions de paiement');
      return;
    }

    const sale: Sale = {
      id: generateReceiptNumber(),
      date: new Date(),
      items: cart,
      customerType,
      customerId: (selectedCustomer && selectedCustomer !== 'anonymous' && selectedCustomer !== 'new') ? selectedCustomer : undefined,
      customerName: (selectedCustomer && selectedCustomer !== 'anonymous' && selectedCustomer !== 'new') ? customers.find(c => c.id === selectedCustomer)?.name || customerName : customerName || 'Client Anonyme',
      paymentMethod,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      discountPercent: parseFloat(discountPercent) || 0,
      total: calculateTotal(),
      amountPaid: amountPaid,
      amountDue: total - amountPaid,
      paymentStatus: amountPaid >= total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid',
      dueDate: paymentMethod === 'credit' ? dueDate : undefined,
      notes: saleNotes || undefined,
      seller: 'Bechir Saleh'
    };

    addSale(sale);

    if (selectedCustomer && selectedCustomer !== 'anonymous' && selectedCustomer !== 'new') {
      const customer = customers.find(c => c.id === selectedCustomer);
      if (customer) {
        const updatedCustomer = {
          ...customer,
          balance: customer.balance + (total - amountPaid),
          totalPurchases: customer.totalPurchases + total,
          totalPaid: customer.totalPaid + amountPaid,
          lastPurchaseDate: new Date().toISOString()
        };
        updateCustomer(updatedCustomer);
      }
    }

    setPendingSale(sale);
    setShowReceiptForm(true);
  };

  const handleReceiptFormClose = () => {
    setShowReceiptForm(false);
    setPendingSale(null);
    setCart([]);
    setCustomerName('');
    setSelectedCustomer('');
    setPaymentMethod('cash');
    setDiscountPercent('0');
    setAmountPaid(0);
    setDueDate('');
    setSaleNotes('');
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const randStr = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `REC-${dateStr}-${timeStr}${randStr}`;
  };


  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ciment':
        return <Box className="h-5 w-5" />;
      case 'fer':
        return <Hammer className="h-5 w-5" />;
      case 'bois':
        return <Package2 className="h-5 w-5" />;
      case 'peinture':
        return <Palette className="h-5 w-5" />;
      default:
        return <Package2 className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ciment':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 border-gray-300';
      case 'fer':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'bois':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'peinture':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 border-gray-300';
    }
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();

  return (
    <div className="space-y-4">
      <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 -mx-4 px-4">
        <div className="flex">
          <button
            onClick={() => setMobileTab('products')}
            className={`flex-1 py-4 font-semibold text-sm transition-colors ${
              mobileTab === 'products'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            📦 Produits ({availableProducts.length})
          </button>
          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-4 font-semibold text-sm transition-colors ${
              mobileTab === 'cart'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            🛒 Panier ({cart.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === 'products' ? 'block' : 'hidden lg:block'}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Sélection des Produits
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={customerType === 'détail' ? 'default' : 'outline'}
                  onClick={() => {
                    setCustomerType('détail');
                    setCart([]);
                  }}
                  className={customerType === 'détail' ? 'bg-blue-600' : ''}
                >
                  Détail
                </Button>
                <Button
                  variant={customerType === 'gros' ? 'default' : 'outline'}
                  onClick={() => {
                    setCustomerType('gros');
                    setCart([]);
                  }}
                  className={customerType === 'gros' ? 'bg-green-600' : ''}
                >
                  Gros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-base md:text-sm h-11 md:h-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[600px] overflow-y-auto pr-2">
              {availableProducts.map(product => (
                <Card key={product.id} className={`border-2 hover:shadow-md transition-shadow ${getCategoryColor(product.category)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(product.category)}
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                        </div>
                        <p className="text-xs text-gray-600 capitalize">{product.category}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Prix:</span>
                        <span className="font-bold text-lg">
                          {(customerType === 'gros' ? product.wholesalePrice : product.retailPrice).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-300">Stock:</span>
                        <Badge variant="outline" className="text-xs">
                          {product.stockQuantity} {product.unit}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-3 md:py-2 text-base md:text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter au Panier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {availableProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucun produit disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={`lg:col-span-1 space-y-6 ${mobileTab === 'cart' ? 'block' : 'hidden lg:block'}`}>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Panier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <Label className="text-sm font-semibold">Client</Label>
              <Select value={selectedCustomer} onValueChange={(value) => {
                setSelectedCustomer(value);
                if (value && value !== 'new' && value !== 'anonymous') {
                  const customer = customers.find(c => c.id === value);
                  if (customer) {
                    setCustomerName(customer.name);
                    setCustomerType(customer.type);
                  }
                } else if (value === 'new') {
                  setCustomerName('');
                } else if (value === 'anonymous') {
                  setCustomerName('');
                }
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Client Anonyme (Comptant)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anonymous">Client Anonyme (Comptant)</SelectItem>
                  <SelectItem value="new">+ Nouveau Client</SelectItem>
                  {customers.length > 0 && customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.balance > 0 ? `(Dû: ${customer.balance.toLocaleString()} FCFA)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCustomer === 'new' && (
                <Input
                  className="mt-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nom du nouveau client..."
                />
              )}

              {selectedCustomer && selectedCustomer !== 'new' && selectedCustomer !== 'anonymous' && customers.find(c => c.id === selectedCustomer) && (
                <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded border text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Solde Actuel:</span>
                    <span className={`font-semibold ${customers.find(c => c.id === selectedCustomer)!.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {customers.find(c => c.id === selectedCustomer)!.balance.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limite Crédit:</span>
                    <span className="font-semibold">{customers.find(c => c.id === selectedCustomer)!.creditLimit.toLocaleString()} FCFA</span>
                  </div>
                  {customers.find(c => c.id === selectedCustomer)!.balance + total > customers.find(c => c.id === selectedCustomer)!.creditLimit && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Dépassement limite de crédit!</p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Panier vide
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.productId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm flex-1">{item.productName}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded border px-2 py-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="h-5 w-5 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="h-5 w-5 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{item.total.toLocaleString()} FCFA</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.unitPrice.toLocaleString()} / unité</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Sous-total:</span>
                <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
              </div>

              <div>
                <Label className="text-sm">Réduction (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-8"
                />
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Réduction:</span>
                  <span className="text-orange-600 font-medium">-{discount.toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label className="font-semibold">Mode de Paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => {
                    setPaymentMethod('cash');
                    setAmountPaid(total);
                  }}
                  className={`flex items-center gap-2 ${paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="sm"
                >
                  <Banknote className="h-4 w-4" />
                  Espèces
                </Button>
                <Button
                  variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                  onClick={() => {
                    setPaymentMethod('mobile');
                    setAmountPaid(total);
                  }}
                  className={`flex items-center gap-2 ${paymentMethod === 'mobile' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="sm"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
                <Button
                  variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                  onClick={() => {
                    setPaymentMethod('bank');
                    setAmountPaid(total);
                  }}
                  className={`flex items-center gap-2 ${paymentMethod === 'bank' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  size="sm"
                >
                  <CreditCard className="h-4 w-4" />
                  Virement
                </Button>
                <Button
                  variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                  onClick={() => {
                    setPaymentMethod('credit');
                    setAmountPaid(0);
                    if (!dueDate) {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      setDueDate(date.toISOString().split('T')[0]);
                    }
                  }}
                  disabled={!selectedCustomer || selectedCustomer === 'new' || selectedCustomer === 'anonymous' || !customers.find(c => c.id === selectedCustomer)?.allowCredit}
                  className={`flex items-center gap-2 ${paymentMethod === 'credit' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  À Crédit
                </Button>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  {paymentMethod === 'credit' ? 'Montant Payé (optionnel)' : 'Montant Reçu *'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                  className="mt-1 text-lg"
                  placeholder={paymentMethod === 'credit' ? '0' : total.toString()}
                />
              </div>

              {paymentMethod === 'credit' ? (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Vente:</span>
                    <span className="font-semibold">{total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Payé Maintenant:</span>
                    <span className="font-semibold text-green-600">{amountPaid.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Reste à Payer:</span>
                    <span className="text-red-600">{(total - amountPaid).toLocaleString()} FCFA</span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <Label className="text-xs font-semibold">Date d'Échéance</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 text-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              ) : (
                amountPaid >= total ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Monnaie à Rendre:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {(amountPaid - total).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                ) : amountPaid > 0 && selectedCustomer && selectedCustomer !== 'anonymous' && selectedCustomer !== 'new' ? (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Vente:</span>
                      <span className="font-semibold">{total.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payé Maintenant:</span>
                      <span className="font-semibold text-green-600">{amountPaid.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                      <span>Reste à Payer:</span>
                      <span className="text-red-600">{(total - amountPaid).toLocaleString()} FCFA</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      ℹ️ Paiement partiel - Le reste sera ajouté au compte client
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-sm text-red-600 font-semibold">
                      ⚠️ {selectedCustomer && selectedCustomer !== 'anonymous' && selectedCustomer !== 'new' ? 'Sélectionnez un montant partiel ou payez le total' : `Montant insuffisant: Manque ${(total - amountPaid).toLocaleString()} FCFA`}
                    </p>
                  </div>
                )
              )}

              <div>
                <Label className="text-sm font-semibold">Notes (optionnel)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  rows={2}
                  placeholder="Notes sur la transaction..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                ></textarea>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={!canCompleteSale()}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                title={!customerName.trim() && cart.length > 0 ? "Veuillez entrer le nom du client" : ""}
              >
                <Receipt className="h-5 w-5 mr-2" />
                {paymentMethod === 'credit'
                  ? (amountPaid > 0 ? '✓ Vendre avec Paiement Partiel' : '✓ Vendre à Crédit')
                  : '✓ Finaliser la Vente'}
              </Button>
              {cart.length > 0 && (!customerName.trim() || (paymentMethod === 'credit' && !canCompleteSale())) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">
                  ⚠️ {!customerName.trim() ? 'Veuillez sélectionner un client' : 'Vérifiez la limite de crédit'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {pendingSale && (
        <ReceiptDetailsForm
          isOpen={showReceiptForm}
          onClose={handleReceiptFormClose}
          sale={pendingSale}
          receiptNumber={generateReceiptNumber()}
          companyName={companyInfo.name}
        />
      )}
    </div>
  );
}
