import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import EmptyState from '../../components/common/EmptyState';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container py-5">
      <EmptyState icon="bi-signpost-split" title="This page wandered off the market" message="The page you're looking for doesn't exist or has moved." action={<Link to="/" className="btn btn-primary">Back home</Link>} />
    </div>
  );
}
