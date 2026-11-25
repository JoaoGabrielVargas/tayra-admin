import { create } from 'zustand';
import { storage } from '../utils/storage';
import { CLIENTES_SEED } from '../data/seedData';
import type { Cliente } from '../types';

function uid() { return crypto.randomUUID(); }

interface ClientesState {
  clientes: Cliente[];
  init: () => void;
  addCliente: (c: Omit<Cliente,'id'|'criadoEm'>) => Cliente;
  updateCliente: (id: string, partial: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  buscar: (q: string) => Cliente[];
  getById: (id: string) => Cliente | undefined;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],

  init: () => {
    let data = storage.getClientes();
    if (data.length === 0) { data = CLIENTES_SEED; storage.setClientes(data); }
    set({ clientes: data });
  },

  addCliente: (partial) => {
    const c: Cliente = { ...partial, id: uid(), criadoEm: new Date().toISOString() };
    const updated = [...get().clientes, c];
    storage.setClientes(updated);
    set({ clientes: updated });
    return c;
  },

  updateCliente: (id, partial) => {
    const updated = get().clientes.map(c => c.id===id ? {...c,...partial} : c);
    storage.setClientes(updated);
    set({ clientes: updated });
  },

  deleteCliente: (id) => {
    const updated = get().clientes.filter(c => c.id!==id);
    storage.setClientes(updated);
    set({ clientes: updated });
  },

  buscar: (q) => {
    const lq = q.toLowerCase();
    return get().clientes.filter(c =>
      c.nome.toLowerCase().includes(lq) ||
      c.telefone.includes(q) ||
      c.email?.toLowerCase().includes(lq) ||
      c.cpf?.includes(q)
    );
  },

  getById: (id) => get().clientes.find(c => c.id===id),
}));
