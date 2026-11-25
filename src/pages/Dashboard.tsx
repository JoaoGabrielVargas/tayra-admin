import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, TrendingUp, Package, ArrowRight, AlertTriangle, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { useReservasStore } from '../store/reservasStore';
import { useClientesStore } from '../store/clientesStore';
import { useFinanceiroStore } from '../store/financeiroStore';
import { useEstoqueStore } from '../store/estoqueStore';
import { KpiCard, Card } from '../components/ui/Card';
import { StatusBadge, OcaBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OcaMap } from '../components/shared/OcaMap';
import { formatCurrency, formatDate } from '../utils/formatters';
import { mesAnoLabel } from '../utils/dateUtils';
import type { StatusOca } from '../types';

const OCA_PRECOS: Record<number, number> = { 1: 450, 2: 420, 3: 380, 4: 500, 5: 480, 6: 460 };
const OCA_CAPS: Record<number, number>   = { 1: 4, 2: 3, 3: 6, 4: 2, 5: 4, 6: 3 };

export default function Dashboard() {
  const navigate = useNavigate();
  const { reservas } = useReservasStore();
  const { clientes } = useClientesStore();
  const { getSaldo } = useFinanceiroStore();
  const { getAbaixoMinimo } = useEstoqueStore();
  const [clima, setClima] = useState<{ temp: number; desc: string } | null>(null);

  const saldo = getSaldo();
  const abaixoMinimo = getAbaixoMinimo();
  const { checkins, checkouts } = useReservasStore.getState().getHoje();
  const ativas = reservas.filter(r => ['checkin','confirmada'].includes(r.status));
  const pendentes = reservas.filter(r => r.status === 'pendente');

  // Monta dados de status das ocas
  const ocasData = Array.from({ length: 6 }, (_, i) => {
    const id = i + 1 as 1|2|3|4|5|6;
    const reservaAtiva = ativas.find(r => r.espacoId === id);
    let status: StatusOca = 'disponivel';
    if (reservaAtiva?.status === 'checkin') status = 'ocupada';
    else if (reservaAtiva?.status === 'confirmada') status = 'reservada';
    const cliente = clientes.find(c => c.id === reservaAtiva?.clienteId);
    return {
      id, status, capacidade: OCA_CAPS[id], precoPorNoite: OCA_PRECOS[id],
      clienteNome: cliente?.nome, checkOut: reservaAtiva?.dataSaida,
    };
  });

  const ocupadas = ocasData.filter(o => o.status === 'ocupada').length;
  const taxaOcupacao = Math.round((ocupadas / 6) * 100);

  // Clima via open-meteo (Minas Gerais como padrão)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=-19.9&longitude=-44.0&current=temperature_2m,weathercode&timezone=America/Sao_Paulo')
      .then(r => r.json())
      .then(d => {
        const code = d.current?.weathercode;
        const desc = code <= 1 ? 'Ensolarado ☀️' : code <= 3 ? 'Nublado ⛅' : code <= 67 ? 'Chuva 🌧️' : 'Nublado ☁️';
        setClima({ temp: Math.round(d.current?.temperature_2m), desc });
      })
      .catch(() => {});
  }, []);

  // Feed de atividade (últimas reservas)
  const feed = [...reservas]
    .sort((a, b) => new Date(b.atualizadaEm).getTime() - new Date(a.atualizadaEm).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <KpiCard
          titulo="Ocupação hoje"
          valor={`${ocupadas}/6`}
          subtitulo={`${taxaOcupacao}% das ocas`}
          icon={<CalendarDays size={20} />}
          color="verde"
        />
        <KpiCard
          titulo="Receita do mês"
          valor={formatCurrency(saldo.receitas)}
          subtitulo={mesAnoLabel()}
          icon={<TrendingUp size={20} />}
          color="ambar"
        />
        <KpiCard
          titulo="Clientes cadastrados"
          valor={String(clientes.length)}
          icon={<Users size={20} />}
          color="cedro"
        />
        <KpiCard
          titulo="Alertas de estoque"
          valor={String(abaixoMinimo.length)}
          subtitulo={abaixoMinimo.length > 0 ? 'itens abaixo do mínimo' : 'tudo ok'}
          icon={<Package size={20} />}
          color={abaixoMinimo.length > 0 ? 'barro' : 'verde'}
        />
      </div>

      {/* Alertas do dia */}
      {(checkins.length > 0 || checkouts.length > 0 || pendentes.length > 0) && (
        <Card className="border-l-4 border-l-ambar-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertTriangle size={18} className="text-ambar-600 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-x-5 gap-y-2 flex-1 min-w-0">
                {checkins.length > 0 && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-mata-800">Check-ins hoje</p>
                    <p className="text-sm text-mata-700">{checkins.length} reserva{checkins.length > 1 ? 's' : ''} prevista{checkins.length > 1 ? 's' : ''}</p>
                  </div>
                )}
                {checkouts.length > 0 && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-mata-800">Check-outs hoje</p>
                    <p className="text-sm text-mata-700">{checkouts.length} hóspede{checkouts.length > 1 ? 's' : ''} saindo</p>
                  </div>
                )}
                {pendentes.length > 0 && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-barro-700">Reservas pendentes</p>
                    <p className="text-sm text-barro-600">{pendentes.length} aguardando confirmação</p>
                  </div>
                )}
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full sm:w-auto shrink-0" onClick={() => navigate('/reservas')}>
              Ver reservas <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Mapa das Ocas */}
        <div className="xl:col-span-3 min-w-0">
          <Card>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="min-w-0">
                <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900 truncate">Mapa das Ocas</h3>
                <p className="text-xs text-cedro-500">Toque em uma oca para ver reservas</p>
              </div>
              {clima && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-cedro-400">{clima.desc}</p>
                  <p className="font-mono text-base sm:text-lg font-semibold text-mata-700 tabular-nums">{clima.temp}°C</p>
                </div>
              )}
            </div>
            <OcaMap
              ocas={ocasData}
              onOcaClick={(id) => navigate(`/reservas?oca=${id}`)}
            />
          </Card>
        </div>

        {/* Feed lateral */}
        <div className="xl:col-span-2 space-y-4 min-w-0">
          {/* Check-ins / Check-outs de hoje */}
          <Card>
            <h3 className="font-display text-base font-semibold text-mata-900 mb-3">Hoje</h3>
            {checkins.length === 0 && checkouts.length === 0 ? (
              <p className="text-xs text-cedro-400 py-2">Nenhum movimento previsto para hoje.</p>
            ) : (
              <div className="space-y-2">
                {checkins.map(r => {
                  const cli = clientes.find(c => c.id === r.clienteId);
                  return (
                    <div key={r.id} onClick={() => navigate(`/reservas/${r.id}`)}
                      className="flex items-center gap-2.5 p-2.5 rounded-organic bg-mata-50 cursor-pointer hover:bg-mata-100 transition-colors min-w-0">
                      <div className="w-7 h-7 bg-mata-700 rounded-full flex items-center justify-center shrink-0">
                        <LogIn size={13} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-mata-900 truncate">{cli?.nome || '—'}</p>
                        <div className="mt-0.5"><OcaBadge ocaId={r.espacoId} /></div>
                      </div>
                      <span className="text-[10px] text-mata-500 font-medium shrink-0">Entrada</span>
                    </div>
                  );
                })}
                {checkouts.map(r => {
                  const cli = clientes.find(c => c.id === r.clienteId);
                  return (
                    <div key={r.id} onClick={() => navigate(`/reservas/${r.id}`)}
                      className="flex items-center gap-2.5 p-2.5 rounded-organic bg-barro-50 cursor-pointer hover:bg-barro-100 transition-colors min-w-0">
                      <div className="w-7 h-7 bg-barro-500 rounded-full flex items-center justify-center shrink-0">
                        <LogOutIcon size={13} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-mata-900 truncate">{cli?.nome || '—'}</p>
                        <div className="mt-0.5"><OcaBadge ocaId={r.espacoId} /></div>
                      </div>
                      <span className="text-[10px] text-barro-500 font-medium shrink-0">Saída</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Estoque baixo */}
          {abaixoMinimo.length > 0 && (
            <Card>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-display text-base font-semibold text-mata-900 truncate">⚠️ Estoque baixo</h3>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate('/estoque')}>Ver tudo</Button>
              </div>
              <div className="space-y-1.5">
                {abaixoMinimo.slice(0,4).map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs text-mata-800 truncate min-w-0 flex-1">{item.nome}</span>
                    <span className="text-xs font-mono text-barro-600 font-semibold shrink-0 whitespace-nowrap tabular-nums">
                      {item.quantidade} {item.unidade}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Atividade recente */}
          <Card>
            <h3 className="font-display text-base font-semibold text-mata-900 mb-3">Atividade recente</h3>
            <div className="space-y-2">
              {feed.map(r => {
                const cli = clientes.find(c => c.id === r.clienteId);
                return (
                  <div key={r.id} onClick={() => navigate(`/reservas/${r.id}`)}
                    className="flex items-center gap-2 sm:gap-2.5 py-1.5 cursor-pointer group min-w-0">
                    <OcaBadge ocaId={r.espacoId} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-mata-800 truncate group-hover:text-mata-600 transition-colors">{cli?.nome || '—'}</p>
                      <p className="text-[10px] text-cedro-400 truncate tabular-nums">{formatDate(r.dataEntrada)} → {formatDate(r.dataSaida)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
