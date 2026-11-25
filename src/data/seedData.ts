import type {
  Reserva,
  Cliente,
  ItemEstoque,
  LancamentoFinanceiro,
  Evento,
  MovimentacaoEstoque,
  Notificacao,
  User,
} from '../types';

// ============================================================
// TAYRA ECOPARQUE — Seed Data para Demo
// ============================================================

export const USUARIOS_SEED: User[] = [
  { id: 'u1', nome: 'Rafael Administrador', email: 'admin@tayra.com.br', senha: 'tayra2024', role: 'admin' },
  { id: 'u2', nome: 'Mariana Recepção', email: 'mariana@tayra.com.br', senha: 'tayra123', role: 'staff' },
  { id: 'u3', nome: 'Carlos Atendimento', email: 'carlos@tayra.com.br', senha: 'tayra123', role: 'staff' },
  { id: 'u4', nome: 'Fernanda Eventos', email: 'fernanda@tayra.com.br', senha: 'tayra123', role: 'staff' },
  { id: 'u5', nome: 'João Manutenção', email: 'joao@tayra.com.br', senha: 'tayra123', role: 'staff' },
];

export const CLIENTES_SEED: Cliente[] = [
  {
    id: 'c1', nome: 'Ana Paula Souza', telefone: '(11) 98765-4321',
    email: 'ana.souza@gmail.com', cpf: '123.456.789-00', cidade: 'São Paulo', estado: 'SP',
    criadoEm: '2024-01-15T10:00:00Z',
  },
  {
    id: 'c2', nome: 'Rodrigo Ferreira', telefone: '(21) 99887-6543',
    email: 'rodrigo.f@hotmail.com', cidade: 'Rio de Janeiro', estado: 'RJ',
    criadoEm: '2024-02-20T14:30:00Z',
  },
  {
    id: 'c3', nome: 'Juliana Martins', telefone: '(31) 97654-3210',
    email: 'ju.martins@gmail.com', cpf: '987.654.321-00', cidade: 'Belo Horizonte', estado: 'MG',
    criadoEm: '2024-03-05T09:15:00Z',
  },
  {
    id: 'c4', nome: 'Thiago Almeida', telefone: '(41) 96543-2109',
    cidade: 'Curitiba', estado: 'PR',
    criadoEm: '2024-04-10T16:45:00Z',
  },
  {
    id: 'c5', nome: 'Camila Ramos', telefone: '(51) 95432-1098',
    email: 'camila.ramos@gmail.com', cidade: 'Porto Alegre', estado: 'RS',
    criadoEm: '2024-05-22T11:20:00Z',
  },
  {
    id: 'c6', nome: 'Lucas Oliveira', telefone: '(85) 94321-0987',
    email: 'lucas.oliveira@outlook.com', cidade: 'Fortaleza', estado: 'CE',
    criadoEm: '2024-06-01T08:00:00Z',
  },
  {
    id: 'c7', nome: 'Beatriz Costa', telefone: '(71) 93210-9876',
    email: 'bia.costa@gmail.com', cpf: '456.789.123-00', cidade: 'Salvador', estado: 'BA',
    criadoEm: '2024-07-14T13:30:00Z',
  },
  {
    id: 'c8', nome: 'Felipe Nascimento', telefone: '(62) 92109-8765',
    cidade: 'Goiânia', estado: 'GO',
    criadoEm: '2024-08-30T10:00:00Z',
  },
];

const hoje = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export const RESERVAS_SEED: Reserva[] = [
  {
    id: 'r1', clienteId: 'c1', espacoId: 1,
    dataEntrada: fmt(addDays(hoje, -2)), dataSaida: fmt(addDays(hoje, 1)),
    status: 'checkin', numHospedes: 2, valorHospedagem: 450,
    servicos: [{ id: 's1', nome: 'Café da manhã', valor: 60 }],
    comanda: [
      { id: 'ci1', itemEstoqueId: 'e3', nome: 'Cerveja Artesanal', quantidade: 6, precoUnitario: 15, total: 90, adicionadoEm: fmt(addDays(hoje, -1)) },
      { id: 'ci2', itemEstoqueId: 'e5', nome: 'Porcão de Chips', quantidade: 2, precoUnitario: 18, total: 36, adicionadoEm: fmt(hoje) },
    ],
    valorTotal: 636, origem: 'manual',
    criadaEm: addDays(hoje, -10).toISOString(),
    atualizadaEm: addDays(hoje, -2).toISOString(),
    checkInEm: addDays(hoje, -2).toISOString(),
  },
  {
    id: 'r2', clienteId: 'c3', espacoId: 3,
    dataEntrada: fmt(addDays(hoje, 1)), dataSaida: fmt(addDays(hoje, 4)),
    status: 'confirmada', numHospedes: 4, valorHospedagem: 580,
    servicos: [], comanda: [], valorTotal: 580, origem: 'whatsapp',
    criadaEm: addDays(hoje, -5).toISOString(),
    atualizadaEm: addDays(hoje, -5).toISOString(),
  },
  {
    id: 'r3', clienteId: 'c2', espacoId: 2,
    dataEntrada: fmt(addDays(hoje, 3)), dataSaida: fmt(addDays(hoje, 6)),
    status: 'confirmada', numHospedes: 2, valorHospedagem: 450,
    servicos: [], comanda: [], valorTotal: 450, origem: 'link_publico',
    criadaEm: addDays(hoje, -3).toISOString(),
    atualizadaEm: addDays(hoje, -3).toISOString(),
  },
  {
    id: 'r4', clienteId: 'c5', espacoId: 'camping',
    dataEntrada: fmt(addDays(hoje, 5)), dataSaida: fmt(addDays(hoje, 8)),
    status: 'confirmada', numHospedes: 6, valorHospedagem: 360,
    servicos: [], comanda: [], valorTotal: 360, origem: 'manual',
    criadaEm: addDays(hoje, -7).toISOString(),
    atualizadaEm: addDays(hoje, -7).toISOString(),
  },
  {
    id: 'r5', clienteId: 'c4', espacoId: 5,
    dataEntrada: fmt(addDays(hoje, -15)), dataSaida: fmt(addDays(hoje, -12)),
    status: 'paga', numHospedes: 3, valorHospedagem: 420,
    servicos: [{ id: 's2', nome: 'Trilha Guiada', valor: 90 }],
    comanda: [
      { id: 'ci3', itemEstoqueId: 'e1', nome: 'Água Mineral', quantidade: 12, precoUnitario: 4, total: 48, adicionadoEm: fmt(addDays(hoje, -15)) },
    ],
    valorTotal: 558, origem: 'manual',
    criadaEm: addDays(hoje, -20).toISOString(),
    atualizadaEm: addDays(hoje, -12).toISOString(),
    checkInEm: addDays(hoje, -15).toISOString(),
    checkOutEm: addDays(hoje, -12).toISOString(),
    pagoEm: addDays(hoje, -12).toISOString(),
  },
  {
    id: 'r6', clienteId: 'c6', espacoId: 4,
    dataEntrada: fmt(addDays(hoje, 10)), dataSaida: fmt(addDays(hoje, 14)),
    status: 'pendente', numHospedes: 2, valorHospedagem: 500,
    servicos: [], comanda: [], valorTotal: 500, origem: 'link_publico',
    criadaEm: addDays(hoje, -1).toISOString(),
    atualizadaEm: addDays(hoje, -1).toISOString(),
  },
  {
    id: 'r7', clienteId: 'c7', espacoId: 6,
    dataEntrada: fmt(addDays(hoje, -30)), dataSaida: fmt(addDays(hoje, -27)),
    status: 'paga', numHospedes: 2, valorHospedagem: 480,
    servicos: [], comanda: [], valorTotal: 480, origem: 'manual',
    criadaEm: addDays(hoje, -35).toISOString(),
    atualizadaEm: addDays(hoje, -27).toISOString(),
    checkInEm: addDays(hoje, -30).toISOString(),
    checkOutEm: addDays(hoje, -27).toISOString(),
    pagoEm: addDays(hoje, -27).toISOString(),
  },
];

export const ESTOQUE_SEED: ItemEstoque[] = [
  { id: 'e1', nome: 'Água Mineral 500ml', categoria: 'bebida', quantidade: 48, unidade: 'un', quantidadeMinima: 24, precoCusto: 1.5, precoVenda: 4, fornecedor: 'Distribuidora JS', criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e2', nome: 'Refrigerante Lata', categoria: 'bebida', quantidade: 36, unidade: 'un', quantidadeMinima: 20, precoCusto: 3, precoVenda: 8, fornecedor: 'Distribuidora JS', criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e3', nome: 'Cerveja Artesanal 350ml', categoria: 'bebida', quantidade: 60, unidade: 'un', quantidadeMinima: 30, precoCusto: 7, precoVenda: 15, fornecedor: 'Cervejaria Local', criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e4', nome: 'Vinho Tinto', categoria: 'bebida', quantidade: 8, unidade: 'un', quantidadeMinima: 6, precoCusto: 35, precoVenda: 70, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e5', nome: 'Porcão de Chips', categoria: 'alimento', quantidade: 20, unidade: 'un', quantidadeMinima: 10, precoCusto: 8, precoVenda: 18, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e6', nome: 'Pão de Queijo (pacote)', categoria: 'alimento', quantidade: 15, unidade: 'pct', quantidadeMinima: 8, precoCusto: 10, precoVenda: 22, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e7', nome: 'Ovos (dúzia)', categoria: 'alimento', quantidade: 5, unidade: 'dz', quantidadeMinima: 10, precoCusto: 15, precoVenda: 15, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e8', nome: 'Sabonete Líquido', categoria: 'higiene', quantidade: 12, unidade: 'un', quantidadeMinima: 6, precoCusto: 8, precoVenda: 8, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e9', nome: 'Shampoo (100ml)', categoria: 'higiene', quantidade: 24, unidade: 'un', quantidadeMinima: 12, precoCusto: 5, precoVenda: 5, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e10', nome: 'Lenha (fardo)', categoria: 'outro', quantidade: 3, unidade: 'fardo', quantidadeMinima: 5, precoCusto: 60, precoVenda: 60, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e11', nome: 'Desinfetante 1L', categoria: 'limpeza', quantidade: 8, unidade: 'L', quantidadeMinima: 4, precoCusto: 12, precoVenda: 12, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
  { id: 'e12', nome: 'Papel Higiênico (pct 12)', categoria: 'higiene', quantidade: 4, unidade: 'pct', quantidadeMinima: 6, precoCusto: 25, precoVenda: 25, criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-11-20T00:00:00Z' },
];

export const LANCAMENTOS_SEED: LancamentoFinanceiro[] = [
  { id: 'f1', tipo: 'receita', categoria: 'hospedagem', descricao: 'Reserva r5 — Oca 5', valor: 558, data: fmt(addDays(hoje, -12)), reservaId: 'r5', criadoEm: addDays(hoje, -12).toISOString() },
  { id: 'f2', tipo: 'receita', categoria: 'hospedagem', descricao: 'Reserva r7 — Oca 6', valor: 480, data: fmt(addDays(hoje, -27)), reservaId: 'r7', criadoEm: addDays(hoje, -27).toISOString() },
  { id: 'f3', tipo: 'despesa', categoria: 'compras_estoque', descricao: 'Reposição bebidas — Distribuidora JS', valor: 320, data: fmt(addDays(hoje, -20)), criadoEm: addDays(hoje, -20).toISOString() },
  { id: 'f4', tipo: 'despesa', categoria: 'manutencao', descricao: 'Reparos telhado Oca 3', valor: 180, data: fmt(addDays(hoje, -18)), criadoEm: addDays(hoje, -18).toISOString() },
  { id: 'f5', tipo: 'despesa', categoria: 'energia', descricao: 'Conta de energia elétrica', valor: 450, data: fmt(addDays(hoje, -15)), criadoEm: addDays(hoje, -15).toISOString() },
  { id: 'f6', tipo: 'despesa', categoria: 'agua', descricao: 'Conta de água', valor: 120, data: fmt(addDays(hoje, -15)), criadoEm: addDays(hoje, -15).toISOString() },
  { id: 'f7', tipo: 'receita', categoria: 'evento', descricao: 'Entrada evento — Festa 20 anos', valor: 1500, data: fmt(addDays(hoje, -10)), criadoEm: addDays(hoje, -10).toISOString() },
  { id: 'f8', tipo: 'despesa', categoria: 'compras_estoque', descricao: 'Alimentos café da manhã', valor: 210, data: fmt(addDays(hoje, -8)), criadoEm: addDays(hoje, -8).toISOString() },
  { id: 'f9', tipo: 'receita', categoria: 'servico_adicional', descricao: 'Trilhas guiadas — Novembro', valor: 420, data: fmt(addDays(hoje, -5)), criadoEm: addDays(hoje, -5).toISOString() },
  { id: 'f10', tipo: 'despesa', categoria: 'folha_pagamento', descricao: 'Folha de pagamento — Novembro', valor: 3800, data: fmt(addDays(hoje, -1)), criadoEm: addDays(hoje, -1).toISOString() },
];

export const EVENTOS_SEED: Evento[] = [
  {
    id: 'ev1', clienteId: 'c8', tipo: 'casamento', nomeEvento: 'Casamento Família Nascimento',
    dataEvento: fmt(addDays(hoje, 25)), horarioInicio: '16:00', horarioFim: '23:59',
    numConvidados: 120, valorContrato: 8500, valorEntrada: 2500,
    status: 'confirmado',
    checklist: [
      { id: 'ck1', descricao: 'Confirmar decoração com fornecedor', concluido: true },
      { id: 'ck2', descricao: 'Verificar sistema de som', concluido: true },
      { id: 'ck3', descricao: 'Preparar cardápio com cozinheira', concluido: false },
      { id: 'ck4', descricao: 'Limpeza geral do espaço evento', concluido: false },
      { id: 'ck5', descricao: 'Estacionamento e manobrista', concluido: false },
    ],
    observacoes: 'Noivos querem cerimônia ao ar livre, jantar no salão. DJ contratado diretamente.',
    criadoEm: addDays(hoje, -45).toISOString(),
    atualizadaEm: addDays(hoje, -5).toISOString(),
  },
  {
    id: 'ev2', clienteId: 'c5', tipo: 'aniversario', nomeEvento: 'Aniversário 30 anos Camila',
    dataEvento: fmt(addDays(hoje, -10)), horarioInicio: '18:00', horarioFim: '23:00',
    numConvidados: 50, valorContrato: 2800, valorEntrada: 1000,
    status: 'realizado',
    checklist: [
      { id: 'ck6', descricao: 'Decoração balões e mesa', concluido: true },
      { id: 'ck7', descricao: 'Bolo e mesa de doces', concluido: true },
      { id: 'ck8', descricao: 'Lista de presença', concluido: true },
    ],
    criadoEm: addDays(hoje, -40).toISOString(),
    atualizadaEm: addDays(hoje, -10).toISOString(),
  },
];

export const NOTIFICACOES_SEED: Notificacao[] = [
  {
    id: 'n1', tipo: 'alerta', titulo: 'Estoque baixo: Ovos',
    mensagem: 'Apenas 5 dúzias restantes. Mínimo: 10. Reponha em breve.',
    lida: false, criadaEm: new Date().toISOString(),
  },
  {
    id: 'n2', tipo: 'alerta', titulo: 'Estoque baixo: Papel Higiênico',
    mensagem: 'Apenas 4 pacotes restantes. Mínimo: 6.',
    lida: false, criadaEm: new Date().toISOString(),
  },
  {
    id: 'n3', tipo: 'info', titulo: 'Nova reserva via link público',
    mensagem: 'Lucas Oliveira solicitou reserva para Oca 4 — 10 a 14/12.',
    lida: false, criadaEm: addDays(hoje, -1).toISOString(),
  },
  {
    id: 'n4', tipo: 'sucesso', titulo: 'Check-in realizado',
    mensagem: 'Ana Paula Souza fez check-in na Oca 1.',
    lida: true, criadaEm: addDays(hoje, -2).toISOString(),
  },
];

export const MOVIMENTACOES_SEED: MovimentacaoEstoque[] = [
  { id: 'm1', itemEstoqueId: 'e3', tipo: 'saida', quantidade: 6, motivo: 'venda', reservaId: 'r1', valor: 90, data: fmt(addDays(hoje, -1)), registradoPor: 'u2' },
  { id: 'm2', itemEstoqueId: 'e5', tipo: 'saida', quantidade: 2, motivo: 'venda', reservaId: 'r1', valor: 36, data: fmt(hoje), registradoPor: 'u2' },
  { id: 'm3', itemEstoqueId: 'e1', tipo: 'saida', quantidade: 12, motivo: 'venda', reservaId: 'r5', valor: 48, data: fmt(addDays(hoje, -15)), registradoPor: 'u3' },
  { id: 'm4', itemEstoqueId: 'e7', tipo: 'entrada', quantidade: 5, motivo: 'compra', valor: 75, data: fmt(addDays(hoje, -8)), registradoPor: 'u2' },
];
