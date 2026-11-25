import { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, Menu, CheckCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { formatRelative } from '../../utils/formatters';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Painel Geral',
  '/reservas': 'Reservas',
  '/espacos': 'Ocas & Espaços',
  '/clientes': 'Clientes',
  '/estoque': 'Estoque',
  '/financeiro': 'Financeiro',
  '/eventos': 'Eventos',
};

const NOTIF_ICON: Record<string, string> = {
  info: '💬', alerta: '⚠️', sucesso: '✅', erro: '❌',
};

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { pathname } = useLocation();
  const { notificacoes, marcarLida, marcarTodasLidas, naoLidas, addNotificacao } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const notifRef = useRef<HTMLDivElement>(null);
  const count = naoLidas();

  const pageTitle = Object.entries(ROUTE_LABELS).find(([k]) => pathname === k || (k !== '/' && pathname.startsWith(k + '/')))?.[1] || 'Tayra Ecoparque';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ativarPush = async () => {
    if (!('Notification' in window)) return;
    const res = await Notification.requestPermission();
    setPerm(res);
    if (res === 'granted') {
      new Notification('Tayra Ecoparque', {
        body: 'Notificações ativadas! Você receberá alertas de novas reservas e estoque baixo.',
      });
      addNotificacao({
        tipo: 'sucesso',
        titulo: 'Alertas ativados neste dispositivo',
        mensagem: 'Novas reservas e avisos de estoque aparecerão aqui e no sistema.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-linho-200 flex items-center px-4 md:px-6 gap-3 shadow-organic-sm">
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden p-2 rounded-organic text-mata-800 hover:bg-linho-100"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-display text-lg md:text-xl font-semibold text-mata-900 flex-1 truncate">{pageTitle}</h1>

      {perm !== 'granted' && 'Notification' in window && (
        <button
          onClick={ativarPush}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-organic-full bg-ambar-100 text-ambar-800 hover:bg-ambar-200 text-xs font-medium transition-colors"
        >
          <BellRing size={14} /> Ativar alertas no celular
        </button>
      )}

      {/* Notificações */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative p-2 rounded-organic text-cedro-500 hover:bg-linho-100 hover:text-mata-800 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-barro-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-organic-lg shadow-organic-lg border border-linho-200 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-linho-200">
              <span className="text-sm font-semibold text-mata-900">Notificações</span>
              <button onClick={marcarTodasLidas} className="text-xs text-mata-600 hover:text-mata-800 flex items-center gap-1 transition-colors">
                <CheckCheck size={13} /> Marcar todas
              </button>
            </div>
            {perm !== 'granted' && 'Notification' in window && (
              <div className="px-4 py-2 bg-ambar-50 border-b border-ambar-100 flex items-center justify-between">
                <span className="text-[11px] text-ambar-800">Receber avisos no dispositivo?</span>
                <button onClick={ativarPush} className="text-[11px] font-semibold text-mata-700 underline">Ativar</button>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="p-6 text-center text-sm text-cedro-400">Nenhuma notificação</div>
              ) : (
                notificacoes.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => marcarLida(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-linho-100 cursor-pointer transition-colors hover:bg-linho-100 ${!n.lida ? 'bg-mata-50/50' : ''}`}
                  >
                    <span className="text-lg shrink-0">{NOTIF_ICON[n.tipo]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${!n.lida ? 'text-mata-900' : 'text-cedro-600'}`}>{n.titulo}</p>
                      <p className="text-xs text-cedro-500 mt-0.5 line-clamp-2">{n.mensagem}</p>
                      <p className="text-[10px] text-cedro-400 mt-1">{formatRelative(n.criadaEm)}</p>
                    </div>
                    {!n.lida && <div className="w-2 h-2 rounded-full bg-mata-500 mt-1 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
