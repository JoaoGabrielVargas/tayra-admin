import { create } from 'zustand';
import { storage } from '../utils/storage';
import { RESERVAS_SEED } from '../data/seedData';
import type { Reserva, ComandaItem, ServicoAdicional, StatusReserva } from '../types';
import { hoje } from '../utils/dateUtils';
import { calcNights } from '../utils/formatters';

function uid() { return crypto.randomUUID(); }

interface ReservasState {
  reservas: Reserva[];
  init: () => void;
  addReserva: (r: Omit<Reserva,'id'|'criadaEm'|'atualizadaEm'>) => Reserva;
  updateReserva: (id: string, partial: Partial<Reserva>) => void;
  deleteReserva: (id: string) => void;
  setStatus: (id: string, status: StatusReserva) => void;
  addComandaItem: (reservaId: string, item: Omit<ComandaItem,'id'>) => void;
  removeComandaItem: (reservaId: string, itemId: string) => void;
  addServico: (reservaId: string, servico: ServicoAdicional) => void;
  removeServico: (reservaId: string, servicoId: string) => void;
  recalcTotal: (id: string) => void;
  getByEspaco: (espacoId: number|string) => Reserva[];
  getByCliente: (clienteId: string) => Reserva[];
  getHoje: () => { checkins: Reserva[]; checkouts: Reserva[] };
  getAtivas: () => Reserva[];
}

function calcTotal(r: Reserva): number {
  const servicos = r.servicos.reduce((s,x)=>s+x.valor,0);
  const comanda = r.comanda.reduce((s,x)=>s+x.total,0);
  return r.valorHospedagem + servicos + comanda;
}

export const useReservasStore = create<ReservasState>((set, get) => ({
  reservas: [],

  init: () => {
    let data = storage.getReservas();
    if (data.length === 0) { data = RESERVAS_SEED; storage.setReservas(data); }
    set({ reservas: data });
  },

  addReserva: (partial) => {
    const noite = calcNights(partial.dataEntrada, partial.dataSaida);
    const valorHospedagem = partial.valorHospedagem || (noite * 0); // caller sets price
    const r: Reserva = {
      ...partial,
      id: uid(),
      valorHospedagem,
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
    };
    r.valorTotal = calcTotal(r);
    const updated = [...get().reservas, r];
    storage.setReservas(updated);
    set({ reservas: updated });
    return r;
  },

  updateReserva: (id, partial) => {
    const updated = get().reservas.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, ...partial, atualizadaEm: new Date().toISOString() };
      next.valorTotal = calcTotal(next);
      return next;
    });
    storage.setReservas(updated);
    set({ reservas: updated });
  },

  deleteReserva: (id) => {
    const updated = get().reservas.filter(r => r.id !== id);
    storage.setReservas(updated);
    set({ reservas: updated });
  },

  setStatus: (id, status) => {
    const now = new Date().toISOString();
    const extra: Partial<Reserva> = { status };
    if (status === 'checkin') extra.checkInEm = now;
    if (status === 'checkout') extra.checkOutEm = now;
    if (status === 'paga') extra.pagoEm = now;
    get().updateReserva(id, extra);
  },

  addComandaItem: (reservaId, item) => {
    get().updateReserva(reservaId, {
      comanda: [...(get().reservas.find(r=>r.id===reservaId)?.comanda||[]),
        { ...item, id: uid() }]
    });
  },

  removeComandaItem: (reservaId, itemId) => {
    const r = get().reservas.find(x=>x.id===reservaId);
    if (!r) return;
    get().updateReserva(reservaId, { comanda: r.comanda.filter(c=>c.id!==itemId) });
  },

  addServico: (reservaId, servico) => {
    const r = get().reservas.find(x=>x.id===reservaId);
    if (!r) return;
    get().updateReserva(reservaId, { servicos: [...r.servicos, servico] });
  },

  removeServico: (reservaId, servicoId) => {
    const r = get().reservas.find(x=>x.id===reservaId);
    if (!r) return;
    get().updateReserva(reservaId, { servicos: r.servicos.filter(s=>s.id!==servicoId) });
  },

  recalcTotal: (id) => {
    const r = get().reservas.find(x=>x.id===id);
    if (r) get().updateReserva(id, { valorTotal: calcTotal(r) });
  },

  getByEspaco: (espacoId) => get().reservas.filter(r=>r.espacoId===espacoId),
  getByCliente: (clienteId) => get().reservas.filter(r=>r.clienteId===clienteId),
  getHoje: () => ({
    checkins: get().reservas.filter(r=>r.dataEntrada===hoje() && ['confirmada','pendente'].includes(r.status)),
    checkouts: get().reservas.filter(r=>r.dataSaida===hoje() && r.status==='checkin'),
  }),
  getAtivas: () => get().reservas.filter(r=>['checkin','confirmada','pendente'].includes(r.status)),
}));
