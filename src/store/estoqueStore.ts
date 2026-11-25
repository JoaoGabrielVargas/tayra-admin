import { create } from 'zustand';
import { storage } from '../utils/storage';
import { ESTOQUE_SEED, MOVIMENTACOES_SEED } from '../data/seedData';
import type { ItemEstoque, MovimentacaoEstoque } from '../types';

function uid() { return crypto.randomUUID(); }
const now = () => new Date().toISOString();
const todayStr = () => now().split('T')[0];

interface EstoqueState {
  items: ItemEstoque[];
  movimentacoes: MovimentacaoEstoque[];
  init: () => void;
  addItem: (i: Omit<ItemEstoque,'id'|'criadoEm'|'atualizadoEm'>) => ItemEstoque;
  updateItem: (id: string, partial: Partial<ItemEstoque>) => void;
  deleteItem: (id: string) => void;
  registrarEntrada: (itemId: string, qty: number, motivo: string, valor?: number) => void;
  registrarSaida: (itemId: string, qty: number, motivo: string, reservaId?: string, valor?: number) => void;
  getAbaixoMinimo: () => ItemEstoque[];
  getById: (id: string) => ItemEstoque | undefined;
}

export const useEstoqueStore = create<EstoqueState>((set, get) => ({
  items: [],
  movimentacoes: [],

  init: () => {
    let items = storage.getEstoque();
    let movs = storage.getMovimentacoes();
    if (items.length===0) { items = ESTOQUE_SEED; storage.setEstoque(items); }
    if (movs.length===0) { movs = MOVIMENTACOES_SEED; storage.setMovimentacoes(movs); }
    set({ items, movimentacoes: movs });
  },

  addItem: (partial) => {
    const item: ItemEstoque = { ...partial, id: uid(), criadoEm: now(), atualizadoEm: now() };
    const updated = [...get().items, item];
    storage.setEstoque(updated);
    set({ items: updated });
    return item;
  },

  updateItem: (id, partial) => {
    const updated = get().items.map(i => i.id===id ? {...i,...partial,atualizadoEm:now()} : i);
    storage.setEstoque(updated);
    set({ items: updated });
  },

  deleteItem: (id) => {
    const updated = get().items.filter(i => i.id!==id);
    storage.setEstoque(updated);
    set({ items: updated });
  },

  registrarEntrada: (itemId, qty, motivo, valor) => {
    const mov: MovimentacaoEstoque = { id:uid(), itemEstoqueId:itemId, tipo:'entrada', quantidade:qty, motivo, valor, data:todayStr() };
    get().updateItem(itemId, { quantidade: (get().items.find(i=>i.id===itemId)?.quantidade||0) + qty });
    const movs = [...get().movimentacoes, mov];
    storage.setMovimentacoes(movs);
    set({ movimentacoes: movs });
  },

  registrarSaida: (itemId, qty, motivo, reservaId, valor) => {
    const item = get().items.find(i=>i.id===itemId);
    if (!item || item.quantidade < qty) return;
    const mov: MovimentacaoEstoque = { id:uid(), itemEstoqueId:itemId, tipo:'saida', quantidade:qty, motivo, reservaId, valor, data:todayStr() };
    get().updateItem(itemId, { quantidade: item.quantidade - qty });
    const movs = [...get().movimentacoes, mov];
    storage.setMovimentacoes(movs);
    set({ movimentacoes: movs });
  },

  getAbaixoMinimo: () => get().items.filter(i => i.quantidade <= i.quantidadeMinima),
  getById: (id) => get().items.find(i => i.id===id),
}));
