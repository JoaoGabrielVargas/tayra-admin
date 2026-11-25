import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Plus, Trash2, CheckCircle, LogIn, LogOut, DollarSign, XCircle } from 'lucide-react';
import { useReservasStore } from '../store/reservasStore';
import { useClientesStore } from '../store/clientesStore';
import { useEstoqueStore } from '../store/estoqueStore';
import { useFinanceiroStore } from '../store/financeiroStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Modal, Confirm } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatDate, formatDateTime, gerarLinkWhatsApp, labelEspaco } from '../utils/formatters';
import type { StatusReserva } from '../types';

const NEXT_STATUS: Partial<Record<StatusReserva, { label: string; next: StatusReserva; icon: React.ReactNode; variant: 'primary'|'secondary'|'danger' }>> = {
  pendente:   { label: 'Confirmar', next: 'confirmada', icon: <CheckCircle size={15}/>, variant: 'primary' },
  confirmada: { label: 'Fazer Check-in', next: 'checkin', icon: <LogIn size={15}/>, variant: 'primary' },
  checkin:    { label: 'Fazer Check-out', next: 'checkout', icon: <LogOut size={15}/>, variant: 'secondary' },
  checkout:   { label: 'Marcar como Paga', next: 'paga', icon: <DollarSign size={15}/>, variant: 'primary' },
};

export default function DetalheReserva() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reservas, setStatus, addComandaItem, removeComandaItem, addServico, removeServico } = useReservasStore();
  const { getById: getCli } = useClientesStore();
  const { items: estoque, registrarSaida } = useEstoqueStore();
  const { addLancamento } = useFinanceiroStore();
  const { addNotificacao } = useUIStore();
  const [comandaModal, setComandaModal] = useState(false);
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('1');
  const [servicoModal, setServicoModal] = useState(false);
  const [servicoNome, setServicoNome] = useState('');
  const [servicoValor, setServicoValor] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const reserva = reservas.find(r => r.id === id);
  if (!reserva) return <div className="p-6 text-cedro-500">Reserva não encontrada. <button className="text-mata-600 underline" onClick={() => navigate('/reservas')}>Voltar</button></div>;

  const cliente = reserva.clienteId ? getCli(reserva.clienteId) : undefined;
  const nextAction = NEXT_STATUS[reserva.status];

  const handleNextStatus = () => {
    if (!nextAction) return;
    setStatus(id!, nextAction.next);
    if (nextAction.next === 'paga') {
      addLancamento({ tipo:'receita', categoria:'hospedagem', descricao:`Reserva ${labelEspaco(reserva.espacoId)} — ${cliente?.nome}`, valor: reserva.valorTotal, data: new Date().toISOString().split('T')[0], reservaId: id! });
      addNotificacao({ tipo:'sucesso', titulo:'Pagamento registrado', mensagem:`${cliente?.nome} pagou ${formatCurrency(reserva.valorTotal)}` });
    }
  };

  const handleAddComanda = () => {
    const item = estoque.find(i => i.id === itemId);
    if (!item) return;
    const q = parseInt(qty);
    addComandaItem(id!, { itemEstoqueId: item.id, nome: item.nome, quantidade: q, precoUnitario: item.precoVenda, total: q * item.precoVenda, adicionadoEm: new Date().toISOString().split('T')[0] });
    registrarSaida(item.id, q, 'venda', id!, q * item.precoCusto);
    setComandaModal(false); setItemId(''); setQty('1');
  };

  const handleAddServico = () => {
    if (!servicoNome || !servicoValor) return;
    addServico(id!, { id: crypto.randomUUID(), nome: servicoNome, valor: parseFloat(servicoValor) });
    setServicoModal(false); setServicoNome(''); setServicoValor('');
  };

  const whatsappMsg = `Olá ${cliente?.nome?.split(' ')[0]}, sua reserva no Tayra Ecoparque está confirmada! ✅\n📅 Check-in: ${formatDate(reserva.dataEntrada)}\n📅 Check-out: ${formatDate(reserva.dataSaida)}\n🏕️ ${labelEspaco(reserva.espacoId)}\nQualquer dúvida, estamos à disposição! 🌿`;

  return (
    <div className="max-w-4xl space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="shrink-0 -ml-2 sm:ml-0" onClick={() => navigate('/reservas')} icon={<ArrowLeft size={15}/>}>Voltar</Button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-mata-900 truncate">{labelEspaco(reserva.espacoId)}</h2>
              <StatusBadge status={reserva.status} />
            </div>
            <p className="text-xs text-cedro-400 truncate">Criada em {formatDateTime(reserva.criadaEm)} · {reserva.origem}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {cliente?.telefone && (
            <a href={gerarLinkWhatsApp(cliente.telefone, whatsappMsg)} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" icon={<MessageSquare size={15}/>}>WhatsApp</Button>
            </a>
          )}
          {nextAction && (
            <Button variant={nextAction.variant} size="sm" icon={nextAction.icon} onClick={handleNextStatus}>
              {nextAction.label}
            </Button>
          )}
          {reserva.status !== 'cancelada' && reserva.status !== 'paga' && (
            <Button variant="danger" size="sm" icon={<XCircle size={15}/>} onClick={() => setCancelConfirm(true)}>Cancelar</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Info principal */}
        <div className="md:col-span-2 space-y-4 min-w-0">
          <Card>
            <h3 className="font-display font-semibold text-mata-900 mb-3">Detalhes da Reserva</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0"><p className="label">Check-in</p><p className="text-sm font-semibold text-mata-800 tabular-nums">{formatDate(reserva.dataEntrada)}</p></div>
              <div className="min-w-0"><p className="label">Check-out</p><p className="text-sm font-semibold text-mata-800 tabular-nums">{formatDate(reserva.dataSaida)}</p></div>
              <div className="min-w-0"><p className="label">Hóspedes</p><p className="text-sm text-mata-800">{reserva.numHospedes} pessoa(s)</p></div>
              <div className="min-w-0"><p className="label">Origem</p><p className="text-sm text-mata-800 capitalize truncate">{reserva.origem.replace('_',' ')}</p></div>
              {reserva.observacoes && <div className="col-span-2 min-w-0"><p className="label">Observações</p><p className="text-sm text-mata-700 break-words">{reserva.observacoes}</p></div>}
            </div>
          </Card>

          {/* Comanda */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-semibold text-mata-900">Comanda</h3>
              {reserva.status === 'checkin' && (
                <Button variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={() => setComandaModal(true)}>Adicionar item</Button>
              )}
            </div>
            {reserva.comanda.length === 0 ? (
              <p className="text-xs text-cedro-400 py-2">Nenhum item na comanda.</p>
            ) : (
              <div className="space-y-1">
                {reserva.comanda.map(c => (
                  <div key={c.id} className="flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 py-1.5 border-b border-linho-100 last:border-0 min-w-0">
                    <span className="flex-1 min-w-0 text-sm text-mata-800 truncate">{c.nome}</span>
                    <span className="text-xs text-cedro-400 font-mono shrink-0 tabular-nums">{c.quantidade}× {formatCurrency(c.precoUnitario)}</span>
                    <span className="text-sm font-semibold font-mono text-mata-900 text-right shrink-0 tabular-nums">{formatCurrency(c.total)}</span>
                    {reserva.status === 'checkin' && (
                      <button onClick={() => removeComandaItem(id!, c.id)} className="text-cedro-300 hover:text-barro-500 transition-colors shrink-0"><Trash2 size={13}/></button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Serviços adicionais */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-semibold text-mata-900">Serviços Adicionais</h3>
              {['pendente','confirmada','checkin'].includes(reserva.status) && (
                <Button variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={() => setServicoModal(true)}>Adicionar</Button>
              )}
            </div>
            {reserva.servicos.length === 0 ? (
              <p className="text-xs text-cedro-400 py-2">Nenhum serviço adicional.</p>
            ) : (
              <div className="space-y-1">
                {reserva.servicos.map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-linho-100 last:border-0 min-w-0">
                    <span className="flex-1 min-w-0 text-sm text-mata-800 truncate">{s.nome}</span>
                    <span className="text-sm font-semibold font-mono text-mata-900 shrink-0 tabular-nums">{formatCurrency(s.valor)}</span>
                    {['pendente','confirmada','checkin'].includes(reserva.status) && (
                      <button onClick={() => removeServico(id!, s.id)} className="text-cedro-300 hover:text-barro-500 transition-colors shrink-0"><Trash2 size={13}/></button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Resumo financeiro */}
        <div className="space-y-4 min-w-0">
          <Card className="bg-mata-900 text-white border-0">
            <h3 className="font-display font-semibold text-white mb-4">Resumo</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between gap-3 text-sm min-w-0"><span className="text-mata-300 truncate">Hospedagem</span><span className="font-mono shrink-0 tabular-nums">{formatCurrency(reserva.valorHospedagem)}</span></div>
              {reserva.servicos.map(s => (
                <div key={s.id} className="flex justify-between gap-3 text-sm min-w-0"><span className="text-mata-300 truncate">{s.nome}</span><span className="font-mono shrink-0 tabular-nums">{formatCurrency(s.valor)}</span></div>
              ))}
              {reserva.comanda.map(c => (
                <div key={c.id} className="flex justify-between gap-3 text-sm min-w-0"><span className="text-mata-300 truncate">{c.nome} ×{c.quantidade}</span><span className="font-mono shrink-0 tabular-nums">{formatCurrency(c.total)}</span></div>
              ))}
              <div className="border-t border-mata-700 pt-2.5 flex justify-between items-baseline gap-3 font-semibold">
                <span className="text-white">Total</span>
                <span className="font-mono text-ambar-400 text-base sm:text-lg shrink-0 tabular-nums">{formatCurrency(reserva.valorTotal)}</span>
              </div>
            </div>
            {reserva.pagoEm && <p className="text-xs text-mata-400 mt-3">Pago em {formatDate(reserva.pagoEm)}</p>}
          </Card>

          {/* Cliente */}
          {cliente && (
            <Card>
              <h3 className="font-display font-semibold text-mata-900 mb-3">Cliente</h3>
              <div className="space-y-2 min-w-0">
                <p className="text-sm font-semibold text-mata-900 break-words">{cliente.nome}</p>
                <a href={`tel:${cliente.telefone}`} className="flex items-center gap-1.5 text-sm text-mata-600 hover:text-mata-800 break-all">
                  <Phone size={13} className="shrink-0"/>{cliente.telefone}
                </a>
                {cliente.email && <p className="text-xs text-cedro-500 break-all">{cliente.email}</p>}
                {cliente.cidade && <p className="text-xs text-cedro-400">{cliente.cidade}, {cliente.estado}</p>}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Comanda */}
      <Modal open={comandaModal} onClose={() => setComandaModal(false)} title="Adicionar à comanda" size="sm"
        footer={<><Button variant="ghost" onClick={() => setComandaModal(false)}>Cancelar</Button><Button onClick={handleAddComanda} disabled={!itemId}>Adicionar</Button></>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Produto</label>
            <select className="input" value={itemId} onChange={e=>setItemId(e.target.value)}>
              <option value="">Selecionar produto...</option>
              {estoque.filter(i => ['alimento','bebida','descartavel','outro'].includes(i.categoria) && i.quantidade > 0).map(i => (
                <option key={i.id} value={i.id}>{i.nome} — {formatCurrency(i.precoVenda)} (estoque: {i.quantidade} {i.unidade})</option>
              ))}
            </select>
          </div>
          <Input label="Quantidade" type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)}/>
          {itemId && (
            <div className="bg-ambar-50 rounded-organic p-3">
              <p className="text-xs text-ambar-700">Total: <strong>{formatCurrency((estoque.find(i=>i.id===itemId)?.precoVenda||0)*parseInt(qty))}</strong></p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Serviço */}
      <Modal open={servicoModal} onClose={() => setServicoModal(false)} title="Adicionar serviço" size="sm"
        footer={<><Button variant="ghost" onClick={() => setServicoModal(false)}>Cancelar</Button><Button onClick={handleAddServico} disabled={!servicoNome||!servicoValor}>Adicionar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nome do serviço" value={servicoNome} onChange={e=>setServicoNome(e.target.value)} placeholder="Ex: Café da manhã, Trilha guiada..." />
          <Input label="Valor (R$)" type="number" min="0" step="0.01" value={servicoValor} onChange={e=>setServicoValor(e.target.value)} />
        </div>
      </Modal>

      {/* Cancelar */}
      <Confirm open={cancelConfirm} onClose={() => setCancelConfirm(false)} onConfirm={() => setStatus(id!, 'cancelada')}
        title="Cancelar reserva" message="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
        confirmLabel="Cancelar reserva" danger />
    </div>
  );
}
