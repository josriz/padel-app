export default function SkeletonCard() {
  return (
    <div className="item-card">
      <div className="item-image skeleton" />
      <div className="item-details">
        <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: "40%" }} />
      </div>
    </div>
  );
}
