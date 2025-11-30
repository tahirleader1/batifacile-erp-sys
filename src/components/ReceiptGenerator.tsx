import { Sale } from '../types';

interface ClientInfo {
  name?: string;
  phone?: string;
}

interface VehicleInfo {
  plate?: string;
  driverName?: string;
  driverPhone?: string;
}

interface SellerInfo {
  name: string;
  phone: string;
}

interface ReceiptGeneratorProps {
  sale: Sale;
  receiptNumber: string;
  companyName?: string;
  clientInfo?: ClientInfo;
  vehicleInfo?: VehicleInfo;
  sellerInfo?: SellerInfo;
}

export function ReceiptGenerator({
  sale,
  receiptNumber,
  clientInfo,
  vehicleInfo,
  sellerInfo
}: ReceiptGeneratorProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const hasVehicleInfo = vehicleInfo && (vehicleInfo.plate || vehicleInfo.driverName || vehicleInfo.driverPhone);

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }

          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          .bg-\\[\\#D4C5B0\\] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">

        {/* BUTTONS - Hidden when printing */}
        <div className="no-print max-w-5xl mx-auto mb-4 flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Retour
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨️ Imprimer
          </button>
        </div>

        {/* RECEIPT CONTAINER */}
        <div
          className="receipt-container mx-auto bg-white shadow-lg print:shadow-none"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm 15mm'
          }}
        >

          {/* HEADER */}
          <div className="flex justify-between items-start mb-6">
            {/* Left - Title and Info */}
            <div>
              <h1 className="text-6xl font-black text-gray-900 mb-4 leading-none">FACTURE</h1>
              <div className="flex gap-3 mb-4">
                <div className="border-2 border-black rounded-full px-6 py-2">
                  <span className="text-base font-medium">Facture n°{receiptNumber}</span>
                </div>
                <div className="border-2 border-black rounded-full px-4 py-2">
                  <span className="text-base font-medium">{formatDate(sale.date)}</span>
                </div>
              </div>
            </div>

            {/* Right - Logo */}
            <div className="flex items-start">
              <img
                src="/Blue Minimalist Real Estate Logo.png"
                alt="Company Logo"
                className="w-48 h-auto"
              />
            </div>
          </div>

          {/* HORIZONTAL LINE */}
          <div className="border-b-2 border-black mb-6"></div>

          {/* CLIENT, VEHICLE, SELLER INFO - THREE EQUAL COLUMNS */}
          <div className="grid grid-cols-3 gap-8 mb-6">

            {/* CLIENT */}
            <div>
              <h2 className="text-base font-bold mb-2 uppercase">Information Client</h2>
              <p className="text-sm">Nom: {clientInfo?.name || '_____________'}</p>
              <p className="text-sm">Tel: {clientInfo?.phone || '_____________'}</p>
            </div>

            {/* VEHICLE */}
            <div>
              <h2 className="text-base font-bold mb-2 uppercase">Details Vehicule</h2>
              {hasVehicleInfo ? (
                <>
                  <p className="text-sm">Plaque: {vehicleInfo.plate || '_____________'}</p>
                  <p className="text-sm">chauffeur: {vehicleInfo.driverName || '_____________'}</p>
                  <p className="text-sm">Tel: {vehicleInfo.driverPhone || '_____________'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm">Plaque: _____________</p>
                  <p className="text-sm">chauffeur: _____________</p>
                  <p className="text-sm">Tel: _____________</p>
                </>
              )}
            </div>

            {/* SELLER */}
            <div>
              <h2 className="text-base font-bold mb-2 uppercase">Vendeur</h2>
              <p className="text-sm">Nom: {sellerInfo?.name || 'Bechir Saleh'}</p>
              <p className="text-sm">Tel: {sellerInfo?.phone || '60 555020'}</p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full border-2 border-black mb-6">
            <colgroup>
              <col style={{ width: '45%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#D4C5B0]">
                <th className="border border-black py-2 px-3 text-left font-bold text-sm uppercase">Description</th>
                <th className="border border-black py-2 px-3 text-right font-bold text-sm uppercase">Prix</th>
                <th className="border border-black py-2 px-3 text-center font-bold text-sm uppercase">Quantité</th>
                <th className="border border-black py-2 px-3 text-right font-bold text-sm uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="bg-white">
                  <td className="border border-black py-2 px-3 text-sm">{item.productName}</td>
                  <td className="border border-black py-2 px-3 text-right text-sm">
                    {formatCurrency(item.unitPrice)} FCFA
                  </td>
                  <td className="border border-black py-2 px-3 text-center text-sm">
                    {String(item.quantity).padStart(2, '0')}
                  </td>
                  <td className="border border-black py-2 px-3 text-right text-sm font-semibold">
                    {formatCurrency(item.total)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="flex justify-end mb-6">
            <div className="w-80">
              {/* Subtotal */}
              <div className="flex justify-between mb-3 text-base">
                <span>Sous total :</span>
                <span className="font-semibold">{formatCurrency(sale.subtotal)} FCFA</span>
              </div>

              {/* Discount if applicable */}
              {sale.discount > 0 && (
                <div className="flex justify-between mb-3 text-base">
                  <span>Remise :</span>
                  <span className="font-semibold">-{formatCurrency(sale.discount)} FCFA</span>
                </div>
              )}

              {/* Total */}
              <div className="bg-[#D4C5B0] px-4 py-2 flex justify-between items-center">
                <span className="text-lg font-bold uppercase">Total :</span>
                <span className="text-xl font-bold">{formatCurrency(sale.total)} FCFA</span>
              </div>
            </div>
          </div>

          {/* PAYMENT INFO */}
          <div className="mb-6 text-xs">
            <p className="leading-relaxed">Paiement à l'ordre de {sellerInfo?.name || 'Bechir Saleh'}</p>
            <p className="leading-relaxed">Méthode: {sale.paymentMethod}</p>
          </div>

          {/* FOOTER */}
          <div className="border-t-2 border-black pt-3">
            <p className="text-center text-sm font-semibold uppercase">
              Merci de votre confiance
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
