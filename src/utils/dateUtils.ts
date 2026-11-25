export const hoje = () => new Date().toISOString().split('T')[0];

export const addDias = (iso:string, n:number) => {
  const d = new Date(iso+'T00:00:00'); d.setDate(d.getDate()+n);
  return d.toISOString().split('T')[0];
};

export const inicioMes = (d=new Date()) =>
  new Date(d.getFullYear(),d.getMonth(),1).toISOString().split('T')[0];

export const fimMes = (d=new Date()) =>
  new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().split('T')[0];

export const sobrepostos = (a:{entrada:string;saida:string},b:{entrada:string;saida:string}) =>
  a.entrada < b.saida && a.saida > b.entrada;

export const mesAnoLabel = (d=new Date()) =>
  new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(d).replace(/^\w/,c=>c.toUpperCase());

export const ehHoje = (iso:string) => iso.slice(0,10)===hoje();

export const calcMesAtual = () => {
  const n = new Date();
  return { ano: n.getFullYear(), mes: n.getMonth()+1 };
};
