import * as XLSX from "xlsx";

export function exportVendorProducts(products, vendorId) {
  const data = products.map(p => ({
    Prodotto: p.name,
    "Prezzo fornitore": p.price,
    "Prezzo finale": p.final_price,
    "Guadagno admin": p.admin_gain,
    "Commissione %": p.admin_percentage,
    Stock: p.stock,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vendor");

  XLSX.writeFile(wb, `vendor_${vendorId}.xlsx`);
}
