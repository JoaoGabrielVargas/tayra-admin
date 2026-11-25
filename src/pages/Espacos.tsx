import { useState } from 'react';
import { Tent, Users, Sparkles, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReservasStore } from '../store/reservasStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, Tag } from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';
import type { StatusOca } from '../types';

const ESPACOS_INFO = [
  { id: 1, nome: 'Oca 1', tipo: 'Oca', capacidade: 4, preco: 450, comodidades: ['Cama Queen', 'Rede na varanda', 'Ventilador', 'Banheiro privativo'] },
  { id: 2, nome: 'Oca 2', tipo: 'Oca', capacidade: 3, preco: 420, comodidades: ['Cama Casal + Solteiro', 'Vista mata', 'Frigobar'] },
  { id: 3, nome: 'Oca 3', tipo: 'Oca', capacidade: 6, preco: 380, comodidades: ['Família', '2 Beliches + Casal', 'Cozinha compacta'] },
  { id: 4, nome: 'Oca 4', tipo: 'Oca', capacidade: 2, preco: 500, comodidades: ['Suíte Casal', 'Banheira rústica', 'Lareira ecológica'] },
  { id: 5, nome: 'Oca 5', tipo: 'Oca', capacidade: 4, preco: 480, comodidades: ['Vista riacho', 'Churrasqueira', 'Varanda ampla'] },
  { id: 6, nome: 'Oca 6', tipo: 'Oca', capacidade: 3, preco: 460, comodidades: ['Isolada na mata', 'Cama Queen', 'Ducha quente'] },
];

export default function Espacos() {
  const navigate = useNavigate();
  const { reservas } = useReservasStore();
  const [manutencaoIds, setManutencaoIds] = useState<number[]>([]);

  const toggleManutencao = (id: number) => {
    setManutencaoIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const getStatus = (id: number | 'camping' | 'evento'): StatusOca => {
    if (typeof id === 'number' && manutencaoIds.includes(id)) return 'manutencao';
    const ativa = reservas.find((r) => r.espacoId === id && ['checkin', 'confirmada'].includes(r.status));
    if (ativa?.status === 'checkin') return 'ocupada';
    if (ativa?.status === 'confirmada') return 'reservada';
    return 'disponivel';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-mata-900">Acomodações & Áreas do Sítio</h2>
        <p className="text-xs text-cedro-500">As 6 ocas numeradas, área de camping e salão/gramado para eventos</p>
      </div>

      {/* 6 Ocas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ESPACOS_INFO.map((oca) => {
          const status = getStatus(oca.id);
          return (
            <Card key={oca.id} className="flex flex-col justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900 truncate">{oca.nome}</h3>
                  <StatusBadge status={status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cedro-600 mb-3">
                  <span className="flex items-center gap-1"><Users size={13} /> Até {oca.capacidade} pessoas</span>
                  <span className="font-mono font-semibold text-mata-800 tabular-nums">{formatCurrency(oca.preco)}/noite</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {oca.comodidades.map((c) => (
                    <Tag key={c} color="neutra">{c}</Tag>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-linho-200">
                <Button variant="secondary" size="sm" className="flex-1 min-w-[110px]" icon={<CalendarDays size={14} />} onClick={() => navigate('/reservas')}>
                  Reservas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleManutencao(oca.id)}>
                  {manutencaoIds.includes(oca.id) ? 'Liberar' : 'Manutenção'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Camping e Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex flex-col justify-between gap-4 bg-mata-50/60">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Tent size={20} className="text-mata-700 shrink-0" />
                <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900 truncate">Área de Camping</h3>
              </div>
              <StatusBadge status={getStatus('camping')} />
            </div>
            <p className="text-xs text-cedro-600 mb-3">
              Gramado plano próximo às trilhas e banheiros coletivos com água quente. Capacidade para até 30 barracas.
            </p>
            <p className="font-mono text-sm font-semibold text-mata-800 tabular-nums">{formatCurrency(60)} / pessoa / diária</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/reservas')}>Ver reservas de camping</Button>
        </Card>

        <Card className="flex flex-col justify-between gap-4 bg-ambar-50/40">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles size={20} className="text-barro-600 shrink-0" />
                <h3 className="font-display text-base sm:text-lg font-semibold text-mata-900 leading-snug">Espaço Eventos & Trilhas</h3>
              </div>
              <StatusBadge status={getStatus('evento')} />
            </div>
            <p className="text-xs text-cedro-600 mb-3">
              Salão rústico + gramado para casamentos, retiros, aniversários e ponto de partida das trilhas ecológicas.
            </p>
            <p className="font-mono text-sm font-semibold text-mata-800 tabular-nums">A partir de {formatCurrency(800)} / diária</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/eventos')}>Gerenciar eventos</Button>
        </Card>
      </div>
    </div>
  );
}
