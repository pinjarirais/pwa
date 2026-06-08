import { useState, useEffect, useCallback } from 'react';
import { getCards, createCard, updateCard, deleteCard, changePin, downloadCard, getUsers } from '../services/api';
import CardList from '../components/CardList';
import CardForm from '../components/CardForm';
import { MdSearch, MdAdd, MdClose, MdFilterList } from 'react-icons/md';
import toast from 'react-hot-toast';

const ChangePinModal = ({ card, onClose }) => {
  const [form, setForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.oldPin || form.oldPin.length !== 4) e.oldPin = '4-digit PIN required';
    if (!form.newPin || form.newPin.length !== 4) e.newPin = '4-digit PIN required';
    if (form.newPin !== form.confirmPin) e.confirmPin = 'PINs do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await changePin(card._id, { oldPin: form.oldPin, newPin: form.newPin });
      toast.success('PIN changed successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change PIN</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MdClose className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Card: •••• {card.cardNumber?.slice(-4)}</p>
          {[
            { label: 'Current PIN', key: 'oldPin' },
            { label: 'New PIN', key: 'newPin' },
            { label: 'Confirm New PIN', key: 'confirmPin' }
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type="password"
                maxLength={4}
                value={form[key]}
                onChange={e => { setForm(p => ({ ...p, [key]: e.target.value.replace(/\D/g, '').slice(0, 4) })); setErrors(p => ({ ...p, [key]: '' })); }}
                className={`input-field tracking-widest text-center text-xl ${errors[key] ? 'border-red-500' : ''}`}
                placeholder="••••"
              />
              {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Changing...' : 'Change PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ card, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <MdClose className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Delete Card</h3>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
        Delete card ending in <span className="font-semibold text-gray-700 dark:text-gray-200">{card?.cardNumber?.slice(-4)}</span>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [pinCard, setPinCard] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCards = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getCards({ page, limit: 9, search, status: statusFilter });
      setCards(data.data.cards);
      setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
    } catch {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCards, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchCards]);

  useEffect(() => {
    getUsers({ limit: 100 }).then(({ data }) => setUsers(data.data.users)).catch(() => {});
  }, []);

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await createCard(formData);
      toast.success('Card created successfully');
      setShowForm(false);
      fetchCards();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setActionLoading(true);
    try {
      await updateCard(editCard._id, formData);
      toast.success('Card updated successfully');
      setEditCard(null);
      fetchCards(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteCard(deleteTarget._id);
      toast.success('Card deleted successfully');
      setDeleteTarget(null);
      fetchCards(pagination.page);
    } catch {
      toast.error('Failed to delete card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (card) => {
    try {
      toast.loading('Generating PDF...');
      const { data } = await downloadCard(card._id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${card.cardNumber?.slice(-4)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF downloaded successfully');
    } catch {
      toast.dismiss();
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Cards</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{pagination.total} cards total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 w-fit">
          <MdAdd className="w-5 h-5" />
          Add Card
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by cardholder..."
            className="pl-10 input-field"
          />
        </div>
        <div className="relative">
          <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-10 input-field pr-8"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <CardList
        cards={cards}
        loading={loading}
        onEdit={setEditCard}
        onDelete={setDeleteTarget}
        onChangePin={setPinCard}
        onDownload={handleDownload}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchCards(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === pagination.page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && <CardForm onSubmit={handleCreate} onClose={() => setShowForm(false)} users={users} />}
      {editCard && <CardForm card={editCard} onSubmit={handleEdit} onClose={() => setEditCard(null)} users={users} />}
      {pinCard && <ChangePinModal card={pinCard} onClose={() => setPinCard(null)} />}
      {deleteTarget && <DeleteModal card={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} loading={actionLoading} />}
    </div>
  );
};

export default CreditCards;
