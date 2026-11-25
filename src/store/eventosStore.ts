import { create } from 'zustand';
import { storage } from '../utils/storage';
import { EVENTOS_SEED } from '../data/seedData';
import type { Evento, ChecklistItemEvento, StatusEvento } from '../types';

function uid() { return crypto.randomUUID(); }

interface EventosState {
  eventos: Evento[];
  init: () => void;
  addEvento: (e: Omit<Evento,'id'|'criadoEm'|'atualizadaEm'>) => Evento;
  updateEvento: (id: string, partial: Partial<Evento>) => void;
  deleteEvento: (id: string) => void;
  setStatus: (id: string, status: StatusEvento) => void;
  toggleChecklist: (eventoId: string, itemId: string) => void;
  addChecklistItem: (eventoId: string, descricao: string) => void;
}

export const useEventosStore = create<EventosState>((set, get) => ({
  eventos: [],

  init: () => {
    let data = storage.getEventos();
    if (data.length===0) { data = EVENTOS_SEED; storage.setEventos(data); }
    set({ eventos: data });
  },

  addEvento: (partial) => {
    const e: Evento = { ...partial, id: uid(), criadoEm: new Date().toISOString(), atualizadaEm: new Date().toISOString() };
    const updated = [...get().eventos, e];
    storage.setEventos(updated);
    set({ eventos: updated });
    return e;
  },

  updateEvento: (id, partial) => {
    const updated = get().eventos.map(e => e.id===id ? {...e,...partial,atualizadaEm:new Date().toISOString()} : e);
    storage.setEventos(updated);
    set({ eventos: updated });
  },

  deleteEvento: (id) => {
    const updated = get().eventos.filter(e => e.id!==id);
    storage.setEventos(updated);
    set({ eventos: updated });
  },

  setStatus: (id, status) => get().updateEvento(id, { status }),

  toggleChecklist: (eventoId, itemId) => {
    const ev = get().eventos.find(e=>e.id===eventoId);
    if (!ev) return;
    get().updateEvento(eventoId, {
      checklist: ev.checklist.map(c => c.id===itemId ? {...c,concluido:!c.concluido} : c)
    });
  },

  addChecklistItem: (eventoId, descricao) => {
    const ev = get().eventos.find(e=>e.id===eventoId);
    if (!ev) return;
    const item: ChecklistItemEvento = { id: uid(), descricao, concluido: false };
    get().updateEvento(eventoId, { checklist: [...ev.checklist, item] });
  },
}));
