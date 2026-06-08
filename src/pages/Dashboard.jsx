import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { MdPeople, MdCreditCard, MdCheckCircle, MdBlock } from 'react-icons/md';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#22c55e', '#ef4444', '#6b7280', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="glass-card rounded-2xl p-6 flex items-center gap-4 animate-fade-in hover:scale-105 transition-transform duration-200">
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      {trend && <p className="text-xs text-green-500 mt-0.5">{trend}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats?.cardStatusStats?.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count
  })) || [];

  const barData = stats?.monthlyRegistrations?.map(m => ({
    name: MONTHS[m._id.month - 1],
    users: m.count
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Overview of your credit card management system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={MdPeople} label="Total Users" value={stats?.totalUsers} color="from-blue-500 to-blue-700" trend="+12% this month" />
        <StatCard icon={MdCreditCard} label="Total Cards" value={stats?.totalCards} color="from-indigo-500 to-indigo-700" />
        <StatCard icon={MdCheckCircle} label="Active Cards" value={stats?.activeCards} color="from-green-500 to-green-700" />
        <StatCard icon={MdBlock} label="Blocked Cards" value={stats?.blockedCards} color="from-red-500 to-red-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No card data available</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly User Registrations</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No registration data available</div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-600' },
            { label: 'Active Cards', value: stats?.activeCards || 0, color: 'text-green-600' },
            { label: 'Blocked Cards', value: stats?.blockedCards || 0, color: 'text-red-600' },
            { label: 'Total Portfolio', value: stats?.totalCards || 0, color: 'text-indigo-600' }
          ].map((item) => (
            <div key={item.label} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
