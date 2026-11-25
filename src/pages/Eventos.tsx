import { useState } from 'react';
import { Plus, Calendar, Users, CheckSquare, Square, PartyPopper } from 'lucide-react';
import { useEventosStore } from '../store/eventosStore';
import { useClientesStore } from '../store/clientesStore';
import { useFinanceiroStore } from '../store/financeiroStore';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { StatusBadge, Tag } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { hoje } from '../utils/dateUtils';
import type { TipoEvento, StatusEvento } from '../types';

const TIPO_LABEL: Record<TipoEvento, string> = {
  casamento: 'Casamento',
  aniversario: 'Aniversário',
  corporativo: 'Corporativo',
  retiro: 'Retiro / Imersão',
  outro: 'Outro',
};

export default function Eventos() {
  const { eventos, addEvento, setStatus, toggleChecklist, addChecklistItem } = useEventosStore();
  const { clientes } = useClientesStore();
  const { addLancamento } = useFinanceiroStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [novoItemTexto, setNovoItemTexto] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    clienteId: '',
    tipo: 'casamento' as TipoEvento,
    nomeEvento: '',
    dataEvento: hoje(),
    horarioInicio: '15:00',
    horarioFim: '23:00',
    numConvidados: '80',
    valorContrato: '6500',
    valorEntrada: '2000',
    observacoes: '',
  });

  const handleSave = () => {
    if (!form.nomeEvento || !form.clienteId) return;
    addEvento({
      clienteId: form.clienteId,
      tipo: form.tipo,
      nomeEvento: form.nomeEvento,
      dataEvento: form.dataEvento,
      horarioInicio: form.horarioInicio,
      horarioFim: form.horarioFim,
      numConvidados: Number(form.numConvidados) || 0,
      valorContrato: Number(form.valorContrato) || 0,
      valorEntrada: Number(form.valorEntrada) || 0,
      status: 'orcamento',
      checklist: [
        { id: crypto.randomUUID(), descricao: 'Confirmar layout e espaço', concluido: false },
        { id: crypto.randomUUID(), descricao: 'Definir cardápio / buffet', concluido: false },
        { id: crypto.randomUUID(), descricao: 'Limpeza e preparação da área', concluido: false },
      ],
      observacoes: form.observacoes,
    });
    setModalOpen(false);
    setForm({
      clienteId: '', tipo: 'casamento', nomeEvento: '', dataEvento: hoje(),
      horarioInicio: '15:00', horarioFim: '23:00', numConvidados: '80',
      valorContrato: '6500', valorEntrada: '2000', observacoes: '',
    });
  };

  const handleAdvanceStatus = (evId: string, next: StatusEvento, valorContrato: number, nomeEvento: string) => {
    setStatus(evId, next);
    if (next === 'realizado') {
      addLancamento({
        tipo: 'receita',
        categoria: 'evento',
        descricao: `Evento realizado: ${nomeEvento}`,
        valor: valorContrato,
        data: hoje(),
        eventoId: evId,
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base sm:text-lg font-semibold text-mata-900">Agenda de Eventos & Casamentos</h2>
          <p className="text-xs text-cedro-500">Controle separado das reservas de ocas, com checklist de produção</p>
        </div>
        <Button size="sm" className="self-start sm:self-auto shrink-0 sm:px-4 sm:py-2 sm:text-sm" onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>Novo evento</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {eventos.map((ev) => {
          const cli = clientes.find((c) => c.id === ev.clienteId);
          const concluidos = ev.checklist.filter((c) => c.concluido).length;
          const pct = ev.checklist.length > 0 ? Math.round((concluidos / ev.checklist.length) * 100) : 0;

          return (
            <Card key={ev.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                    <Tag color="ambar">{TIPO_LABEL[ev.tipo]}</Tag>
                    <StatusBadge status={ev.status} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900 break-words">{ev.nomeEvento}</h3>
                  <p className="text-xs text-cedro-500 break-words">Responsável: {cli?.nome || '—'} · {cli?.telefone}</p>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="font-mono font-semibold text-mata-800 tabular-nums">{formatCurrency(ev.valorContrato)}</p>
                  {ev.valorEntrada ? <p className="text-[11px] text-cedro-400 tabular-nums">Sinal: {formatCurrency(ev.valorEntrada)}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-cedro-600 bg-linho-100 px-3 py-2 rounded-organic">
                <span className="flex items-center gap-1.5 tabular-nums"><Calendar size={13} className="shrink-0" /> {formatDate(ev.dataEvento)} ({ev.horarioInicio}–{ev.horarioFim})</span>
                <span className="flex items-center gap-1.5 tabular-nums"><Users size={13} className="shrink-0" /> {ev.numConvidados} convidados</span>
              </div>

              {ev.observacoes && <p className="text-xs text-cedro-600 italic break-words">"{ev.observacoes}"</p>}

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-mata-800">Checklist ({concluidos}/{ev.checklist.length})</span>
                  <span className="text-xs font-mono text-mata-600 tabular-nums">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-linho-200 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-mata-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>

                <div className="space-y-1.5">
                  {ev.checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(ev.id, item.id)}
                      className="flex items-start gap-2 w-full text-left text-xs py-1 hover:bg-linho-100 px-1.5 rounded transition-colors min-w-0"
                    >
                      {item.concluido ? (
                        <CheckSquare size={15} className="text-mata-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square size={15} className="text-cedro-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`break-words ${item.concluido ? 'line-through text-cedro-400' : 'text-mata-800'}`}>
                        {item.descricao}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    className="input-sm flex-1 min-w-0"
                    placeholder="Adicionar tarefa..."
                    value={novoItemTexto[ev.id] || ''}
                    onChange={(e) => setNovoItemTexto((s) => ({ ...s, [ev.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && novoItemTexto[ev.id]?.trim()) {
                        addChecklistItem(ev.id, novoItemTexto[ev.id].trim());
                        setNovoItemTexto((s) => ({ ...s, [ev.id]: '' }));
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => {
                      if (novoItemTexto[ev.id]?.trim()) {
                        addChecklistItem(ev.id, novoItemTexto[ev.id].trim());
                        setNovoItemTexto((s) => ({ ...s, [ev.id]: '' }));
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Ações de status */}
              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-linho-200">
                {ev.status === 'orcamento' && (
                  <Button size="sm" onClick={() => handleAdvanceStatus(ev.id, 'confirmado', ev.valorContrato, ev.nomeEvento)}>
                    Confirmar Evento
                  </Button>
                )}
                {ev.status === 'confirmado' && (
                  <Button size="sm" variant="secondary" onClick={() => handleAdvanceStatus(ev.id, 'realizado', ev.valorContrato, ev.nomeEvento)}>
                    Concluir & Lançar Receita
                  </Button>
                )}
                {ev.status === 'realizado' && (
                  <span className="text-xs text-mata-600 flex items-center gap-1"><PartyPopper size={14} /> Evento concluído</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Novo Evento */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo evento"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nomeEvento || !form.clienteId}>Criar evento</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Nome do evento *" value={form.nomeEvento} onChange={(e) => setForm((f) => ({ ...f, nomeEvento: e.target.value }))} placeholder="Ex: Casamento Maria & Pedro" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="label">Cliente *</label>
              <select className="input" value={form.clienteId} onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}>
                <option value="">Selecionar...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <Select
              label="Tipo"
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoEvento }))}
              options={Object.entries(TIPO_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Data" type="date" value={form.dataEvento} onChange={(e) => setForm((f) => ({ ...f, dataEvento: e.target.value }))} />
            <Input label="Início" type="time" value={form.horarioInicio} onChange={(e) => setForm((f) => ({ ...f, horarioInicio: e.target.value }))} />
            <Input label="Término" type="time" value={form.horarioFim} onChange={(e) => setForm((f) => ({ ...f, horarioFim: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Convidados" type="number" value={form.numConvidados} onChange={(e) => setForm((f) => ({ ...f, numConvidados: e.target.value }))} />
            <Input label="Valor contrato (R$)" type="number" value={form.valorContrato} onChange={(e) => setForm((f) => ({ ...f, valorContrato: e.target.value }))} />
            <Input label="Sinal / Entrada (R$)" type="number" value={form.valorEntrada} onChange={(e) => setForm((f) => ({ ...f, valorEntrada: e.target.value }))} />
          </div>
          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
