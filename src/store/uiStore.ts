import { create } from 'zustand';
import { storage } from '../utils/storage';
import { NOTIFICACOES_SEED } from '../data/seedData';
import type { Notificacao } from '../types';

function uid() { return crypto.randomUUID(); }

interface UIState {
  sidebarOpen: boolean;
  notificacoes: Notificacao[];
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  initNotificacoes: () => void;
  addNotificacao: (n: Omit<Notificacao,'id'|'criadaEm'|'lida'>) => void;
  marcarLida: (id: string) => void;
  marcarTodasLidas: () => void;
  naoLidas: () => number;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  notificacoes: [],

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),

  initNotificacoes: () => {
    let data = storage.getNotificacoes();
    if (data.length===0) { data = NOTIFICACOES_SEED; storage.setNotificacoes(data); }
    set({ notificacoes: data });
  },

  addNotificacao: (partial) => {
    const n: Notificacao = { ...partial, id: uid(), lida: false, criadaEm: new Date().toISOString() };
    const updated = [n, ...get().notificacoes];
    storage.setNotificacoes(updated);
    set({ notificacoes: updated });
  },

  marcarLida: (id) => {
    const updated = get().notificacoes.map(n => n.id===id ? {...n,lida:true} : n);
    storage.setNotificacoes(updated);
    set({ notificacoes: updated });
  },

  marcarTodasLidas: () => {
    const updated = get().notificacoes.map(n => ({...n,lida:true}));
    storage.setNotificacoes(updated);
    set({ notificacoes: updated });
  },

  naoLidas: () => get().notificacoes.filter(n=>!n.lida).length,
}));
