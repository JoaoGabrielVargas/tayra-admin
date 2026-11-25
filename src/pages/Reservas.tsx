import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Calendar, List, Link2, Check } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer, type Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useReservasStore } from '../store/reservasStore';
import { useClientesStore } from '../store/clientesStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { StatusBadge, OcaBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Select, Textarea } from '../components/ui/Input';
import { formatCurrency, formatDate, labelEspaco, OCA_COLORS, calcNights } from '../utils/formatters';
import type { EspacoId, OrigemReserva } from '../types';
import { hoje } from '../utils/dateUtils';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 0 }),
  getDay, locales: { 'pt-BR': ptBR },
});

type View = 'lista' | 'calendario';

const OCA_PRECOS: Record<string|number, number> = {
  1:450,2:420,3:380,4:500,5:480,6:460,camping:60,evento:800
};

export default function Reservas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reservas, addReserva } = useReservasStore();
  const { clientes } = useClientesStore();
  const [view, setView] = useState<View>('lista');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOca, setFilterOca] = useState(searchParams.get('oca') || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    clienteId: '', espacoId: '1', dataEntrada: '', dataSaida: '',
    numHospedes: '2', observacoes: '', origem: 'manual' as OrigemReserva,
  });

  useEffect(() => {
    const ocaParam = searchParams.get('oca');
    if (ocaParam) setFilterOca(ocaParam);
  }, [searchParams]);

  const copiarLinkPublico = () => {
    const url = `${window.location.origin}/reservar`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filtered = useMemo(() => {
    return reservas
      .filter(r => {
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterOca && String(r.espacoId) !== filterOca) return false;
        const cli = clientes.find(c => c.id === r.clienteId);
        const q = search.toLowerCase();
        return !q || cli?.nome.toLowerCase().includes(q) || labelEspaco(r.espacoId).toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
  }, [reservas, clientes, search, filterStatus, filterOca]);

  // Eventos do calendário
  const calEvents: Event[] = reservas.map(r => {
    const cli = clientes.find(c => c.id === r.clienteId);
    const color = OCA_COLORS[r.espacoId] || '#4A7C5F';
    return {
      title: `${labelEspaco(r.espacoId)} — ${cli?.nome?.split(' ')[0] || '?'}`,
      start: new Date(r.dataEntrada + 'T14:00:00'),
      end: new Date(r.dataSaida + 'T12:00:00'),
      resource: { id: r.id, color, status: r.status },
    };
  });

  const handleSave = () => {
    if (!form.clienteId || !form.dataEntrada || !form.dataSaida) return;
    const noites = calcNights(form.dataEntrada, form.dataSaida);
    const espaco = isNaN(Number(form.espacoId)) ? form.espacoId as EspacoId : Number(form.espacoId) as EspacoId;
    const preco = OCA_PRECOS[form.espacoId] || 400;
    const valorHospedagem = espaco === 'camping'
      ? preco * parseInt(form.numHospedes)
      : preco * noites;
    addReserva({
      clienteId: form.clienteId, espacoId: espaco,
      dataEntrada: form.dataEntrada, dataSaida: form.dataSaida,
      status: 'pendente', numHospedes: parseInt(form.numHospedes),
      valorHospedagem, servicos: [], comanda: [], valorTotal: valorHospedagem,
      observacoes: form.observacoes, origem: form.origem,
    });
    setModalOpen(false);
    setForm({ clienteId:'', espacoId:'1', dataEntrada:'', dataSaida:'', numHospedes:'2', observacoes:'', origem:'manual' });
  };

  const ESPACO_OPTIONS = [
    {value:'1',label:'Oca 1'},{value:'2',label:'Oca 2'},{value:'3',label:'Oca 3'},
    {value:'4',label:'Oca 4'},{value:'5',label:'Oca 5'},{value:'6',label:'Oca 6'},
    {value:'camping',label:'Camping'},{value:'evento',label:'Espaço Evento'},
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-white rounded-organic border border-linho-200">
          <button onClick={() => setView('lista')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view==='lista'?'bg-mata-700 text-white':'text-cedro-500 hover:text-mata-800'}`}>
            <List size={14}/> Lista
          </button>
          <button onClick={() => setView('calendario')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view==='calendario'?'bg-mata-700 text-white':'text-cedro-500 hover:text-mata-800'}`}>
            <Calendar size={14}/> Calendário
          </button>
        </div>
        <Input placeholder="Buscar cliente ou espaço..." value={search} onChange={e=>setSearch(e.target.value)}
          prefix={<Search size={14}/>} className="max-w-xs" />
        <select className="input max-w-[160px] text-xs" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {['pendente','confirmada','checkin','checkout','paga','cancelada'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
        <select className="input max-w-[150px] text-xs" value={filterOca} onChange={e=>setFilterOca(e.target.value)}>
          <option value="">Todos espaços</option>
          {['1','2','3','4','5','6','camping','evento'].map(o => (
            <option key={o} value={o}>{o === 'camping' ? 'Camping' : o === 'evento' ? 'Evento' : `Oca ${o}`}</option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="md" onClick={copiarLinkPublico} icon={copiedLink ? <Check size={15}/> : <Link2 size={15}/>}>
            {copiedLink ? 'Link copiado!' : 'Link público'}
          </Button>
          <Button onClick={() => setModalOpen(true)} icon={<Plus size={16}/>}>Nova reserva</Button>
        </div>
      </div>

      {/* Calendário */}
      {view === 'calendario' && (
        <Card className="p-0 overflow-hidden">
          <BigCalendar
            localizer={localizer}
            events={calEvents}
            defaultView="month"
            views={['month','week','day']}
            culture="pt-BR"
            style={{ height: 580, padding: '16px' }}
            eventPropGetter={(event: Event) => ({
              style: { backgroundColor: (event as any).resource?.color || '#4A7C5F', border: 'none', borderRadius: '6px', fontSize: '11px' }
            })}
            onSelectEvent={(e: Event) => navigate(`/reservas/${(e as any).resource?.id}`)}
            messages={{ month:'Mês', week:'Semana', day:'Dia', today:'Hoje', previous:'<', next:'>', noEventsInRange:'Sem reservas neste período' }}
          />
        </Card>
      )}

      {/* Lista */}
      {view === 'lista' && (
        <Card className="p-0 overflow-hidden">
          <div className="table-wrapper border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Espaço</th><th>Cliente</th><th>Entrada</th><th>Saída</th>
                  <th>Hóspedes</th><th>Valor</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-cedro-400 text-sm">Nenhuma reserva encontrada</td></tr>
                )}
                {filtered.map(r => {
                  const cli = clientes.find(c => c.id === r.clienteId);
                  return (
                    <tr key={r.id}>
                      <td><OcaBadge ocaId={r.espacoId} /></td>
                      <td>
                        <div>
                          <p className="font-medium text-mata-900">{cli?.nome || '—'}</p>
                          <p className="text-xs text-cedro-400">{cli?.telefone}</p>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{formatDate(r.dataEntrada)}</td>
                      <td className="font-mono text-xs">{formatDate(r.dataSaida)}</td>
                      <td className="text-center">{r.numHospedes}</td>
                      <td className="font-mono font-semibold text-mata-800">{formatCurrency(r.valorTotal)}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/reservas/${r.id}`)}>
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal nova reserva */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova reserva"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.clienteId||!form.dataEntrada||!form.dataSaida}>Criar reserva</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Cliente</label>
            <select className="input" value={form.clienteId} onChange={e=>setForm(f=>({...f,clienteId:e.target.value}))}>
              <option value="">Selecionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} · {c.telefone}</option>)}
            </select>
          </div>
          <Select label="Espaço" value={form.espacoId} onChange={e=>setForm(f=>({...f,espacoId:e.target.value}))} options={ESPACO_OPTIONS} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Check-in" type="date" value={form.dataEntrada} min={hoje()}
              onChange={e=>setForm(f=>({...f,dataEntrada:e.target.value}))} />
            <Input label="Check-out" type="date" value={form.dataSaida} min={form.dataEntrada||hoje()}
              onChange={e=>setForm(f=>({...f,dataSaida:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nº hóspedes" type="number" min="1" value={form.numHospedes}
              onChange={e=>setForm(f=>({...f,numHospedes:e.target.value}))} />
            <Select label="Origem" value={form.origem} onChange={e=>setForm(f=>({...f,origem:e.target.value as OrigemReserva}))}
              options={[{value:'manual',label:'Manual'},{value:'link_publico',label:'Link público'},{value:'whatsapp',label:'WhatsApp'},{value:'indicacao',label:'Indicação'}]} />
          </div>
          {form.dataEntrada && form.dataSaida && form.dataEntrada < form.dataSaida && (
            <div className="bg-mata-50 rounded-organic p-3">
              <p className="text-xs text-mata-700">
                <strong>{calcNights(form.dataEntrada,form.dataSaida)} noite(s)</strong> ·{' '}
                Valor estimado: <strong>{formatCurrency(OCA_PRECOS[form.espacoId]*(form.espacoId==='camping'?parseInt(form.numHospedes):calcNights(form.dataEntrada,form.dataSaida)))}</strong>
              </p>
            </div>
          )}
          <Textarea label="Observações" value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))} placeholder="Pedidos especiais, alérgias, etc..." />
        </div>
      </Modal>
    </div>
  );
}
