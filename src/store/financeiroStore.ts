import { create } from 'zustand';
import { storage } from '../utils/storage';
import { LANCAMENTOS_SEED } from '../data/seedData';
import type { LancamentoFinanceiro } from '../types';
import { inicioMes, fimMes } from '../utils/dateUtils';

function uid() { return crypto.randomUUID(); }

interface FinanceiroState {
  lancamentos: LancamentoFinanceiro[];
  init: () => void;
  addLancamento: (l: Omit<LancamentoFinanceiro,'id'|'criadoEm'>) => void;
  deleteLancamento: (id: string) => void;
  getDoMes: (ano: number, mes: number) => LancamentoFinanceiro[];
  getSaldo: (inicio?: string, fim?: string) => { receitas: number; despesas: number; lucro: number };
  getDadosGrafico: (meses?: number) => Array<{ mes: string; receitas: number; despesas: number; lucro: number }>;
}

export const useFinanceiroStore = create<FinanceiroState>((set, get) => ({
  lancamentos: [],

  init: () => {
    let data = storage.getFinanceiro();
    if (data.length===0) { data = LANCAMENTOS_SEED; storage.setFinanceiro(data); }
    set({ lancamentos: data });
  },

  addLancamento: (partial) => {
    const l: LancamentoFinanceiro = { ...partial, id: uid(), criadoEm: new Date().toISOString() };
    const updated = [...get().lancamentos, l];
    storage.setFinanceiro(updated);
    set({ lancamentos: updated });
  },

  deleteLancamento: (id) => {
    const updated = get().lancamentos.filter(l => l.id!==id);
    storage.setFinanceiro(updated);
    set({ lancamentos: updated });
  },

  getDoMes: (ano, mes) => {
    const prefix = `${ano}-${String(mes).padStart(2,'0')}`;
    return get().lancamentos.filter(l => l.data.startsWith(prefix));
  },

  getSaldo: (inicio, fim) => {
    const ini = inicio || inicioMes();
    const f = fim || fimMes();
    const filtered = get().lancamentos.filter(l => l.data >= ini && l.data <= f);
    const receitas = filtered.filter(l=>l.tipo==='receita').reduce((s,l)=>s+l.valor,0);
    const despesas = filtered.filter(l=>l.tipo==='despesa').reduce((s,l)=>s+l.valor,0);
    return { receitas, despesas, lucro: receitas - despesas };
  },

  getDadosGrafico: (meses=6) => {
    const result = [];
    const hoje = new Date();
    for (let i = meses-1; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth()-i, 1);
      const ano = d.getFullYear(); const mes = d.getMonth()+1;
      const { receitas, despesas, lucro } = get().getSaldo(
        `${ano}-${String(mes).padStart(2,'0')}-01`,
        new Date(ano, mes, 0).toISOString().split('T')[0]
      );
      const label = new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(d).replace('.','');
      result.push({ mes: label.charAt(0).toUpperCase()+label.slice(1), receitas, despesas, lucro });
    }
    return result;
  },
}));
