import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className='', flat, onClick, hover }: CardProps) {
  const base = flat ? 'card-flat' : 'card';
  const hoverCls = hover || onClick ? 'cursor-pointer hover:shadow-organic-md hover:-translate-y-0.5 transition-all duration-200' : '';
  return (
    <div className={`${base} ${hoverCls} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

interface KpiCardProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  variacao?: number;
  icon: ReactNode;
  color?: 'verde'|'barro'|'ambar'|'cedro';
}

const ICON_BG: Record<string, string> = {
  verde: 'bg-mata-100 text-mata-700',
  barro: 'bg-barro-100 text-barro-600',
  ambar: 'bg-ambar-100 text-ambar-700',
  cedro: 'bg-cedro-100 text-cedro-600',
};

export function KpiCard({ titulo, valor, subtitulo, variacao, icon, color='verde' }: KpiCardProps) {
  const isPositive = variacao !== undefined && variacao >= 0;
  return (
    <Card className="flex gap-4 items-start">
      <div className={`p-3 rounded-organic ${ICON_BG[color]} shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-cedro-500 uppercase tracking-wide mb-0.5">{titulo}</p>
        <p className="font-display text-2xl font-semibold text-mata-900 leading-none">{valor}</p>
        {(subtitulo || variacao !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {subtitulo && <span className="text-xs text-cedro-500">{subtitulo}</span>}
            {variacao !== undefined && (
              <span className={`text-xs font-medium ${isPositive ? 'text-mata-600' : 'text-barro-600'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(variacao).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
