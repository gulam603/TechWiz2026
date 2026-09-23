export default function EmptyState({ image = '/illustrations/basket.webp', title, message, action }) {
  return (
    <div className="empty-state">
      <img src={image} alt="" />
      <h5>{title}</h5>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
