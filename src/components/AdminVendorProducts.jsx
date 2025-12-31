import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { exportVendorProducts } from "../utils/exportVendorProducts";
import AdminVendorSalesHistory from "./AdminVendorSalesHistory";
import AdminVendorChart from "./AdminVendorChart";

export default function AdminVendorProducts({ vendorId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, [vendorId]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("marketplace_products")
      .select(`
        id,
        name,
        price,
        final_price,
        admin_gain,
        admin_percentage,
        stock
      `)
      .eq("created_by", vendorId)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  const payVendor = async () => {
    if (!window.confirm("Confermi pagamento vendor?")) return;

    await supabase
      .from("marketplace_products")
      .update({ stock: 0 }) // segna come venduto
      .eq("created_by", vendorId)
      .gt("stock", 0);

    loadProducts();
    alert("Vendor segnato come pagato");
  };

  return (
    <div style={{ padding: 16, background: "#f9fafb", borderRadius: 8 }}>
      <h4>Prodotti vendor</h4>
      <button onClick={() => exportVendorProducts(products, vendorId)}>
        Export Excel
      </button>
      <button onClick={payVendor} style={{ marginLeft: 10 }}>
        Segna come pagato
      </button>

      <table style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>Prodotto</th>
            <th>Prezzo</th>
            <th>Finale</th>
            <th>Guadagno</th>
            <th>Comm.</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>€ {Number(p.price).toFixed(2)}</td>
              <td>€ {Number(p.final_price).toFixed(2)}</td>
              <td>€ {Number(p.admin_gain).toFixed(2)}</td>
              <td>{p.admin_percentage}%</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminVendorSalesHistory vendorId={vendorId} />
      <AdminVendorChart vendorId={vendorId} />
    </div>
  );
}
