import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FIELDS = { farmers: 'favoriteFarmers', products: 'favoriteProducts', markets: 'savedMarkets' };
const LABELS = { farmers: 'favourite farmers', products: 'favourites', markets: 'saved markets' };

/** Favourite / save toggle shared by product, farmer and market cards. */
export default function useFavorite(type, id) {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const field = FIELDS[type];
  const active = Boolean(user?.[field]?.some((x) => String(x) === String(id)));

  async function toggle(event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!user) {
      toast('Please log in as a customer to save favourites', 'error');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (user.role !== 'customer') {
      toast('Favourites are available for customer accounts', 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/customer/favorites/${type}/${id}`);
      setUser((u) => ({ ...u, [field]: res.ids }));
      toast(res.saved ? `Added to ${LABELS[type]}` : `Removed from ${LABELS[type]}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return { active, toggle, busy };
}
