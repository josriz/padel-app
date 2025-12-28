import React from "react";
import logo from "../assets/logo.jpg";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <img src={logo} alt="Padel Club" style={{ width: "200px", marginBottom: "1rem" }} />
      <h2>Benvenuto al Padel Club!</h2>
      <p>Accedi o registrati per iniziare.</p>
    </div>
  );
}
