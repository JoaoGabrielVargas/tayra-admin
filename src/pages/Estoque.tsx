import { useState, useMemo } from 'react';
import { Plus, Search, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Package, History } from 'lucide-react';
import { useEstoqueStore } from '../store/estoqueStore';
import { useFinanceiroStore } from '../store/financeiroStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card, KpiCard } from '../components/ui/Card';
import { Tag } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { CategoriaEstoque, ItemEstoque } from '../types';

const CAT_LABEL: Record<CategoriaEstoque, string> = {
  alimento: 'Alimento',
  bebida: 'Bebida',
  higiene: 'Higiene',
  limpeza: 'Limpeza',
  manutencao: 'Manutenção',
  descartavel: 'Descartável',
  outro: 'Outro',
};

export default function Estoque() {
  const { items, movimentacoes, addItem, registrarEntrada, registrarSaida, getAbaixoMinimo } = useEstoqueStore();
  const { addLancamento } = useFinanceiroStore();
  const { addNotificacao } = useUIStore();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [tab, setTab] = useState<'produtos' | 'movimentacoes'>('produtos');

  const [novoModal, setNovoModal] = useState(false);
  const [movModal, setMovModal] = useState<{ item: ItemEstoque; tipo: 'entrada' | 'saida' } | null>(null);
  const [movQty, setMovQty] = useState('1');
  const [movMotivo, setMovMotivo] = useState('');
  const [lancarFinanceiro, setLancarFinanceiro] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    categoria: 'bebida' as CategoriaEstoque,
    quantidade: '10',
    unidade: 'un',
    quantidadeMinima: '5',
    precoCusto: '0',
    precoVenda: '0',
    fornecedor: '',
  });

  const abaixoMinimo = getAbaixoMinimo();

  const filtered = useMemo(() => {
    return items
      .filter((i) => {
        if (catFilter && i.categoria !== catFilter) return false;
        const q = search.toLowerCase();
        return !q || i.nome.toLowerCase().includes(q) || i.fornecedor?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const aLow = a.quantidade <= a.quantidadeMinima ? 0 : 1;
        const bLow = b.quantidade <= b.quantidadeMinima ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.nome.localeCompare(b.nome);
      });
  }, [items, search, catFilter]);

  const valorEmEstoque = useMemo(
    () => items.reduce((s, i) => s + i.quantidade * i.precoCusto, 0),
    [items]
  );

  const handleAddItem = () => {
    if (!form.nome) return;
    addItem({
      nome: form.nome,
      categoria: form.categoria,
      quantidade: Number(form.quantidade) || 0,
      unidade: form.unidade || 'un',
      quantidadeMinima: Number(form.quantidadeMinima) || 0,
      precoCusto: Number(form.precoCusto) || 0,
      precoVenda: Number(form.precoVenda) || 0,
      fornecedor: form.fornecedor || undefined,
    });
    setNovoModal(false);
    setForm({ nome: '', categoria: 'bebida', quantidade: '10', unidade: 'un', quantidadeMinima: '5', precoCusto: '0', precoVenda: '0', fornecedor: '' });
  };

  const handleMovimentacao = () => {
    if (!movModal) return;
    const qty = Math.max(1, Number(movQty) || 1);
    const { item, tipo } = movModal;
    const hojeStr = new Date().toISOString().split('T')[0];

    if (tipo === 'entrada') {
      const valor = qty * item.precoCusto;
      registrarEntrada(item.id, qty, movMotivo || 'compra', valor);
      if (lancarFinanceiro && valor > 0) {
        addLancamento({
          tipo: 'despesa',
          categoria: 'compras_estoque',
          descricao: `Compra estoque: ${qty}x ${item.nome}`,
          valor,
          data: hojeStr,
        });
      }
    } else {
      const valor = movMotivo === 'venda' ? qty * item.precoVenda : qty * item.precoCusto;
      registrarSaida(item.id, qty, movMotivo || 'uso', undefined, valor);
      if (lancarFinanceiro && movMotivo === 'venda' && valor > 0) {
        addLancamento({
          tipo: 'receita',
          categoria: 'comanda',
          descricao: `Venda avulsa: ${qty}x ${item.nome}`,
          valor,
          data: hojeStr,
        });
      }
      if (item.quantidade - qty <= item.quantidadeMinima) {
        addNotificacao({
          tipo: 'alerta',
          titulo: `Estoque baixo: ${item.nome}`,
          mensagem: `Restam apenas ${Math.max(0, item.quantidade - qty)} ${item.unidade}. Mínimo: ${item.quantidadeMinima}.`,
        });
      }
    }
    setMovModal(null);
    setMovQty('1');
    setMovMotivo('');
  };

  const getSemaforo = (i: ItemEstoque) => {
    if (i.quantidade <= i.quantidadeMinima) return { label: 'Crítico', color: 'barro' as const, dot: 'bg-barro-500' };
    if (i.quantidade <= i.quantidadeMinima * 1.5) return { label: 'Atenção', color: 'ambar' as const, dot: 'bg-ambar-500' };
    return { label: 'Normal', color: 'verde' as const, dot: 'bg-mata-500' };
  };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard titulo="Itens cadastrados" valor={String(items.length)} icon={<Package size={20} />} color="verde" />
        <KpiCard
          titulo="Abaixo do mínimo"
          valor={String(abaixoMinimo.length)}
          subtitulo={abaixoMinimo.length > 0 ? 'Reposição necessária' : 'Níveis saudáveis'}
          icon={<AlertTriangle size={20} />}
          color={abaixoMinimo.length > 0 ? 'barro' : 'verde'}
        />
        <KpiCard titulo="Capital em estoque" valor={formatCurrency(valorEmEstoque)} subtitulo="Preço de custo" icon={<ArrowUpCircle size={20} />} color="ambar" />
      </div>

      {/* Filtros e ações */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-white rounded-organic border border-linho-200">
          <button
            onClick={() => setTab('produtos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'produtos' ? 'bg-mata-700 text-white' : 'text-cedro-500 hover:text-mata-800'}`}
          >
            <Package size={14} /> Produtos
          </button>
          <button
            onClick={() => setTab('movimentacoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'movimentacoes' ? 'bg-mata-700 text-white' : 'text-cedro-500 hover:text-mata-800'}`}
          >
            <History size={14} /> Movimentações
          </button>
        </div>

        {tab === 'produtos' && (
          <>
            <Input
              placeholder="Buscar produto ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={14} />}
              className="max-w-xs"
            />
            <select className="input max-w-[170px] text-xs" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="">Todas categorias</option>
              {Object.entries(CAT_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </>
        )}

        <div className="ml-auto">
          <Button onClick={() => setNovoModal(true)} icon={<Plus size={16} />}>Novo produto</Button>
        </div>
      </div>

      {/* Tabela Produtos */}
      {tab === 'produtos' ? (
        <Card className="p-0 overflow-hidden">
          <div className="table-wrapper border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Saldo</th>
                  <th>Mínimo</th>
                  <th>Custo / Venda</th>
                  <th>Status</th>
                  <th>Movimentar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const sem = getSemaforo(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <p className="font-medium text-mata-900">{item.nome}</p>
                        {item.fornecedor && <p className="text-xs text-cedro-400">{item.fornecedor}</p>}
                      </td>
                      <td><Tag>{CAT_LABEL[item.categoria]}</Tag></td>
                      <td className="font-mono font-semibold text-mata-900">
                        {item.quantidade} <span className="text-xs text-cedro-400 font-normal">{item.unidade}</span>
                      </td>
                      <td className="font-mono text-xs text-cedro-500">{item.quantidadeMinima} {item.unidade}</td>
                      <td className="font-mono text-xs">
                        <span className="text-cedro-500">{formatCurrency(item.precoCusto)}</span>
                        {' / '}
                        <span className="text-mata-700 font-semibold">{formatCurrency(item.precoVenda)}</span>
                      </td>
                      <td>
                        <Tag color={sem.color}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sem.dot}`} />
                          {sem.label}
                        </Tag>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<ArrowUpCircle size={13} />}
                            onClick={() => { setMovModal({ item, tipo: 'entrada' }); setMovMotivo('compra'); }}
                          >
                            Entrada
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ArrowDownCircle size={13} />}
                            disabled={item.quantidade <= 0}
                            onClick={() => { setMovModal({ item, tipo: 'saida' }); setMovMotivo('venda'); }}
                          >
                            Saída
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="table-wrapper border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Qtd</th>
                  <th>Motivo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {[...movimentacoes].reverse().map((m) => {
                  const prod = items.find((i) => i.id === m.itemEstoqueId);
                  return (
                    <tr key={m.id}>
                      <td className="font-mono text-xs">{formatDate(m.data)}</td>
                      <td className="font-medium text-mata-900">{prod?.nome || 'Item removido'}</td>
                      <td>
                        <Tag color={m.tipo === 'entrada' ? 'verde' : 'barro'}>
                          {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </Tag>
                      </td>
                      <td className="font-mono font-semibold">{m.quantidade} {prod?.unidade}</td>
                      <td className="capitalize text-xs text-cedro-600">{m.motivo}</td>
                      <td className="font-mono text-xs">{m.valor ? formatCurrency(m.valor) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Novo Produto */}
      <Modal
        open={novoModal}
        onClose={() => setNovoModal(false)}
        title="Novo item de estoque"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNovoModal(false)}>Cancelar</Button>
            <Button onClick={handleAddItem} disabled={!form.nome}>Cadastrar</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Nome do produto *" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Ex: Água de Coco 330ml" />
          </div>
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as CategoriaEstoque }))}
            options={Object.entries(CAT_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <Input label="Unidade" value={form.unidade} onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))} placeholder="un, kg, L, pct..." />
          <Input label="Quantidade inicial" type="number" min="0" value={form.quantidade} onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))} />
          <Input label="Estoque mínimo (alerta)" type="number" min="0" value={form.quantidadeMinima} onChange={(e) => setForm((f) => ({ ...f, quantidadeMinima: e.target.value }))} />
          <Input label="Preço de custo (R$)" type="number" min="0" step="0.01" value={form.precoCusto} onChange={(e) => setForm((f) => ({ ...f, precoCusto: e.target.value }))} />
          <Input label="Preço de venda comanda (R$)" type="number" min="0" step="0.01" value={form.precoVenda} onChange={(e) => setForm((f) => ({ ...f, precoVenda: e.target.value }))} />
          <div className="col-span-2">
            <Input label="Fornecedor" value={form.fornecedor} onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))} placeholder="Opcional" />
          </div>
        </div>
      </Modal>

      {/* Modal Entrada / Saída */}
      <Modal
        open={!!movModal}
        onClose={() => setMovModal(null)}
        title={movModal ? `${movModal.tipo === 'entrada' ? 'Entrada' : 'Saída'} — ${movModal.item.nome}` : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMovModal(null)}>Cancelar</Button>
            <Button onClick={handleMovimentacao}>Confirmar</Button>
          </>
        }
      >
        {movModal && (
          <div className="space-y-4">
            <p className="text-xs text-cedro-500">
              Saldo atual: <strong className="text-mata-900">{movModal.item.quantidade} {movModal.item.unidade}</strong>
            </p>
            <Input
              label="Quantidade"
              type="number"
              min="1"
              max={movModal.tipo === 'saida' ? movModal.item.quantidade : undefined}
              value={movQty}
              onChange={(e) => setMovQty(e.target.value)}
            />
            <Select
              label="Motivo"
              value={movMotivo}
              onChange={(e) => setMovMotivo(e.target.value)}
              options={
                movModal.tipo === 'entrada'
                  ? [
                      { value: 'compra', label: 'Compra / Reposição' },
                      { value: 'ajuste', label: 'Ajuste de inventário' },
                    ]
                  : [
                      { value: 'venda', label: 'Venda avulsa (balcão)' },
                      { value: 'uso', label: 'Uso interno / Cozinha' },
                      { value: 'perda', label: 'Perda / Vencimento' },
                    ]
              }
            />
            <label className="flex items-center gap-2 text-xs text-mata-800 cursor-pointer">
              <input
                type="checkbox"
                checked={lancarFinanceiro}
                onChange={(e) => setLancarFinanceiro(e.target.checked)}
                className="rounded border-linho-300 text-mata-700 focus:ring-mata-500"
              />
              Lançar automaticamente no Financeiro
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
