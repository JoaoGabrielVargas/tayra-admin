import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Download, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinanceiroStore } from '../store/financeiroStore';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card, KpiCard } from '../components/ui/Card';
import { Tag } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { hoje, mesAnoLabel } from '../utils/dateUtils';
import type { TipoLancamento, CategoriaReceita, CategoriaDespesa } from '../types';

const CAT_RECEITA: { value: CategoriaReceita; label: string }[] = [
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'comanda', label: 'Comanda / Bar' },
  { value: 'evento', label: 'Eventos & Casamentos' },
  { value: 'camping', label: 'Camping' },
  { value: 'servico_adicional', label: 'Trilhas & Serviços' },
  { value: 'outro', label: 'Outros' },
];

const CAT_DESPESA: { value: CategoriaDespesa; label: string }[] = [
  { value: 'compras_estoque', label: 'Compras / Estoque' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'folha_pagamento', label: 'Folha / Diárias' },
  { value: 'energia', label: 'Energia' },
  { value: 'agua', label: 'Água' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'outro', label: 'Outros' },
];

export default function Financeiro() {
  const { lancamentos, addLancamento, deleteLancamento, getSaldo, getDadosGrafico } = useFinanceiroStore();
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoLancamento>('todos');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    tipo: 'receita' as TipoLancamento,
    categoria: 'hospedagem',
    descricao: '',
    valor: '',
    data: hoje(),
  });

  const saldo = getSaldo();
  const chartData = getDadosGrafico(6);

  const lista = useMemo(() => {
    return [...lancamentos]
      .filter((l) => tipoFiltro === 'todos' || l.tipo === tipoFiltro)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [lancamentos, tipoFiltro]);

  const handleSave = () => {
    if (!form.descricao || !form.valor) return;
    addLancamento({
      tipo: form.tipo,
      categoria: form.categoria as CategoriaReceita | CategoriaDespesa,
      descricao: form.descricao,
      valor: Number(form.valor),
      data: form.data,
    });
    setModalOpen(false);
    setForm({ tipo: 'receita', categoria: 'hospedagem', descricao: '', valor: '', data: hoje() });
  };

  const exportarCSV = () => {
    const header = 'Data;Tipo;Categoria;Descricao;Valor\n';
    const rows = lista
      .map((l) => `${l.data};${l.tipo};${l.categoria};"${l.descricao.replace(/"/g, '""')}";${l.valor.toFixed(2).replace('.', ',')}`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tayra-financeiro-${hoje()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPIs do mês */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <KpiCard titulo="Receitas do mês" valor={formatCurrency(saldo.receitas)} subtitulo={mesAnoLabel()} icon={<TrendingUp size={20} />} color="verde" />
        <KpiCard titulo="Gastos do mês" valor={formatCurrency(saldo.despesas)} subtitulo={mesAnoLabel()} icon={<TrendingDown size={20} />} color="barro" />
        <div className="col-span-2 sm:col-span-1">
          <KpiCard
            titulo="Lucro líquido"
            valor={formatCurrency(saldo.lucro)}
            subtitulo={saldo.lucro >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            icon={<DollarSign size={20} />}
            color={saldo.lucro >= 0 ? 'ambar' : 'barro'}
          />
        </div>
      </div>

      {/* Gráfico */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900">Receitas x Despesas (6 meses)</h3>
            <p className="text-xs text-cedro-500">Comparativo mensal do fluxo de caixa</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto shrink-0" icon={<Download size={14} />} onClick={exportarCSV}>
            Exportar CSV
          </Button>
        </div>
        <div className="h-56 sm:h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B5240' }} />
              <YAxis
                width={52}
                tick={{ fontSize: 10, fill: '#6B5240' }}
                tickFormatter={(v) => (v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`)}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{ borderRadius: 12, borderColor: '#EDE9E0', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="receitas" name="Receitas" fill="#4A7C5F" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesas" name="Gastos" fill="#C87D55" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Ações e Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex gap-1 p-1 bg-white rounded-organic border border-linho-200 shrink-0">
          {(['todos', 'receita', 'despesa'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tipoFiltro === t ? 'bg-mata-700 text-white' : 'text-cedro-500 hover:text-mata-800'}`}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Gastos'}
            </button>
          ))}
        </div>
        <Button size="sm" className="sm:px-4 sm:py-2 sm:text-sm" onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>Novo lançamento</Button>
      </div>

      {/* Lista de lançamentos Mobile-First */}
      <div className="md:hidden space-y-2.5">
        {lista.length === 0 ? (
          <Card className="text-center py-8 text-cedro-400 text-sm">Nenhum lançamento encontrado</Card>
        ) : (
          lista.map((l) => (
            <Card key={l.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <p className="font-medium text-sm text-mata-900 break-words flex-1 min-w-0">{l.descricao}</p>
                <span className={`font-mono text-sm font-semibold shrink-0 tabular-nums ${l.tipo === 'receita' ? 'text-mata-700' : 'text-barro-600'}`}>
                  {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-linho-100">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[11px] text-cedro-500 tabular-nums">{formatDate(l.data)}</span>
                  <Tag>{l.categoria.replace(/_/g, ' ')}</Tag>
                </div>
                <button onClick={() => deleteLancamento(l.id)} className="p-1 text-cedro-400 hover:text-barro-500 transition-colors shrink-0" title="Excluir">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden md:block p-0 overflow-hidden">
        <div className="table-wrapper border-0">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th className="text-right">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-cedro-400 text-sm">Nenhum lançamento encontrado</td></tr>
              )}
              {lista.map((l) => (
                <tr key={l.id}>
                  <td className="font-mono text-xs whitespace-nowrap">{formatDate(l.data)}</td>
                  <td className="font-medium text-mata-900">{l.descricao}</td>
                  <td><Tag>{l.categoria.replace(/_/g, ' ')}</Tag></td>
                  <td>
                    <Tag color={l.tipo === 'receita' ? 'verde' : 'barro'}>
                      {l.tipo === 'receita' ? 'Receita' : 'Gasto'}
                    </Tag>
                  </td>
                  <td className={`font-mono font-semibold text-right whitespace-nowrap tabular-nums ${l.tipo === 'receita' ? 'text-mata-700' : 'text-barro-600'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                  </td>
                  <td className="text-right">
                    <button onClick={() => deleteLancamento(l.id)} className="text-cedro-300 hover:text-barro-500 transition-colors" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Lançamento */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo lançamento financeiro"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.descricao || !form.valor}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['receita', 'despesa'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, tipo: t, categoria: t === 'receita' ? 'hospedagem' : 'compras_estoque' }))}
                className={`py-2 rounded-organic text-sm font-medium border transition-colors ${
                  form.tipo === t
                    ? t === 'receita'
                      ? 'bg-mata-700 text-white border-mata-700'
                      : 'bg-barro-600 text-white border-barro-600'
                    : 'bg-white text-cedro-600 border-linho-300'
                }`}
              >
                {t === 'receita' ? 'Receita (+)' : 'Gasto (-)'}
              </button>
            ))}
          </div>

          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
            options={form.tipo === 'receita' ? CAT_RECEITA : CAT_DESPESA}
          />
          <Input label="Descrição *" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Diária guia trilha" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Valor (R$) *" type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
