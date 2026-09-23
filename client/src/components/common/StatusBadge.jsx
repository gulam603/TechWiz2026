import { ORDER_STATUS_META, PRODUCT_STATUS_LABEL } from '../../utils/format';

export default function StatusBadge({ status, label }) {
  const text = label || ORDER_STATUS_META[status]?.label || PRODUCT_STATUS_LABEL[status] || status;
  return (
    <span className={`status-badge s-${status}`}>
      <span className="dot" />
      {text}
    </span>
  );
}
