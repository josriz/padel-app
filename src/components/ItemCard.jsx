import { useState } from "react";

export default function ItemCard({ item }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="item-card">
      <img src={item.image} alt={item.title} className="item-image" />

      {item.badge && <span className={`badge ${item.badge === "OFFERTA" ? "sale" : ""}`}>{item.badge}</span>}

      <div className="wishlist" onClick={() => setLiked(!liked)}>
        {liked ? "❤️" : "🤍"}
      </div>

      <div className="item-details">
        <h3>{item.title}</h3>
        <p>{item.description}</p>

        <div className="rating">
          ⭐ {item.rating}
        </div>

        <div className="price">{item.price}</div>
        <div className="seller">Venduto da {item.seller}</div>

        <div className="item-actions">
          <button className="cart-btn">Carrello</button>
          <button className="buy-btn">Compra</button>
        </div>
      </div>
    </div>
  );
}
