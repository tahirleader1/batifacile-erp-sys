export type PartnerVehicleStatus =
  | "En Route"
  | "Arrivé"
  | "En Vente"
  | "Vendu"
  | "Clôturé";

export interface PartnerExpense {
  id: string;
  description: string;
  amount: number;
  date: Date;
}

export interface PartnerSale {
  id: string;
  bagsSold: number;
  pricePerBag?: number;
  date: Date;
  notes?: string;
}

export interface PartnerVehicle {
  id: string;
  partnerName: string;
  partnerPhone: string;
  partnerEmail?: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  totalBags: number;
  soldBags: number;
  remainingBags: number;
  arrivalDate: Date;
  status: PartnerVehicleStatus;
  accessPin: string;
  expenses: PartnerExpense[];
  sales: PartnerSale[];
  createdAt: Date;
}
