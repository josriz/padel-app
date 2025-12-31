import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminVendorSalesHistory({ vendorId }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSales();
  }, [vendorId]);

  const loadSales = async () => {
    const { data } = await supabase
      .from("marketplace_products")
      .select("name, final_price, admin_gain, stock, created_at")
      .eq("created_by", vendorId)
      .order("created_at", { ascending: false });

    setSales(data || []);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Storico vendite</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Prodotto</th>
            <th>Prezzo finale</th>
            <th>Guadagno admin</th>
            <th>Stock</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>€ {s.final_price}</td>
              <td>€ {s.admin_gain}</td>
              <td>{s.stock}</td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
