import { useState } from 'react';
import { Plus, Search, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { useClientesStore } from '../store/clientesStore';
import { useReservasStore } from '../store/reservasStore';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal, Confirm } from '../components/ui/Modal';
import { StatusBadge, OcaBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate, initials } from '../utils/formatters';
import type { Cliente } from '../types';

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente, buscar } = useClientesStore();
  const { reservas } = useReservasStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ nome:'', telefone:'', email:'', cpf:'', cidade:'', estado:'', observacoes:'' });

  const lista = search ? buscar(search) : [...clientes].sort((a,b) => a.nome.localeCompare(b.nome));

  const clienteReservas = selected ? reservas.filter(r => r.clienteId === selected.id) : [];
  const totalGasto = clienteReservas.filter(r=>r.status==='paga').reduce((s,r)=>s+r.valorTotal,0);

  const openCreate = () => { setForm({nome:'',telefone:'',email:'',cpf:'',cidade:'',estado:'',observacoes:''}); setEditMode(false); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setForm({nome:c.nome,telefone:c.telefone,email:c.email||'',cpf:c.cpf||'',cidade:c.cidade||'',estado:c.estado||'',observacoes:c.observacoes||''}); setEditMode(true); setModalOpen(true); };
  const handleSave = () => {
    if (editMode && selected) updateCliente(selected.id, form);
    else addCliente(form);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:h-[calc(100vh-7rem)] min-w-0">
      {/* Lista */}
      <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0 max-h-64 sm:max-h-80 lg:max-h-none min-w-0">
        <div className="flex gap-2">
          <Input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} prefix={<Search size={14}/>} containerClassName="flex-1" />
          <Button size="sm" className="shrink-0" icon={<Plus size={16}/>} onClick={openCreate}>Novo</Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {lista.map(c => {
            const count = reservas.filter(r=>r.clienteId===c.id).length;
            return (
              <div key={c.id} onClick={() => setSelected(c)}
                className={`flex items-center gap-3 p-3 rounded-organic-lg cursor-pointer transition-all border min-w-0 ${selected?.id===c.id?'bg-mata-900 text-white border-mata-900':'bg-white border-linho-200 hover:border-mata-300 hover:shadow-organic-sm'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${selected?.id===c.id?'bg-ambar-500 text-mata-900':'bg-mata-100 text-mata-700'}`}>
                  {initials(c.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${selected?.id===c.id?'text-white':'text-mata-900'}`}>{c.nome}</p>
                  <p className={`text-xs truncate ${selected?.id===c.id?'text-mata-300':'text-cedro-500'}`}>{c.telefone}</p>
                </div>
                <span className={`text-xs font-mono shrink-0 tabular-nums ${selected?.id===c.id?'text-mata-300':'text-cedro-400'}`}>{count}×</span>
              </div>
            );
          })}
          {lista.length === 0 && <div className="text-center py-8 text-cedro-400 text-sm">Nenhum cliente encontrado</div>}
        </div>
      </div>

      {/* Detalhe */}
      <div className="flex-1 min-w-0 lg:overflow-y-auto">
        {!selected ? (
          <div className="h-full min-h-[180px] flex items-center justify-center">
            <div className="text-center text-cedro-400">
              <p className="text-4xl mb-2">👤</p>
              <p className="text-sm">Selecione um cliente para ver detalhes</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header cliente */}
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-mata-700 rounded-organic-lg flex items-center justify-center text-lg sm:text-2xl font-bold text-white shrink-0">
                    {initials(selected.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg sm:text-xl font-semibold text-mata-900 break-words">{selected.nome}</h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      <a href={`tel:${selected.telefone}`} className="flex items-center gap-1 text-xs sm:text-sm text-mata-600 hover:text-mata-900 break-all"><Phone size={13} className="shrink-0"/>{selected.telefone}</a>
                      {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-1 text-xs sm:text-sm text-mata-600 hover:text-mata-900 break-all"><Mail size={13} className="shrink-0"/>{selected.email}</a>}
                    </div>
                    {(selected.cidade || selected.cpf) && (
                      <p className="text-xs text-cedro-400 mt-1 break-words">
                        {[selected.cpf, selected.cidade && `${selected.cidade}/${selected.estado}`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" icon={<Edit2 size={14}/>} onClick={() => openEdit(selected)}>Editar</Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={() => setDeleteConfirm(selected.id)}/>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4 border-t border-linho-200">
                <div className="min-w-0">
                  <p className="label truncate">Total de visitas</p>
                  <p className="text-xl sm:text-2xl font-display font-semibold text-mata-900 tabular-nums">{clienteReservas.length}</p>
                </div>
                <div className="min-w-0">
                  <p className="label truncate">Desde</p>
                  <p className="text-sm font-semibold text-mata-900 tabular-nums mt-1">{formatDate(selected.criadoEm)}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 min-w-0">
                  <p className="label truncate">Total gasto</p>
                  <p className="text-xl sm:text-2xl font-display font-semibold text-ambar-600 break-words tabular-nums">{formatCurrency(totalGasto)}</p>
                </div>
              </div>
            </Card>

            {/* Histórico de reservas */}
            <Card>
              <h3 className="font-display font-semibold text-mata-900 mb-3">Histórico de Reservas</h3>
              {clienteReservas.length === 0 ? (
                <p className="text-sm text-cedro-400 py-2">Nenhuma reserva registrada.</p>
              ) : (
                <div className="space-y-2">
                  {clienteReservas.sort((a,b)=>b.criadaEm.localeCompare(a.criadaEm)).map(r => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-organic bg-linho-100 hover:bg-linho-200 transition-colors min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <OcaBadge ocaId={r.espacoId} />
                        <span className="text-xs text-cedro-500 font-mono tabular-nums">{formatDate(r.dataEntrada)} → {formatDate(r.dataSaida)}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        <span className="text-sm font-mono font-semibold text-mata-800 tabular-nums">{formatCurrency(r.valorTotal)}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? 'Editar cliente' : 'Novo cliente'}
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={handleSave} disabled={!form.nome||!form.telefone}>{editMode?'Salvar':'Criar cliente'}</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Input label="Nome completo *" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} /></div>
            <Input label="Telefone *" value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} placeholder="(11) 99999-9999" />
            <Input label="E-mail" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            <Input label="CPF" value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} placeholder="000.000.000-00" />
            <Input label="Cidade" value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))} />
            <div className="sm:col-span-2"><Textarea label="Observações" value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))} /></div>
          </div>
        </div>
      </Modal>

      <Confirm open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => { deleteCliente(deleteConfirm!); setSelected(null); }}
        title="Remover cliente" message="Tem certeza? O histórico de reservas não será apagado." confirmLabel="Remover" danger />
    </div>
  );
}
