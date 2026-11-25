// ============================================================
// TAYRA ECOPARQUE — Tipos Centrais
// ============================================================

export type OcaId = 1 | 2 | 3 | 4 | 5 | 6;
export type EspacoId = OcaId | 'camping' | 'evento';

// --- Auth ---
export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string; // hashed simples para localStorage
  role: 'admin' | 'staff';
  avatar?: string;
}

// --- Oca / Espaço ---
export interface Oca {
  id: OcaId;
  nome: string;
  capacidade: number;
  precoPorNoite: number;
  comodidades: string[];
  status: StatusOca;
  descricao: string;
  imagemUrl?: string;
}

export type StatusOca = 'disponivel' | 'ocupada' | 'reservada' | 'manutencao';

export interface EspacoCamping {
  id: 'camping';
  nome: string;
  capacidadeTotal: number;
  precoPorPessoa: number;
  status: StatusOca;
}

export interface EspacoEvento {
  id: 'evento';
  nome: string;
  capacidadeMax: number;
  precoPorDia: number;
  status: StatusOca;
}

// --- Cliente ---
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  cpf?: string;
  cidade?: string;
  estado?: string;
  dataNascimento?: string;
  observacoes?: string;
  criadoEm: string;
  // calculados
  totalReservas?: number;
  valorTotalGasto?: number;
}

// --- Comanda ---
export interface ComandaItem {
  id: string;
  itemEstoqueId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  adicionadoEm: string;
  adicionadoPor?: string;
}

// --- Serviço Adicional ---
export interface ServicoAdicional {
  id: string;
  nome: string;
  valor: number;
}

// --- Reserva ---
export type StatusReserva =
  | 'pendente'
  | 'confirmada'
  | 'checkin'
  | 'checkout'
  | 'paga'
  | 'cancelada';

export type OrigemReserva = 'manual' | 'link_publico' | 'whatsapp' | 'indicacao';

export interface Reserva {
  id: string;
  clienteId: string;
  espacoId: EspacoId;
  dataEntrada: string; // ISO date string
  dataSaida: string;
  status: StatusReserva;
  numHospedes: number;
  valorHospedagem: number;
  servicos: ServicoAdicional[];
  comanda: ComandaItem[];
  valorTotal: number; // hospedagem + serviços + comanda
  observacoes?: string;
  origem: OrigemReserva;
  criadaEm: string;
  atualizadaEm: string;
  pagoEm?: string;
  checkInEm?: string;
  checkOutEm?: string;
}

// --- Estoque ---
export type CategoriaEstoque =
  | 'alimento'
  | 'bebida'
  | 'higiene'
  | 'limpeza'
  | 'manutencao'
  | 'descartavel'
  | 'outro';

export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  quantidade: number;
  unidade: string; // 'un', 'kg', 'L', 'cx', etc.
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda: number; // para venda em comanda
  fornecedor?: string;
  localizacao?: string; // onde está fisicamente
  criadoEm: string;
  atualizadoEm: string;
}

export interface MovimentacaoEstoque {
  id: string;
  itemEstoqueId: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo: string; // 'compra', 'venda', 'uso', 'perda', 'ajuste inventario'
  reservaId?: string;
  valor?: number;
  data: string;
  registradoPor?: string;
}

// --- Financeiro ---
export type TipoLancamento = 'receita' | 'despesa';

export type CategoriaReceita =
  | 'hospedagem'
  | 'comanda'
  | 'evento'
  | 'camping'
  | 'servico_adicional'
  | 'outro';

export type CategoriaDespesa =
  | 'compras_estoque'
  | 'manutencao'
  | 'folha_pagamento'
  | 'energia'
  | 'agua'
  | 'marketing'
  | 'impostos'
  | 'equipamentos'
  | 'outro';

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamento;
  categoria: CategoriaReceita | CategoriaDespesa;
  descricao: string;
  valor: number;
  data: string;
  reservaId?: string;
  eventoId?: string;
  comprovante?: string;
  criadoPor?: string;
  criadoEm: string;
}

// --- Eventos ---
export type TipoEvento = 'casamento' | 'aniversario' | 'corporativo' | 'retiro' | 'outro';
export type StatusEvento = 'orcamento' | 'confirmado' | 'realizado' | 'cancelado';

export interface ChecklistItemEvento {
  id: string;
  descricao: string;
  concluido: boolean;
  responsavel?: string;
}

export interface Evento {
  id: string;
  clienteId: string;
  tipo: TipoEvento;
  nomeEvento: string;
  dataEvento: string;
  horarioInicio: string;
  horarioFim: string;
  numConvidados: number;
  valorContrato: number;
  valorEntrada?: number;
  status: StatusEvento;
  checklist: ChecklistItemEvento[];
  observacoes?: string;
  criadoEm: string;
  atualizadaEm: string;
}

// --- UI Helpers ---
export interface KpiCard {
  titulo: string;
  valor: string | number;
  variacao?: number; // % variação em relação ao mês anterior
  icone: string;
  cor: 'verde' | 'barro' | 'ambar' | 'neutro';
}

export interface AtividadeRecente {
  id: string;
  tipo: 'reserva' | 'checkin' | 'checkout' | 'estoque' | 'financeiro' | 'evento';
  descricao: string;
  timestamp: string;
  referencia?: string; // id da entidade relacionada
}

// --- Notificação ---
export interface Notificacao {
  id: string;
  tipo: 'info' | 'alerta' | 'sucesso' | 'erro';
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
  link?: string;
}
