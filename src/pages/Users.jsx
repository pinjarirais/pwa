import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import UserTable from '../components/UserTable';
import { MdSearch, MdAdd, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', phone: '', address: '', role: 'user', status: 'active' };

const UserModal = ({ user, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(user ? { ...user, password: '' } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!user && (!form.password || form.password.length < 6)) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (user && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName', placeholder: 'John' },
              { label: 'Last Name', key: 'lastName', placeholder: 'Doe' }
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input value={form[key]} onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); }}
                  className={`input-field ${errors[key] ? 'border-red-500' : ''}`} placeholder={placeholder} />
                {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
              className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="john@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {user ? 'Password (leave blank to keep)' : 'Password'}
            </label>
            <input type="password" value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
              className={`input-field ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="input-field" placeholder="City, Country" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ user, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <MdClose className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Delete User</h3>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.firstName} {user?.lastName}</span>? This action cannot be undone.
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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async (page = 1, searchVal = search) => {
    setLoading(true);
    try {
      const { data } = await getUsers({ page, limit: 10, search: searchVal });
      setUsers(data.data.users);
      setPagination({ page: data.data.page, pages: data.data.pages, total: data.data.total });
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1, search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      await createUser(formData);
      toast.success('User created successfully');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    setActionLoading(true);
    try {
      await updateUser(editUser._id, formData);
      toast.success('User updated successfully');
      setEditUser(null);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(deleteTarget._id);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all system users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 w-fit">
          <MdAdd className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-xs">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 input-field"
            />
          </div>
        </div>

        <UserTable
          users={users}
          loading={loading}
          pagination={pagination}
          onEdit={setEditUser}
          onDelete={setDeleteTarget}
          onPageChange={(p) => fetchUsers(p)}
        />
      </div>

      {showModal && (
        <UserModal onSubmit={handleCreate} onClose={() => setShowModal(false)} loading={actionLoading} />
      )}
      {editUser && (
        <UserModal user={editUser} onSubmit={handleEdit} onClose={() => setEditUser(null)} loading={actionLoading} />
      )}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} loading={actionLoading} />
      )}
    </div>
  );
};

export default Users;
