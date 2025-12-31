import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
<AdminVendorStats />


export default function AdminVendorStats() {
  const [totalGain, setTotalGain] = useState(0);
  const [monthlyGain, setMonthlyGain] = useState(0);
  const [vendorProducts, setVendorProducts] = useState(0);
  const [soldProducts, setSoldProducts] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data, error } = await supabase
      .from("products")
      .select("admin_gain, created_at, status")
      .not("vendor_id", "is", null);

    if (error) return;

    const sold = data.filter(p => p.status === "sold");

    setVendorProducts(data.length);
    setSoldProducts(sold.length);

    setTotalGain(
      sold.reduce((sum, p) => sum + Number(p.admin_gain || 0), 0)
    );

    setMonthlyGain(
      sold
        .filter(p => new Date(p.created_at) >= startOfMonth)
        .reduce((sum, p) => sum + Number(p.admin_gain || 0), 0)
    );
  };

  return (
    <div style={wrapper}>
      <StatCard title="Guadagno totale" value={`€ ${totalGain.toFixed(2)}`} />
      <StatCard title="Guadagno mese corrente" value={`€ ${monthlyGain.toFixed(2)}`} />
      <StatCard title="Prodotti vendor" value={vendorProducts} />
      <StatCard title="Prodotti venduti" value={soldProducts} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={card}>
      <h4 style={{ margin: 0, color: "#555" }}>{title}</h4>
      <p style={{ fontSize: "22px", fontWeight: "bold", marginTop: "8px" }}>
        {value}
      </p>
    </div>
  );
}

const wrapper = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
};

const card = {
  background: "#fff",
  padding: "18px",
  borderRadius: "12px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
};
