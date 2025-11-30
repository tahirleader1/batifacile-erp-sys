import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Sale, CompanyInfo, PurchaseOrder, POExpense, CementShipment, CementShipmentExpense, IronCommand, IronCommandExpense, IronReception, WoodShipment, WoodShipmentExpense, PaintShipment, PaintShipmentExpense, WarehouseReception, StockMovement, Customer } from '../types';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  companyInfo: CompanyInfo;
  purchaseOrders: PurchaseOrder[];
  cementShipments: CementShipment[];
  ironCommands: IronCommand[];
  woodShipments: WoodShipment[];
  paintShipments: PaintShipment[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Sale) => void;
  updateSale: (sale: Sale) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  addExpenseToPO: (poId: string, expense: POExpense) => void;
  receivePurchaseOrder: (id: string) => void;
  addCementShipment: (shipment: CementShipment) => void;
  updateCementShipment: (id: string, shipment: Partial<CementShipment>) => void;
  addExpenseToShipment: (shipmentId: string, expense: CementShipmentExpense) => void;
  recordCementSale: (shipmentId: string, bagsSold: number, revenue: number) => void;
  addIronCommand: (command: IronCommand) => void;
  updateIronCommand: (id: string, command: Partial<IronCommand>) => void;
  addExpenseToIronCommand: (commandId: string, expense: IronCommandExpense) => void;
  receiveIronCommand: (commandId: string, reception: IronReception) => void;
  addWoodShipment: (shipment: WoodShipment) => void;
  updateWoodShipment: (id: string, shipment: Partial<WoodShipment>) => void;
  addExpenseToWoodShipment: (shipmentId: string, expense: WoodShipmentExpense) => void;
  recordWoodSale: (shipmentId: string, piecesSold: number, revenue: number) => void;
  addPaintShipment: (shipment: PaintShipment) => void;
  updatePaintShipment: (id: string, shipment: Partial<PaintShipment>) => void;
  addExpenseToPaintShipment: (shipmentId: string, expense: PaintShipmentExpense) => void;
  recordPaintSale: (shipmentId: string, unitsSold: number, revenue: number) => void;
  receiveWoodInWarehouse: (shipmentId: string, reception: WarehouseReception) => void;
  receivePaintInWarehouse: (shipmentId: string, reception: WarehouseReception) => void;
  addStockMovement: (shipmentId: string, movement: StockMovement, isWood: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Ciment Portland 50kg CIMAF',
    category: 'ciment',
    attributes: {
      brand: 'CIMAF',
      bagWeight: '50kg',
      origin: 'Cameroun',
      arrivalDate: '2024-10-15',
      vehicleId: 'TC-001'
    },
    wholesalePrice: 4500,
    retailPrice: 5000,
    stockQuantity: 150,
    location: 'magasin',
    unit: 'sac'
  },
  {
    id: '2',
    name: 'Ciment CimTchad 42.5 50kg',
    category: 'ciment',
    attributes: {
      brand: 'CimTchad',
      bagWeight: '50kg',
      origin: 'Tchad',
      arrivalDate: '2024-10-20'
    },
    wholesalePrice: 4200,
    retailPrice: 4700,
    stockQuantity: 200,
    location: 'véhicule',
    unit: 'sac'
  },
  {
    id: '3',
    name: 'Ciment Dangote 32.5 50kg',
    category: 'ciment',
    attributes: {
      brand: 'Dangote',
      bagWeight: '50kg',
      origin: 'Nigeria',
      arrivalDate: '2024-10-18'
    },
    wholesalePrice: 4000,
    retailPrice: 4500,
    stockQuantity: 100,
    location: 'magasin',
    unit: 'sac'
  },
  {
    id: '4',
    name: 'Fer à béton HA 10mm x 12m',
    category: 'fer',
    attributes: {
      type: 'Haute Adhérence',
      size: '10mm',
      length: '12m',
      weight: '7.4kg',
      brand: 'ArcelorMittal'
    },
    wholesalePrice: 3500,
    retailPrice: 4000,
    stockQuantity: 80,
    location: 'magasin',
    unit: 'barre'
  },
  {
    id: '5',
    name: 'Fer à béton HA 12mm x 12m',
    category: 'fer',
    attributes: {
      type: 'Haute Adhérence',
      size: '12mm',
      length: '12m',
      weight: '10.7kg',
      brand: 'ArcelorMittal'
    },
    wholesalePrice: 5000,
    retailPrice: 5500,
    stockQuantity: 60,
    location: 'magasin',
    unit: 'barre'
  },
  {
    id: '6',
    name: 'Fer à béton HA 14mm x 12m',
    category: 'fer',
    attributes: {
      type: 'Haute Adhérence',
      size: '14mm',
      length: '12m',
      weight: '14.5kg',
      brand: 'Celsa'
    },
    wholesalePrice: 6500,
    retailPrice: 7200,
    stockQuantity: 45,
    location: 'magasin',
    unit: 'barre'
  },
  {
    id: '7',
    name: 'Plafond PVC Blanc 6m',
    category: 'bois',
    attributes: {
      type: 'PVC',
      dimensions: '6m x 25cm',
      qualityGrade: 'Premium'
    },
    wholesalePrice: 8000,
    retailPrice: 9000,
    stockQuantity: 45,
    location: 'magasin',
    unit: 'planche'
  },
  {
    id: '8',
    name: 'Plafond Bois Contreplaqué 2.5m',
    category: 'bois',
    attributes: {
      type: 'Contreplaqué',
      dimensions: '2.5m x 1.2m x 6mm',
      qualityGrade: 'Standard'
    },
    wholesalePrice: 12000,
    retailPrice: 13500,
    stockQuantity: 30,
    location: 'magasin',
    unit: 'panneau'
  },
  {
    id: '9',
    name: 'Lambris PVC Beige 4m',
    category: 'bois',
    attributes: {
      type: 'Lambris PVC',
      dimensions: '4m x 20cm',
      qualityGrade: 'Standard'
    },
    wholesalePrice: 5500,
    retailPrice: 6500,
    stockQuantity: 70,
    location: 'magasin',
    unit: 'lame'
  },
  {
    id: '10',
    name: 'Peinture Murale Blanche 25L',
    category: 'peinture',
    attributes: {
      brand: 'Dulux',
      type: 'Murale',
      color: 'Blanc',
      volume: '25L',
      finish: 'Mat'
    },
    wholesalePrice: 18000,
    retailPrice: 20000,
    stockQuantity: 30,
    location: 'magasin',
    unit: 'pot'
  },
  {
    id: '11',
    name: 'Peinture Extérieure Beige 20L',
    category: 'peinture',
    attributes: {
      brand: 'Seigneurie',
      type: 'Extérieure',
      color: 'Beige',
      volume: '20L',
      finish: 'Satiné'
    },
    wholesalePrice: 22000,
    retailPrice: 25000,
    stockQuantity: 15,
    location: 'magasin',
    unit: 'pot'
  },
  {
    id: '12',
    name: 'Peinture Glycéro Bleu 5L',
    category: 'peinture',
    attributes: {
      brand: 'Ripolin',
      type: 'Glycéro',
      color: 'Bleu',
      volume: '5L',
      finish: 'Brillant'
    },
    wholesalePrice: 8500,
    retailPrice: 10000,
    stockQuantity: 25,
    location: 'magasin',
    unit: 'pot'
  }
];

const initialCompanyInfo: CompanyInfo = {
  name: 'BATIFACILE',
  address: 'Avenue Charles de Gaulle, N\'Djamena, Tchad',
  phone: '+235 66 00 00 00',
  email: 'contact@batifacile.td',
  taxId: 'NIF: 123456789'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [cementShipments, setCementShipments] = useState<CementShipment[]>([]);
  const [ironCommands, setIronCommands] = useState<IronCommand[]>([]);
  const [woodShipments, setWoodShipments] = useState<WoodShipment[]>([]);
  const [paintShipments, setPaintShipments] = useState<PaintShipment[]>([]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addSale = (sale: Sale) => {
    setSales([sale, ...sales]);
    sale.items.forEach(item => {
      updateProduct(item.productId, {
        stockQuantity: products.find(p => p.id === item.productId)!.stockQuantity - item.quantity
      });
    });
  };

  const updateSale = (sale: Sale) => {
    setSales(sales.map(s => s.id === sale.id ? sale : s));
  };

  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
  };

  const addPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders([po, ...purchaseOrders]);
  };

  const updatePurchaseOrder = (id: string, updatedPO: Partial<PurchaseOrder>) => {
    setPurchaseOrders(purchaseOrders.map(po => po.id === id ? { ...po, ...updatedPO } : po));
  };

  const addExpenseToPO = (poId: string, expense: POExpense) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const updatedExpenses = [...po.expenses, expense];
    updatePurchaseOrder(poId, { expenses: updatedExpenses });
  };

  const receivePurchaseOrder = (id: string) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    const totalExpenses = po.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalLandedCost = po.basePurchasePrice + totalExpenses;
    const costPerUnit = totalLandedCost / po.products.reduce((sum, p) => sum + p.quantity, 0);

    po.products.forEach(poProduct => {
      const newProduct: Product = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: poProduct.productName,
        category: poProduct.category,
        attributes: {} as any,
        wholesalePrice: Math.round(costPerUnit * 1.15),
        retailPrice: Math.round(costPerUnit * 1.30),
        stockQuantity: poProduct.quantity,
        location: 'magasin',
        unit: poProduct.category === 'ciment' ? 'sac' :
              poProduct.category === 'fer' ? 'barre' :
              poProduct.category === 'bois' ? 'planche' : 'pot',
        poId: po.id,
        originalQuantity: poProduct.quantity
      };
      addProduct(newProduct);
    });

    updatePurchaseOrder(id, {
      shipmentStatus: 'en stock',
      receivedDate: new Date().toISOString()
    });
  };

  const addCementShipment = (shipment: CementShipment) => {
    setCementShipments([shipment, ...cementShipments]);
  };

  const updateCementShipment = (id: string, updatedShipment: Partial<CementShipment>) => {
    setCementShipments(cementShipments.map(s => s.id === id ? { ...s, ...updatedShipment } : s));
  };

  const addExpenseToShipment = (shipmentId: string, expense: CementShipmentExpense) => {
    const shipment = cementShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const updatedExpenses = [...shipment.expenses, expense];
    updateCementShipment(shipmentId, { expenses: updatedExpenses });
  };

  const recordCementSale = (shipmentId: string, bagsSold: number, revenue: number) => {
    const shipment = cementShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const newBagsSold = shipment.bagsSold + bagsSold;
    const newTotalRevenue = shipment.totalRevenue + revenue;
    const newAverageSellingPrice = newTotalRevenue / newBagsSold;

    const updates: Partial<CementShipment> = {
      bagsSold: newBagsSold,
      totalRevenue: newTotalRevenue,
      averageSellingPrice: newAverageSellingPrice
    };

    if (shipment.status === 'disponible à la vente') {
      updates.status = 'en vente';
    }

    if (newBagsSold >= shipment.totalBags) {
      updates.status = 'vendu';
    }

    updateCementShipment(shipmentId, updates);
  };

  const addIronCommand = (command: IronCommand) => {
    setIronCommands([command, ...ironCommands]);
  };

  const updateIronCommand = (id: string, updatedCommand: Partial<IronCommand>) => {
    setIronCommands(ironCommands.map(c => c.id === id ? { ...c, ...updatedCommand } : c));
  };

  const addExpenseToIronCommand = (commandId: string, expense: IronCommandExpense) => {
    const command = ironCommands.find(c => c.id === commandId);
    if (!command) return;

    const updatedExpenses = [...command.expenses, expense];
    updateIronCommand(commandId, { expenses: updatedExpenses });
  };

  const receiveIronCommand = (commandId: string, reception: IronReception) => {
    const command = ironCommands.find(c => c.id === commandId);
    if (!command) return;

    const totalReceived = reception.discrepancies.reduce((sum, d) => sum + d.received, 0);

    const updatedItems = command.items.map(item => {
      const discrepancy = reception.discrepancies.find(d => d.diameter === item.diameter);
      return {
        ...item,
        quantityReceived: discrepancy?.received || item.quantityOrdered
      };
    });

    const updates: Partial<IronCommand> = {
      reception,
      totalTonnageReceived: totalReceived,
      items: updatedItems,
      status: 'vérifié'
    };

    if (reception.offloadingCost > 0) {
      const offloadExpense: IronCommandExpense = {
        id: Date.now().toString(),
        date: reception.offloadingDateTime,
        stage: 'arrivée tchad',
        type: 'Main d\'Œuvre Déchargement',
        description: `Déchargement par ${reception.numberOfWorkers} travailleurs`,
        amount: reception.offloadingCost,
        addedBy: 'Système'
      };
      updates.expenses = [...command.expenses, offloadExpense];
    }

    updateIronCommand(commandId, updates);
  };

  const addWoodShipment = (shipment: WoodShipment) => {
    const shipmentWithDefaults = {
      ...shipment,
      stockMovements: shipment.stockMovements || []
    };
    setWoodShipments([shipmentWithDefaults, ...woodShipments]);
  };

  const updateWoodShipment = (id: string, updatedShipment: Partial<WoodShipment>) => {
    setWoodShipments(woodShipments.map(s => s.id === id ? { ...s, ...updatedShipment } : s));
  };

  const addExpenseToWoodShipment = (shipmentId: string, expense: WoodShipmentExpense) => {
    const shipment = woodShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const updatedExpenses = [...shipment.expenses, expense];
    updateWoodShipment(shipmentId, { expenses: updatedExpenses });
  };

  const recordWoodSale = (shipmentId: string, piecesSold: number, revenue: number) => {
    const shipment = woodShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const newPiecesSold = shipment.piecesSold + piecesSold;
    const newTotalRevenue = shipment.totalRevenue + revenue;
    const newAverageSellingPrice = newTotalRevenue / newPiecesSold;

    const updates: Partial<WoodShipment> = {
      piecesSold: newPiecesSold,
      totalRevenue: newTotalRevenue,
      averageSellingPrice: newAverageSellingPrice
    };

    if (shipment.status === 'en stock' && newPiecesSold > 0) {
      updates.status = 'en stock';
    }

    if (newPiecesSold >= shipment.totalPieces) {
      updates.status = 'vendu';
    }

    updateWoodShipment(shipmentId, updates);
  };

  const addPaintShipment = (shipment: PaintShipment) => {
    const shipmentWithDefaults = {
      ...shipment,
      stockMovements: shipment.stockMovements || []
    };
    setPaintShipments([shipmentWithDefaults, ...paintShipments]);
  };

  const updatePaintShipment = (id: string, updatedShipment: Partial<PaintShipment>) => {
    setPaintShipments(paintShipments.map(s => s.id === id ? { ...s, ...updatedShipment } : s));
  };

  const addExpenseToPaintShipment = (shipmentId: string, expense: PaintShipmentExpense) => {
    const shipment = paintShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const updatedExpenses = [...shipment.expenses, expense];
    updatePaintShipment(shipmentId, { expenses: updatedExpenses });
  };

  const recordPaintSale = (shipmentId: string, unitsSold: number, revenue: number) => {
    const shipment = paintShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const newUnitsSold = shipment.unitsSold + unitsSold;
    const newTotalRevenue = shipment.totalRevenue + revenue;
    const newAverageSellingPrice = newTotalRevenue / newUnitsSold;

    const updates: Partial<PaintShipment> = {
      unitsSold: newUnitsSold,
      totalRevenue: newTotalRevenue,
      averageSellingPrice: newAverageSellingPrice
    };

    if (shipment.status === 'en stock' && newUnitsSold > 0) {
      updates.status = 'en stock';
    }

    if (newUnitsSold >= shipment.totalUnits) {
      updates.status = 'vendu';
    }

    updatePaintShipment(shipmentId, updates);
  };

  const receiveWoodInWarehouse = (shipmentId: string, reception: WarehouseReception) => {
    const shipment = woodShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const adjustedTotalPieces = shipment.totalPieces - reception.damagedQuantity;

    const entryMovement: StockMovement = {
      id: Date.now().toString(),
      date: reception.receptionDate,
      type: 'Entrée',
      quantity: adjustedTotalPieces,
      sourceDestination: `Réception Entrepôt - ${reception.warehouseLocation}`,
      responsiblePerson: reception.warehouseManager,
      notes: reception.receptionNotes,
      runningBalance: adjustedTotalPieces
    };

    updateWoodShipment(shipmentId, {
      status: 'en stock',
      warehouseReception: reception,
      totalPieces: adjustedTotalPieces,
      stockMovements: [entryMovement]
    });

    const totalCost = shipment.basePurchasePrice + shipment.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const costPerPiece = adjustedTotalPieces > 0 ? totalCost / adjustedTotalPieces : 0;

    const productName = shipment.woodType === 'Panneau' && shipment.panelThickness
      ? `${shipment.woodType} ${shipment.panelThickness} ${shipment.dimensions || ''}`.trim()
      : `${shipment.woodType} ${shipment.dimensions || ''}`.trim();

    const woodProduct: Product = {
      id: `wood-${shipmentId}-${Date.now()}`,
      name: productName,
      category: 'bois',
      attributes: {
        type: shipment.woodType,
        dimensions: shipment.dimensions,
        qualityGrade: shipment.grade
      },
      wholesalePrice: Math.round(costPerPiece * 1.15),
      retailPrice: Math.round(costPerPiece * 1.30),
      stockQuantity: adjustedTotalPieces,
      location: 'magasin',
      unit: 'pièce',
      sourceType: 'wood_shipment',
      sourceId: shipmentId,
      supplier: shipment.supplier,
      costPerUnit: costPerPiece,
      warehouseLocation: reception.warehouseLocation,
      addedDate: reception.receptionDate
    };

    addProduct(woodProduct);
  };

  const receivePaintInWarehouse = (shipmentId: string, reception: WarehouseReception) => {
    const shipment = paintShipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const adjustedTotalUnits = shipment.totalUnits - reception.damagedQuantity;

    const entryMovement: StockMovement = {
      id: Date.now().toString(),
      date: reception.receptionDate,
      type: 'Entrée',
      quantity: adjustedTotalUnits,
      sourceDestination: `Réception Entrepôt - ${reception.warehouseLocation}`,
      responsiblePerson: reception.warehouseManager,
      notes: reception.receptionNotes,
      runningBalance: adjustedTotalUnits
    };

    updatePaintShipment(shipmentId, {
      status: 'en stock',
      warehouseReception: reception,
      totalUnits: adjustedTotalUnits,
      stockMovements: [entryMovement]
    });

    const totalCost = shipment.basePurchasePrice + shipment.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const costPerUnit = adjustedTotalUnits > 0 ? totalCost / adjustedTotalUnits : 0;

    const paintProduct: Product = {
      id: `paint-${shipmentId}-${Date.now()}`,
      name: `${shipment.brand} ${shipment.paintType} ${shipment.color} ${shipment.unitVolume}`,
      category: 'peinture',
      attributes: {
        brand: shipment.brand,
        type: shipment.paintType,
        color: shipment.color,
        volume: shipment.unitVolume,
        finish: shipment.finish
      },
      wholesalePrice: Math.round(costPerUnit * 1.15),
      retailPrice: Math.round(costPerUnit * 1.30),
      stockQuantity: adjustedTotalUnits,
      location: 'magasin',
      unit: 'pot',
      sourceType: 'paint_shipment',
      sourceId: shipmentId,
      supplier: shipment.supplier,
      costPerUnit: costPerUnit,
      warehouseLocation: reception.warehouseLocation,
      addedDate: reception.receptionDate
    };

    addProduct(paintProduct);
  };

  const addStockMovement = (shipmentId: string, movement: StockMovement, isWood: boolean) => {
    if (isWood) {
      const shipment = woodShipments.find(s => s.id === shipmentId);
      if (!shipment) return;
      updateWoodShipment(shipmentId, {
        stockMovements: [...shipment.stockMovements, movement]
      });
    } else {
      const shipment = paintShipments.find(s => s.id === shipmentId);
      if (!shipment) return;
      updatePaintShipment(shipmentId, {
        stockMovements: [...shipment.stockMovements, movement]
      });
    }
  };

  return (
    <AppContext.Provider value={{
      products,
      sales,
      customers,
      companyInfo,
      purchaseOrders,
      cementShipments,
      ironCommands,
      woodShipments,
      paintShipments,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      updateSale,
      addCustomer,
      updateCustomer,
      updateCompanyInfo,
      addPurchaseOrder,
      updatePurchaseOrder,
      addExpenseToPO,
      receivePurchaseOrder,
      addCementShipment,
      updateCementShipment,
      addExpenseToShipment,
      recordCementSale,
      addIronCommand,
      updateIronCommand,
      addExpenseToIronCommand,
      receiveIronCommand,
      addWoodShipment,
      updateWoodShipment,
      addExpenseToWoodShipment,
      recordWoodSale,
      addPaintShipment,
      updatePaintShipment,
      addExpenseToPaintShipment,
      recordPaintSale,
      receiveWoodInWarehouse,
      receivePaintInWarehouse,
      addStockMovement
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
