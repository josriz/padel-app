import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminVendorChart({ vendorId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadChart();
  }, [vendorId]);

  const loadChart = async () => {
    const { data } = await supabase
      .from("marketplace_products")
      .select("final_price, created_at")
      .eq("created_by", vendorId);

    const grouped = {};

    data.forEach(p => {
      const month = new Date(p.created_at).toISOString().slice(0, 7);
      grouped[month] = (grouped[month] || 0) + Number(p.final_price);
    });

    setData(
      Object.keys(grouped).map(m => ({
        month: m,
        total: grouped[m],
      }))
    );
  };

  return (
    <div style={{ height: 260, marginTop: 30 }}>
      <h4>Vendite mensili</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
