import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, Package, TrendingUp,
  PartyPopper, Tent, ExternalLink, LogOut, ChevronLeft, ChevronRight, Leaf, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { initials } from '../../utils/formatters';

const NAV_ITEMS = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/reservas', label: 'Reservas', icon: CalendarDays },
  { to: '/espacos', label: 'Ocas & Espaços', icon: Tent },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/financeiro', label: 'Financeiro', icon: TrendingUp },
  { to: '/eventos', label: 'Eventos', icon: PartyPopper },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const content = (isMobile: boolean) => (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1C3028 0%, #152318 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-mata-800/60">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-9 h-9 bg-mata-600 rounded-organic flex items-center justify-center shadow-glow-mata">
            <Leaf size={18} className="text-white" />
          </div>
          {(sidebarOpen || isMobile) && (
            <div className="overflow-hidden">
              <p className="font-display text-white font-semibold leading-tight text-sm">Tayra</p>
              <p className="text-mata-400 text-xs leading-tight">Ecoparque</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={onCloseMobile} className="p-1 text-mata-300 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={isMobile ? onCloseMobile : undefined}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              }
              title={!sidebarOpen && !isMobile ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {(sidebarOpen || isMobile) && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          <div className="my-2 border-t border-mata-800/60" />

          <NavLink
            to="/reservar"
            target="_blank"
            className="nav-item-inactive text-ambar-300 hover:text-ambar-200"
            title={!sidebarOpen && !isMobile ? 'Link de Reserva Pública' : undefined}
          >
            <ExternalLink size={18} className="shrink-0" />
            {(sidebarOpen || isMobile) && <span className="truncate">Link de Reserva</span>}
          </NavLink>
        </div>
      </nav>

      {/* User + Toggle */}
      <div className="border-t border-mata-800/60 p-3 flex flex-col gap-2">
        {user && (
          <div className={`flex items-center gap-2.5 px-2 py-2 rounded-organic ${sidebarOpen || isMobile ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-organic-full bg-ambar-500 flex items-center justify-center text-xs font-bold text-mata-900 shrink-0">
              {initials(user.nome)}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.nome.split(' ')[0]}</p>
                <p className="text-xs text-mata-400 truncate">{user.role === 'admin' ? 'Administrador' : 'Equipe'}</p>
              </div>
            )}
            {(sidebarOpen || isMobile) && (
              <button onClick={handleLogout} className="p-1 text-mata-400 hover:text-white transition-colors" title="Sair">
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-organic text-mata-400 hover:bg-mata-800 hover:text-white transition-all duration-200"
            title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:block fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-organic"
        style={{ width: sidebarOpen ? '256px' : '68px' }}
      >
        {content(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-mata-950/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <aside className="relative w-64 h-full z-10 animate-slide-right">
            {content(true)}
          </aside>
        </div>
      )}
    </>
  );
}
