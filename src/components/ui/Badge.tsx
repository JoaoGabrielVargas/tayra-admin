import { type ReactNode } from 'react';
import type { StatusReserva, StatusOca } from '../../types';
import { STATUS_LABEL } from '../../utils/formatters';

interface BadgeProps {
  status: StatusReserva | StatusOca | string;
  className?: string;
}

const STATUS_CLASS: Record<string, string> = {
  pendente: 'badge-pendente',
  confirmada: 'badge-confirmada',
  checkin: 'badge-checkin',
  checkout: 'badge-checkout',
  paga: 'badge-paga',
  cancelada: 'badge-cancelada',
  disponivel: 'badge-disponivel',
  ocupada: 'badge-ocupada',
  reservada: 'badge-reservada',
  manutencao: 'badge-manutencao',
  orcamento: 'bg-cedro-100 text-cedro-700 badge',
  confirmado: 'badge-confirmada',
  realizado: 'bg-ambar-100 text-ambar-800 badge',
};

const DOT_CLASS: Record<string, string> = {
  disponivel: 'dot-disponivel', ocupada: 'dot-ocupada',
  reservada: 'dot-reservada', manutencao: 'dot-manutencao',
};

export function StatusBadge({ status, className }: BadgeProps) {
  const cls = STATUS_CLASS[status] || 'badge bg-cedro-100 text-cedro-600';
  const dot = DOT_CLASS[status];
  return (
    <span className={`${cls} ${className||''}`}>
      {dot && <span className={dot} />}
      {STATUS_LABEL[status] || status}
    </span>
  );
}

interface TagProps {
  children: ReactNode;
  color?: 'verde'|'barro'|'ambar'|'cedro'|'neutra';
  className?: string;
}

const TAG_COLORS = {
  verde: 'bg-mata-100 text-mata-700',
  barro: 'bg-barro-100 text-barro-700',
  ambar: 'bg-ambar-100 text-ambar-800',
  cedro: 'bg-cedro-100 text-cedro-600',
  neutra: 'bg-linho-200 text-cedro-600',
};

export function Tag({ children, color='neutra', className }: TagProps) {
  return (
    <span className={`badge ${TAG_COLORS[color]} ${className||''}`}>{children}</span>
  );
}

interface OcaBadgeProps { ocaId: number|string; }
const OCA_BADGE_COLORS: Record<string|number, string> = {
  1:'bg-mata-900 text-white',2:'bg-mata-700 text-white',3:'bg-mata-500 text-white',
  4:'bg-barro-500 text-white',5:'bg-ambar-500 text-mata-900',6:'bg-cedro-500 text-white',
  camping:'bg-mata-400 text-white',evento:'bg-barro-700 text-white',
};
export function OcaBadge({ ocaId }: OcaBadgeProps) {
  const label = ocaId==='camping'?'Camping':ocaId==='evento'?'Evento':`Oca ${ocaId}`;
  return <span className={`badge ${OCA_BADGE_COLORS[ocaId]||'bg-cedro-100 text-cedro-700'}`}>{label}</span>;
}
