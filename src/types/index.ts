export type ProductCategory = 'ciment' | 'fer' | 'bois' | 'peinture';

export type CustomerType = 'gros' | 'détail';

export type ProductLocation = 'magasin' | 'véhicule';

export interface CementAttributes {
  brand: string;
  bagWeight: string;
  origin: string;
  arrivalDate: string;
  vehicleId?: string;
}

export interface IronAttributes {
  type: string;
  size: string;
  length: string;
  weight: string;
  brand: string;
}

export interface WoodAttributes {
  type: string;
  dimensions: string;
  qualityGrade: string;
}

export interface PaintAttributes {
  brand: string;
  type: string;
  color: string;
  volume: string;
  finish: string;
}

export type ProductAttributes = CementAttributes | IronAttributes | WoodAttributes | PaintAttributes;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  attributes: ProductAttributes;
  wholesalePrice: number;
  retailPrice: number;
  stockQuantity: number;
  location: ProductLocation;
  unit: string;
  poId?: string;
  originalQuantity?: number;
  sourceType?: 'iron_command' | 'wood_shipment' | 'paint_shipment' | 'cement_shipment' | 'purchase_order';
  sourceId?: string;
  supplier?: string;
  costPerUnit?: number;
  warehouseLocation?: string;
  addedDate?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'mobile' | 'bank' | 'credit';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface PaymentRecord {
  id: string;
  date: string;
  customerId: string;
  saleId?: string;
  saleReceiptNumber: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  receivedBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  type: CustomerType;
  balance: number;
  totalPurchases: number;
  totalPaid: number;
  creditLimit: number;
  allowCredit: boolean;
  createdDate: string;
  lastPurchaseDate?: string;
  lastPaymentDate?: string;
  paymentHistory: PaymentRecord[];
  notes?: string;
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  customerType: CustomerType;
  customerId?: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  dueDate?: string;
  notes?: string;
  seller: string;
  vehicleInfo?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
}

export type ShipmentStatus = 'commandé' | 'en transit' | 'à la frontière' | 'dédouanement' | 'arrivé' | 'en stock';

export interface POProduct {
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPurchasePrice: number;
  subtotal: number;
}

export type ExpenseType = 'Transport' | 'Douane/Taxes' | 'Frais de Dédouanement' | 'Chargement/Déchargement' | 'Frais de Stockage' | 'Autres Frais';

export interface POExpense {
  id: string;
  date: string;
  type: ExpenseType;
  description: string;
  amount: number;
  receiptReference?: string;
  addedBy: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  origin: string;
  orderDate: string;
  expectedArrivalDate: string;
  vehicleId: string;
  products: POProduct[];
  basePurchasePrice: number;
  expenses: POExpense[];
  shipmentStatus: ShipmentStatus;
  receivedDate?: string;
}

export type CementOrigin = 'Nigeria' | 'Cameroun' | 'Tchad';

export type CementShipmentStatus = 'commandé' | 'payé' | 'en route' | 'arrivé' | 'disponible à la vente' | 'en vente' | 'vendu' | 'clôturé';

export type CementTypeCameroun = 'Robust 42.5kg' | 'CPJ 35kg';
export type CementTypeNigeria = 'Dangote 42.5kg';
export type CementTypeTchad = 'CimafTchad 42.5kg' | 'CimafTchad 35.5kg';
export type CementType = CementTypeCameroun | CementTypeNigeria | CementTypeTchad;

export type LocationType = 'sur véhicule' | 'en entrepôt';

export type StorageReason = 'saison des pluies' | 'surplus' | 'autre';

export type CementExpenseStageNigeria =
  | 'Transport (Nigeria → Tchad)'
  | 'Douane/Taxes'
  | 'Frais Frontaliers'
  | 'Chargement/Déchargement'
  | 'Gardiennage'
  | 'Frais de Stockage'
  | 'Autres';

export type CementExpenseStageCameroun =
  | 'Chargement (Cameroun)'
  | 'Transport (Cameroun → Tchad)'
  | 'Sortie Cameroun'
  | 'Douane Tchad'
  | 'BNFT'
  | 'Mairie'
  | 'Bascule'
  | 'Déchargement/Stockage Entrepôt'
  | 'Autres Frais';

export type CementExpenseStageTchad =
  | 'Chargement'
  | 'Transport Local'
  | 'Mairie'
  | 'Bascule'
  | 'Déchargement/Stockage Entrepôt'
  | 'Autres Frais';

export interface CementShipmentExpense {
  id: string;
  date: string;
  stage: CementExpenseStageNigeria | CementExpenseStageCameroun | CementExpenseStageTchad;
  type: string;
  description: string;
  amount: number;
  receiptReference?: string;
  addedBy: string;
}

export interface CementShipment {
  id: string;
  shipmentId: string;
  origin: CementOrigin;
  supplier: string;
  vehicleId?: string;
  driverName?: string;
  driverPhone?: string;
  orderDate: string;
  bankPaymentDate: string;
  paymentReceiptNumber: string;
  amountPaid: number;
  departureDate: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  status: CementShipmentStatus;
  cementType: CementType;
  brand: string;
  weightPerBag: number;
  totalBags: number;
  bagsSold: number;
  pricePerBag: number;
  basePurchasePrice: number;
  expenses: CementShipmentExpense[];
  location: LocationType;
  storageReason?: StorageReason;
  averageSellingPrice: number;
  totalRevenue: number;
  collectionLocation?: string;
  distance?: string;
}

export type IronCommandStatus =
  | 'command'
  | 'pay'
  | 'en transit nigeria'
  | 'en transit cameroun'
  | 'en transit tchad'
  | 'arriv'
  | 'en dchargement'
  | 'vrifi'
  | 'cltur';

export type IronDiameter = 6 | 8 | 10 | 12 | 14 | 16 | 20 | 25 | 32 | 40;

export type IronExpenseStage =
  | 'arrive cameroun - transbordement'
  | 'transport cameroun  tchad'
  | 'frais frontaliers et douanes'
  | 'arrive tchad'
  | 'autres frais';

export interface IronCommandItem {
  diameter: IronDiameter;
  quantityOrdered: number;
  quantityReceived?: number;
  unitPrice: number;
  subtotal: number;
}

export interface IronCommandExpense {
  id: string;
  date: string;
  stage: IronExpenseStage;
  type: string;
  description: string;
  amount: number;
  location?: string;
  customsReference?: string;
  vehicleNumber?: string;
  addedBy: string;
}

export interface IronDiscrepancy {
  diameter: IronDiameter;
  ordered: number;
  received: number;
  difference: number;
  status: 'conforme' | 'manquant' | 'excdent';
  notes?: string;
}

export interface IronReception {
  date: string;
  location: string;
  responsiblePerson: string;
  discrepancies: IronDiscrepancy[];
  missingItemsCompensation: boolean;
  missingItemsNotes?: string;
  extraItemsDeduction: boolean;
  extraItemsNotes?: string;
  offloadingCost: number;
  numberOfWorkers: number;
  offloadingDateTime: string;
}

export interface IronCommand {
  id: string;
  commandNumber: string;
  supplier: string;
  originCountry: string;
  orderDate: string;
  bankPaymentDate: string;
  paymentReference: string;
  amountPaid: number;
  status: IronCommandStatus;
  items: IronCommandItem[];
  totalTonnageOrdered: number;
  totalTonnageReceived: number;
  departureNigeriaDate?: string;
  expectedArrivalTchad?: string;
  vehicleNigeria?: string;
  vehicleCameroun?: string;
  driverNigeria?: string;
  driverCameroun?: string;
  expenses: IronCommandExpense[];
  reception?: IronReception;
}

export type WoodShipmentStatus =
  | 'commandé'
  | 'payé'
  | 'en transit'
  | 'arrivé'
  | 'en stock'
  | 'vendu'
  | 'clôturé';

export type WoodType =
  | 'Planche'
  | 'Chevron'
  | 'Lambourde'
  | 'Plafond'
  | 'Panneau';

export type WoodGrade =
  | 'Grade A'
  | 'Grade B'
  | 'Grade C'
  | 'Standard'
  | 'Premium';

export type WoodExpenseStage =
  | 'Chargement (Cameroun)'
  | 'Transport (Cameroun → Tchad)'
  | 'Sortie Cameroun'
  | 'Douane Tchad'
  | 'BNFT'
  | 'Mairie'
  | 'Bascule'
  | 'Déchargement (Tchad)'
  | 'Autres Frais';

export interface WoodShipmentExpense {
  id: string;
  date: string;
  stage: WoodExpenseStage;
  type: string;
  description: string;
  amount: number;
  referenceNumber?: string;
  numberOfWorkers?: number;
  weight?: string;
  addedBy: string;
}

export type PanelThickness = '8mm' | '10mm' | '15mm';

export interface WoodShipment {
  id: string;
  shipmentId: string;
  supplier: string;
  originCountry: string;
  orderDate: string;
  bankPaymentDate: string;
  paymentReceiptNumber: string;
  amountPaid: number;
  status: WoodShipmentStatus;
  woodType: WoodType;
  panelThickness?: PanelThickness;
  grade: WoodGrade;
  dimensions: string;
  totalPieces: number;
  piecesSold: number;
  unitPrice: number;
  basePurchasePrice: number;
  expenses: WoodShipmentExpense[];
  departureCamerounDate?: string;
  expectedArrivalTchad?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  averageSellingPrice: number;
  totalRevenue: number;
  warehouseReception?: WarehouseReception;
  stockMovements: StockMovement[];
}

export type PaintOrigin = 'Cameroun' | 'Tchad';

export type PaintShipmentStatus =
  | 'commandé'
  | 'payé'
  | 'en transit'
  | 'arrivé'
  | 'en stock'
  | 'vendu'
  | 'clôturé';

export type PaintType =
  | 'Faume Universel'
  | 'Faume National'
  | 'Plastique'
  | 'Peinture à l\'Huile';

export type PaintFinish =
  | 'Mate'
  | 'Brillante'
  | 'Satinée';

export type PaintExpenseStageCameroun =
  | 'Chargement (Cameroun)'
  | 'Transport (Cameroun → Tchad)'
  | 'Sortie Cameroun'
  | 'Douane Tchad'
  | 'BNFT'
  | 'Mairie'
  | 'Bascule'
  | 'Déchargement (Tchad)'
  | 'Autres Frais';

export type PaintExpenseStageTchad =
  | 'Chargement (Tchad)'
  | 'Transport (Local)'
  | 'Mairie'
  | 'Bascule'
  | 'Déchargement'
  | 'Autres Frais';

export interface PaintShipmentExpense {
  id: string;
  date: string;
  stage: PaintExpenseStageCameroun | PaintExpenseStageTchad;
  type: string;
  description: string;
  amount: number;
  referenceNumber?: string;
  numberOfWorkers?: number;
  weight?: string;
  addedBy: string;
}

export interface PaintShipment {
  id: string;
  shipmentId: string;
  supplier: string;
  origin: PaintOrigin;
  orderDate: string;
  bankPaymentDate: string;
  paymentReceiptNumber: string;
  amountPaid: number;
  status: PaintShipmentStatus;
  brand: string;
  paintType: PaintType;
  color: string;
  unitVolume: string;
  finish: PaintFinish;
  totalUnits: number;
  unitsSold: number;
  unitPrice: number;
  basePurchasePrice: number;
  expenses: PaintShipmentExpense[];
  departureCamerounDate?: string;
  expectedArrivalTchad?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  averageSellingPrice: number;
  totalRevenue: number;
  warehouseReception?: WarehouseReception;
  stockMovements: StockMovement[];
}

export type WarehouseItemCondition = "Excellent" | "Bon" | "Endommagé";

export type StockRotationRate = "Rapide" | "Normale" | "Lente";

export type StockMovementType = "Entrée" | "Sortie";

export interface WarehouseReception {
  receptionDate: string;
  receptionTime: string;
  warehouseManager: string;
  warehouseLocation: string;
  itemCondition: WarehouseItemCondition;
  damagedQuantity: number;
  receptionNotes: string;
  photoUrl?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  sourceDestination: string;
  responsiblePerson: string;
  notes?: string;
  runningBalance: number;
}
