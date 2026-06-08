import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdLock, MdEdit, MdSave } from 'react-icons/md';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileImage: user?.profileImage || ''
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      updateUser(data.data);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const validatePwd = () => {
    const e = {};
    if (!pwdForm.currentPassword) e.currentPassword = 'Required';
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) e.newPassword = 'Min 6 characters';
    if (pwdForm.newPassword !== pwdForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setPwdErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (!validatePwd()) return;
    setLoading(true);
    try {
      await changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
              {initials}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</h3>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full capitalize">
              {user?.role}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full capitalize">
              {user?.status}
            </span>
          </div>
          {user?.lastLogin && (
            <p className="text-xs text-gray-400 mt-2">Last login: {new Date(user.lastLogin).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[{ id: 'profile', label: 'Edit Profile' }, { id: 'security', label: 'Security' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className={editMode ? 'btn-secondary' : 'btn-primary'}
            >
              {editMode ? 'Cancel' : <><MdEdit className="inline w-4 h-4 mr-1" />Edit</>}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image URL</label>
                  <input value={profileForm.profileImage} onChange={e => setProfileForm(p => ({ ...p, profileImage: e.target.value }))} className="input-field" placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} className="input-field resize-none" rows={2} placeholder="123 Main St, City, Country" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                <MdSave className="inline w-4 h-4 mr-1" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: MdPerson, label: 'Full Name', value: `${user?.firstName} ${user?.lastName}` },
                { icon: MdEmail, label: 'Email Address', value: user?.email },
                { icon: MdPhone, label: 'Phone Number', value: user?.phone || 'Not provided' },
                { icon: MdLocationOn, label: 'Address', value: user?.address || 'Not provided' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            <MdLock className="inline w-5 h-5 mr-2 text-primary-600" />
            Change Password
          </h3>
          <form onSubmit={handlePwdSubmit} className="space-y-4 max-w-md">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirmPassword' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input
                  type="password"
                  value={pwdForm[key]}
                  onChange={e => { setPwdForm(p => ({ ...p, [key]: e.target.value })); setPwdErrors(p => ({ ...p, [key]: '' })); }}
                  className={`input-field ${pwdErrors[key] ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                {pwdErrors[key] && <p className="mt-1 text-xs text-red-500">{pwdErrors[key]}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
