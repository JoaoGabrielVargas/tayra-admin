import React, { useState } from 'react';
import { Leaf, CheckCircle2, Calendar, Users, Sparkles } from 'lucide-react';
import { useClientesStore } from '../store/clientesStore';
import { useReservasStore } from '../store/reservasStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { calcNights, formatCurrency, labelEspaco } from '../utils/formatters';
import { hoje } from '../utils/dateUtils';
import type { EspacoId } from '../types';

const PRECOS: Record<string, number> = {
  '1': 450, '2': 420, '3': 380, '4': 500, '5': 480, '6': 460, camping: 60,
};

export default function ReservaPublica() {
  const { clientes, addCliente } = useClientesStore();
  const { addReserva } = useReservasStore();
  const { addNotificacao } = useUIStore();

  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    espacoId: '1',
    dataEntrada: hoje(),
    dataSaida: '',
    numHospedes: '2',
    trilha: false,
    cafeManha: false,
    observacoes: '',
  });

  const noites = form.dataEntrada && form.dataSaida && form.dataSaida > form.dataEntrada
    ? calcNights(form.dataEntrada, form.dataSaida)
    : 1;

  const basePreco = PRECOS[form.espacoId] || 420;
  const valorHosp = form.espacoId === 'camping'
    ? basePreco * Number(form.numHospedes || 1) * noites
    : basePreco * noites;
  const valorServicos = (form.trilha ? 90 : 0) + (form.cafeManha ? 35 * Number(form.numHospedes || 1) * noites : 0);
  const totalEstimado = valorHosp + valorServicos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.telefone || !form.dataEntrada || !form.dataSaida) return;

    // Reaproveita cliente se já existir pelo telefone, ou cria automaticamente (automação!)
    const telLimpo = form.telefone.replace(/\D/g, '');
    let cliente = clientes.find((c) => c.telefone.replace(/\D/g, '') === telLimpo);
    if (!cliente) {
      cliente = addCliente({
        nome: form.nome,
        telefone: form.telefone,
        email: form.email || undefined,
      });
    }

    const servicos = [];
    if (form.trilha) servicos.push({ id: crypto.randomUUID(), nome: 'Trilha Guiada', valor: 90 });
    if (form.cafeManha) servicos.push({ id: crypto.randomUUID(), nome: 'Café da Manhã Colonial', valor: 35 * Number(form.numHospedes || 1) * noites });

    const espaco = isNaN(Number(form.espacoId)) ? ('camping' as EspacoId) : (Number(form.espacoId) as EspacoId);

    const nova = addReserva({
      clienteId: cliente.id,
      espacoId: espaco,
      dataEntrada: form.dataEntrada,
      dataSaida: form.dataSaida,
      status: 'pendente',
      numHospedes: Number(form.numHospedes || 1),
      valorHospedagem: valorHosp,
      servicos,
      comanda: [],
      valorTotal: totalEstimado,
      observacoes: form.observacoes,
      origem: 'link_publico',
    });

    addNotificacao({
      tipo: 'info',
      titulo: 'Nova reserva via link público!',
      mensagem: `${form.nome} solicitou ${labelEspaco(espaco)} (${noites} noite(s)).`,
      link: `/reservas/${nova.id}`,
    });

    // Dispara notificação nativa do navegador/celular se autorizada
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Tayra Ecoparque — Nova Reserva!', {
        body: `${form.nome} solicitou ${labelEspaco(espaco)} (${formatCurrency(totalEstimado)}).`,
      });
    }

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-linho-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-mata-100 text-mata-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-mata-900">Solicitação recebida!</h1>
          <p className="text-sm text-cedro-600">
            Sua pré-reserva no <strong>Tayra Ecoparque</strong> já apareceu automaticamente no painel da nossa equipe. Em breve entraremos em contato pelo WhatsApp para confirmar.
          </p>
          <div className="bg-linho-100 rounded-organic p-3 text-xs text-mata-800 font-mono">
            {labelEspaco(isNaN(Number(form.espacoId)) ? form.espacoId : Number(form.espacoId))} · {noites} noite(s) · {formatCurrency(totalEstimado)}
          </div>
          <Button variant="secondary" onClick={() => { setEnviado(false); setForm({ ...form, dataSaida: '', observacoes: '' }); }}>
            Fazer outra solicitação
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linho-100 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-mata-900 text-white rounded-organic-full text-xs font-medium">
            <Leaf size={14} className="text-ambar-400" /> Tayra Ecoparque
          </div>
          <h1 className="font-display text-3xl font-semibold text-mata-900">Reserve sua estadia na mata</h1>
          <p className="text-sm text-cedro-500">Escolha sua Oca ou Camping — sua reserva cai direto para nossa equipe.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Seu nome completo *" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
              <Input label="WhatsApp / Telefone *" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="E-mail (opcional)" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Select
                label="Acomodação *"
                value={form.espacoId}
                onChange={(e) => setForm((f) => ({ ...f, espacoId: e.target.value }))}
                options={[
                  { value: '1', label: 'Oca 1 (até 4 pessoas — R$ 450/noite)' },
                  { value: '2', label: 'Oca 2 (até 3 pessoas — R$ 420/noite)' },
                  { value: '3', label: 'Oca 3 Família (até 6 pessoas — R$ 380/noite)' },
                  { value: '4', label: 'Oca 4 Casal (até 2 pessoas — R$ 500/noite)' },
                  { value: '5', label: 'Oca 5 Riacho (até 4 pessoas — R$ 480/noite)' },
                  { value: '6', label: 'Oca 6 Mata (até 3 pessoas — R$ 460/noite)' },
                  { value: 'camping', label: 'Área de Camping (R$ 60/pessoa/noite)' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Check-in *" type="date" min={hoje()} value={form.dataEntrada} onChange={(e) => setForm((f) => ({ ...f, dataEntrada: e.target.value }))} required />
              <Input label="Check-out *" type="date" min={form.dataEntrada || hoje()} value={form.dataSaida} onChange={(e) => setForm((f) => ({ ...f, dataSaida: e.target.value }))} required />
              <Input label="Hóspedes" type="number" min="1" max="10" value={form.numHospedes} onChange={(e) => setForm((f) => ({ ...f, numHospedes: e.target.value }))} />
            </div>

            <div className="bg-linho-100 rounded-organic p-3 space-y-2">
              <p className="text-xs font-semibold text-mata-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={13} /> Experiências adicionais
              </p>
              <label className="flex items-center gap-2 text-sm text-mata-800 cursor-pointer">
                <input type="checkbox" checked={form.cafeManha} onChange={(e) => setForm((f) => ({ ...f, cafeManha: e.target.checked }))} />
                Café da manhã colonial (+R$ 35/pessoa/dia)
              </label>
              <label className="flex items-center gap-2 text-sm text-mata-800 cursor-pointer">
                <input type="checkbox" checked={form.trilha} onChange={(e) => setForm((f) => ({ ...f, trilha: e.target.checked }))} />
                Trilha ecológica guiada (+R$ 90 por grupo)
              </label>
            </div>

            <Textarea label="Alguma observação?" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} placeholder="Horário previsto de chegada, restrições alimentares..." />

            <div className="bg-mata-900 text-white rounded-organic-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-mata-300 flex items-center gap-1.5"><Calendar size={13} /> {noites} noite(s) · <Users size={13} /> {form.numHospedes} hóspede(s)</p>
                <p className="text-xs text-mata-400 mt-0.5">Valor total estimado</p>
              </div>
              <p className="font-mono text-2xl font-bold text-ambar-400">{formatCurrency(totalEstimado)}</p>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Enviar solicitação de reserva
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
