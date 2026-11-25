export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

export const formatNumber = (v: number, dec=0) =>
  new Intl.NumberFormat('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec}).format(v);

export const formatDate = (iso: string) => {
  if(!iso) return '—';
  const d = new Date(iso.length===10?iso+'T00:00:00':iso);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
};

export const formatDateLong = (iso: string) => {
  if(!iso) return '—';
  const d = new Date(iso.length===10?iso+'T00:00:00':iso);
  return new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric'}).format(d);
};

export const formatDateTime = (iso: string) => {
  if(!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d).replace(',',' às');
};

export const formatRelative = (iso: string) => {
  if(!iso) return '—';
  const diff = new Date(iso).getTime()-Date.now();
  const abs = Math.abs(diff); const past = diff<0;
  const mins=Math.floor(abs/60000), hours=Math.floor(abs/3600000), days=Math.floor(abs/86400000);
  if(mins<1) return 'agora';
  if(mins<60) return past?`há ${mins}min`:`em ${mins}min`;
  if(hours<24) return past?`há ${hours}h`:`em ${hours}h`;
  return past?`há ${days}d`:`em ${days}d`;
};

export const labelEspaco = (id: number|string) =>
  id==='camping'?'Camping':id==='evento'?'Espaço Evento':`Oca ${id}`;

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');

export const pluralize = (n:number,s:string,p:string) => n===1?`${n} ${s}`:`${n} ${p}`;

export const calcNights = (entrada:string,saida:string) =>
  Math.max(1,Math.round((new Date(saida+'T00:00:00').getTime()-new Date(entrada+'T00:00:00').getTime())/86400000));

export const OCA_COLORS: Record<number|string,string> = {
  1:'#2D5240',2:'#4A7C5F',3:'#7FAF8D',4:'#C87D55',5:'#E8A93A',6:'#8A6B56',camping:'#5E9474',evento:'#B05E38'
};

export const STATUS_LABEL: Record<string,string> = {
  pendente:'Pendente',confirmada:'Confirmada',checkin:'Check-in',checkout:'Check-out',paga:'Paga',cancelada:'Cancelada',
  disponivel:'Disponível',ocupada:'Ocupada',reservada:'Reservada',manutencao:'Manutenção',
  orcamento:'Orçamento',confirmado:'Confirmado',realizado:'Realizado',
};

export const formatVariacao = (v?:number) => {
  if(v===undefined||v===null) return '';
  return `${v>0?'+':''}${v.toFixed(1)}%`;
};

export const gerarLinkWhatsApp = (tel:string,msg:string) =>
  `https://wa.me/55${tel.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
