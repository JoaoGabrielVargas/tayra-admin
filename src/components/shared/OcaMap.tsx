import { useState } from 'react';
import type { StatusOca } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OcaInfo {
  id: number;
  status: StatusOca;
  capacidade: number;
  precoPorNoite: number;
  clienteNome?: string;
  checkOut?: string;
}

interface OcaMapProps {
  ocas: OcaInfo[];
  onOcaClick?: (id: number) => void;
  selected?: number | null;
}

const STATUS_FILL: Record<StatusOca, { fill: string; stroke: string; glow: string }> = {
  disponivel: { fill: '#4A7C5F', stroke: '#2D5240', glow: '#4A7C5F40' },
  ocupada:    { fill: '#C87D55', stroke: '#A05C3B', glow: '#C87D5540' },
  reservada:  { fill: '#E8A93A', stroke: '#D4960A', glow: '#E8A93A40' },
  manutencao: { fill: '#8A6B56', stroke: '#6B5240', glow: '#8A6B5640' },
};

// Posições fixas das 6 ocas no SVG (600x420)
const OCA_POSITIONS = [
  { id: 1, cx: 130, cy: 120 },
  { id: 2, cx: 300, cy: 90  },
  { id: 3, cx: 470, cy: 120 },
  { id: 4, cx: 130, cy: 290 },
  { id: 5, cx: 300, cy: 320 },
  { id: 6, cx: 470, cy: 290 },
];

// Árvores decorativas (cx, cy, r)
const TREES = [
  [55,55,22],[190,65,18],[380,55,20],[520,75,16],[75,200,19],[540,200,17],
  [200,200,15],[400,195,16],[55,360,20],[540,360,18],[185,370,14],[415,370,15],
];

export function OcaMap({ ocas, onOcaClick, selected }: OcaMapProps) {
  const [tooltip, setTooltip] = useState<{ id: number; x: number; y: number } | null>(null);

  const getOca = (id: number) => ocas.find(o => o.id === id);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 600 420"
        className="w-full rounded-organic-lg"
        style={{ background: 'linear-gradient(160deg, #EAF3EE 0%, #D1E5DA 60%, #C4AFA0 100%)' }}
      >
        {/* Grid de fundo orgânico */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#A8C9B540" strokeWidth="0.5"/>
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="600" height="420" fill="url(#grid)" />

        {/* Área central — Espaço Evento */}
        <rect x="230" y="175" width="140" height="90" rx="12" ry="12"
          fill="#8A6B56" fillOpacity="0.85" stroke="#6B5240" strokeWidth="1.5" />
        <text x="300" y="213" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="Inter">Espaço</text>
        <text x="300" y="227" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="Inter">Eventos</text>
        <text x="300" y="244" textAnchor="middle" fill="#E0C8B8" fontSize="8" fontFamily="Inter">até 200 pax</text>

        {/* Área Camping */}
        <rect x="22" y="345" width="80" height="55" rx="10" ry="10"
          fill="#5E9474" fillOpacity="0.85" stroke="#4A7C5F" strokeWidth="1.5" />
        <text x="62" y="368" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="Inter">Camping</text>
        <text x="62" y="382" textAnchor="middle" fill="#D1E5DA" fontSize="8" fontFamily="Inter">área livre</text>

        {/* Trilhas — caminhos curvos */}
        {OCA_POSITIONS.map(pos => (
          <line key={`trail-${pos.id}`} x1={pos.cx} y1={pos.cy} x2={300} y2={220}
            stroke="#8A6B5650" strokeWidth="2" strokeDasharray="6 4" />
        ))}
        {/* Camping trail */}
        <line x1="102" y1="373" x2="230" y2="220" stroke="#8A6B5540" strokeWidth="2" strokeDasharray="6 4" />

        {/* Árvores decorativas */}
        {TREES.map(([cx, cy, r], i) => (
          <g key={`tree-${i}`}>
            <circle cx={cx} cy={cy+5} r={r*0.4} fill="#8A6B5660" />
            <circle cx={cx} cy={cy} r={r} fill="#4A7C5F" fillOpacity="0.75" />
            <circle cx={cx-3} cy={cy-5} r={r*0.7} fill="#2D5240" fillOpacity="0.8" />
          </g>
        ))}

        {/* Ocas */}
        {OCA_POSITIONS.map(({ id, cx, cy }) => {
          const oca = getOca(id);
          const status: StatusOca = oca?.status || 'disponivel';
          const { fill, stroke, glow } = STATUS_FILL[status];
          const isSelected = selected === id;

          return (
            <g
              key={id}
              className={onOcaClick ? 'cursor-pointer' : ''}
              onClick={() => onOcaClick?.(id)}
              onMouseEnter={() => setTooltip({ id, x: cx, y: cy })}
              onMouseLeave={() => setTooltip(null)}
              style={{ transition: 'all 0.2s ease' }}
            >
              {/* Glow / seleção */}
              {(isSelected) && (
                <circle cx={cx} cy={cy} r={34} fill={fill} fillOpacity="0.25" />
              )}
              {/* Halo de status */}
              <circle cx={cx} cy={cy} r={28} fill={glow} />

              {/* Corpo da oca (hexagonal via círculo) */}
              <circle cx={cx} cy={cy} r={22} fill={fill} stroke={stroke} strokeWidth="2"
                style={{ filter: isSelected ? 'brightness(1.1)' : undefined }} />

              {/* Número */}
              <text x={cx} y={cy+5} textAnchor="middle"
                fill="white" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">
                {id}
              </text>

              {/* Label */}
              <text x={cx} y={cy+40} textAnchor="middle"
                fill="#2C3531" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">
                Oca {id}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (() => {
          const oca = getOca(tooltip.id);
          if (!oca) return null;
          const boxW = 172;
          const boxH = oca.checkOut ? 72 : 58;
          const tx = Math.max(10, Math.min(600 - boxW - 10, tooltip.x > 380 ? tooltip.x - boxW + 10 : tooltip.x - 15));
          const ty = Math.max(10, Math.min(420 - boxH - 10, tooltip.y > 280 ? tooltip.y - boxH - 16 : tooltip.y + 34));
          const statusText = oca.status === 'ocupada'
            ? (oca.clienteNome || 'Ocupada')
            : oca.status === 'reservada'
              ? 'Reservada'
              : oca.status === 'manutencao'
                ? 'Manutenção'
                : 'Disponível';
          const statusClipped = statusText.length > 22 ? statusText.slice(0, 21) + '…' : statusText;
          return (
            <g className="pointer-events-none">
              <rect x={tx} y={ty} width={boxW} height={boxH} rx="8" ry="8"
                fill="white" stroke="#A8C9B5" strokeWidth="1" style={{ filter: 'drop-shadow(0 4px 8px #1C302820)' }} />
              <text x={tx+10} y={ty+17} fontSize="10" fontWeight="700" fill="#1C3028" fontFamily="Inter">Oca {oca.id}</text>
              <text x={tx+10} y={ty+31} fontSize="9" fill="#736B60" fontFamily="Inter">
                {statusClipped}
              </text>
              <text x={tx+10} y={ty+45} fontSize="8.5" fill="#736B60" fontFamily="Inter">
                {oca.capacidade} hósp. · {formatCurrency(oca.precoPorNoite)}/noite
              </text>
              {oca.checkOut && (
                <text x={tx+10} y={ty+59} fontSize="8.5" fill="#C87D55" fontFamily="Inter">
                  Saída: {oca.checkOut}
                </text>
              )}
            </g>
          );
        })()}
      </svg>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {(Object.entries(STATUS_FILL) as [StatusOca, typeof STATUS_FILL[StatusOca]][]).map(([s, { fill }]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: fill }} />
            <span className="text-xs text-cedro-500 capitalize">{
              s==='disponivel'?'Disponível':s==='ocupada'?'Ocupada':s==='reservada'?'Reservada':'Manutenção'
            }</span>
          </div>
        ))}
      </div>
    </div>
  );
}
