import { LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DashboardLayout({ title, roleLabel, navItems, activeTab, setActiveTab, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-brand-600 to-brand-800 flex flex-col">
        <div className="p-5 flex items-center gap-2.5">
          <div className="bg-white/15 p-2 rounded-lg">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="font-semibold text-white">MediCare HMS</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-white/20 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-red-500/90 hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-brand-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-900">{title}</h1>
            <p className="text-sm text-brand-500/80">{roleLabel}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-brand-800">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
