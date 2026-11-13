/**
 * Configurações em um só lugar. Valores não confirmados ficam como null/"PREENCHER".
 * Fase 1: tudo é estático; nenhuma informação de pagamento é validada pelo site.
 */
export const loja = {
  nome: 'Delícia do Nordeste · Casa do Norte · Santa Cruz',
  nomeCurto: 'Delícia do Nordeste',
  unidade: 'Casa do Norte · Unidade Santa Cruz',
  whatsapp: '5511960149521',
  telefone: '(11) 96014-9521',
  telefoneLink: 'tel:+5511960149521',
  endereco: 'Rua Santa Cruz da Conceição, Parque Belém, São Paulo – SP',
  cep: '02850-100',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+da+Concei%C3%A7%C3%A3o%2C+Parque+Bel%C3%A9m%2C+S%C3%A3o+Paulo%2C+SP%2C+02850-100',
  instagram: '', // PREENCHER: somente se houver perfil oficial.
  heroFoto: '',  // PREENCHER: adicione uma imagem real otimizada em public/imagens/.
  tempoMedioMinutos: null as number | null, // PREENCHER: não exibir prazo inventado.
  pedidosOnlineAtivos: true,
  taxaEntregaFixa: null as number | null, // PREENCHER antes de oferecer delivery.
  pedidoMinimoDelivery: null as number | null, // PREENCHER (0 se não houver mínimo).
  horarios: [
    { dia: 'Domingo', aberto: true, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Segunda-feira', aberto: false, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Terça-feira', aberto: true, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Quarta-feira', aberto: true, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Quinta-feira', aberto: true, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Sexta-feira', aberto: true, abertura: '08:00', fechamento: '22:00' },
    { dia: 'Sábado', aberto: true, abertura: '08:00', fechamento: '22:00' }
  ]
} as const;

export const logoUrl = `${import.meta.env.BASE_URL}assets/aistudio/logo_casa_do_norte_108ee79c.jpg`;
