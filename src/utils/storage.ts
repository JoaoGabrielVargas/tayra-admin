import type { Reserva, Cliente, ItemEstoque, LancamentoFinanceiro, Evento, MovimentacaoEstoque, User, Notificacao } from '../types';

const PREFIX = 'tayra_';
type StorageKey = 'auth_user'|'reservas'|'clientes'|'estoque'|'movimentacoes'|'financeiro'|'eventos'|'notificacoes'|'usuarios';

function get<T>(key: StorageKey, fallback: T): T {
  try { const r = localStorage.getItem(PREFIX+key); return r ? JSON.parse(r) as T : fallback; }
  catch { return fallback; }
}
function set<T>(key: StorageKey, value: T): void {
  try { localStorage.setItem(PREFIX+key, JSON.stringify(value)); } catch(e) { console.error(e); }
}
function remove(key: StorageKey): void { localStorage.removeItem(PREFIX+key); }

export const storage = {
  getAuthUser: () => get<User|null>('auth_user', null),
  setAuthUser: (u: User|null) => u ? set('auth_user', u) : remove('auth_user'),
  getUsuarios: () => get<User[]>('usuarios', []),
  setUsuarios: (v: User[]) => set('usuarios', v),
  getReservas: () => get<Reserva[]>('reservas', []),
  setReservas: (v: Reserva[]) => set('reservas', v),
  getClientes: () => get<Cliente[]>('clientes', []),
  setClientes: (v: Cliente[]) => set('clientes', v),
  getEstoque: () => get<ItemEstoque[]>('estoque', []),
  setEstoque: (v: ItemEstoque[]) => set('estoque', v),
  getMovimentacoes: () => get<MovimentacaoEstoque[]>('movimentacoes', []),
  setMovimentacoes: (v: MovimentacaoEstoque[]) => set('movimentacoes', v),
  getFinanceiro: () => get<LancamentoFinanceiro[]>('financeiro', []),
  setFinanceiro: (v: LancamentoFinanceiro[]) => set('financeiro', v),
  getEventos: () => get<Evento[]>('eventos', []),
  setEventos: (v: Evento[]) => set('eventos', v),
  getNotificacoes: () => get<Notificacao[]>('notificacoes', []),
  setNotificacoes: (v: Notificacao[]) => set('notificacoes', v),
  clearAll: () => Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>localStorage.removeItem(k)),
};
