import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdCreditCard, MdPeople, MdPerson, MdChevronLeft, MdChevronRight
} from 'react-icons/md';
import { FaLandmark } from 'react-icons/fa';

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/credit-cards', icon: MdCreditCard, label: 'Credit Cards' },
  { to: '/users', icon: MdPeople, label: 'Users', adminOnly: true },
  { to: '/profile', icon: MdPerson, label: 'Profile' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col min-h-screen shadow-2xl`}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-800/50">
        <FaLandmark className="text-blue-300 w-7 h-7 flex-shrink-0" />
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-lg leading-none">CardVault</p>
            <p className="text-xs text-blue-300">Management System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, adminOnly }) => {
          if (adminOnly && user?.role !== 'admin') return null;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'hover:bg-blue-800/50'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-blue-300 group-hover:text-white transition-colors" />
              {!collapsed && <span className="text-sm font-medium animate-fade-in">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-4 border-t border-blue-800/50 hover:bg-blue-800/50 transition-colors"
      >
        {collapsed ? <MdChevronRight className="w-5 h-5" /> : <MdChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
