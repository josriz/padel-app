import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import AdminVendorProducts from "./AdminVendorProducts";

export default function AdminVendorEarnings() {
  const [vendors, setVendors] = useState([]);
  const [openVendor, setOpenVendor] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const { data } = await supabase
      .from("marketplace_products")
      .select(`
        created_by,
        final_price,
        admin_gain,
        admin_percentage,
        stock
      `);

    const grouped = {};

    data.forEach(p => {
      const vendorId = p.created_by;
      if (!grouped[vendorId]) {
        grouped[vendorId] = {
          vendor_id: vendorId,
          products: 0,
          sold: 0,
          revenue: 0,
          gain: 0,
          commissionSum: 0,
          commissionCount: 0,
        };
      }
      const v = grouped[vendorId];
      v.products++;
      if (p.stock === 0) { // consideriamo stock 0 = venduto
        v.sold++;
        v.revenue += Number(p.final_price || 0);
        v.gain += Number(p.admin_gain || 0);
        v.commissionSum += Number(p.admin_percentage || 0);
        v.commissionCount++;
      }
    });

    setVendors(Object.values(grouped));
  };

  return (
    <div>
      <h3>Guadagni per rivenditore</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Prodotti</th>
            <th>Venduti</th>
            <th>Fatturato</th>
            <th>Guadagno</th>
            <th>Comm. media</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(v => (
            <React.Fragment key={v.vendor_id}>
              <tr
                onClick={() =>
                  setOpenVendor(openVendor === v.vendor_id ? null : v.vendor_id)
                }
                style={{ cursor: "pointer" }}
              >
                <td>{v.vendor_id}</td>
                <td>{v.products}</td>
                <td>{v.sold}</td>
                <td>€ {v.revenue.toFixed(2)}</td>
                <td style={{ fontWeight: "bold", color: "#16a34a" }}>
                  € {v.gain.toFixed(2)}
                </td>
                <td>
                  {v.commissionCount
                    ? `${(v.commissionSum / v.commissionCount).toFixed(1)}%`
                    : "-"}
                </td>
              </tr>

              {openVendor === v.vendor_id && (
                <tr>
                  <td colSpan="6">
                    <AdminVendorProducts vendorId={v.vendor_id} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
