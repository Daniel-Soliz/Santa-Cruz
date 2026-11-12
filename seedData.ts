import { StoreSettings, Category, MenuItem, Coupon, Review, AdminUser } from '../types';

export const initialStoreSettings: StoreSettings = {
  name: "Restaurante Delícia do Nordeste Santa Cruz",
  unit: "Santa Cruz • Parque Belém",
  concept: "O sabor da culinária nordestina em São Paulo!",
  logoUrl: "/assets/aistudio/logo_casa_do_norte_108ee79c.jpg",
  
  // Telefone e WhatsApp oficial confirmado: (11) 96014-9521
  phoneLandline: "(11) 96014-9521",
  phoneLandlineStatus: "confirmado",
  phoneDDD: "11",
  whatsappNumber: "(11) 96014-9521",
  whatsappConfirmed: true,
  instagram: "",
  facebook: "",

  // Endereço confirmado: Rua Santa Cruz da Conceição, Parque Belém, São Paulo – SP, CEP 02850-100
  addressStreet: "Rua Santa Cruz da Conceição",
  addressNumber: "S/N",
  addressComplement: "Parque Belém",
  addressNeighborhood: "Parque Belém",
  addressCity: "São Paulo",
  addressState: "SP",
  addressCep: "02850-100",
  addressStatus: "confirmado",
  googleMapsShareUrl: "https://www.google.com/maps/search/?api=1&query=Rua+Santa+Cruz+da+Concei%C3%A7%C3%A3o,+Parque+Bel%C3%A9m,+S%C3%A3o+Paulo+-+SP,+02850-100",
  googleRating: 4.1,
  googleTotalReviews: 16,
  priceRange: "R$ 20 a R$ 80 por pessoa",
  services: [
    "Refeições no local",
    "Retirada de pedidos",
    "Entrega sem contato"
  ],

  // Operação
  isOpenManual: true,
  isOrdersPaused: false,
  pauseReason: "",
  allowScheduledOrders: false,
  minOrderValue: 20.00,
  defaultPrepMinutes: 30,
  deliveryEnabled: true,
  pickupEnabled: true,

  // Horário oficial: Terça a domingo, das 08h às 22h. Segunda-feira: Fechado.
  hours: [
    { dayOfWeek: 0, dayName: "Domingo", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 1, dayName: "Segunda-feira", isOpen: false, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 2, dayName: "Terça-feira", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 3, dayName: "Quarta-feira", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 4, dayName: "Quinta-feira", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 5, dayName: "Sexta-feira", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { dayOfWeek: 6, dayName: "Sábado", isOpen: true, openTime: "08:00", closeTime: "22:00" },
  ],

  deliveryZones: [
    { id: "z1", name: "Parque Belém e Entorno", cepPrefix: "02850", fee: 6.00, estimatedMinutes: 30, active: true },
    { id: "z2", name: "Freguesia do Ó e Brasilândia", cepPrefix: "028", fee: 8.50, estimatedMinutes: 40, active: true },
    { id: "z3", name: "Bairros Adjacentes Zona Norte SP", cepPrefix: "02", fee: 11.00, estimatedMinutes: 45, active: true },
  ],
  defaultDeliveryFee: 7.50,
  freeDeliveryAbove: 100.00,

  // Pagamentos
  mercadoPagoEnabled: true,
  mercadoPagoSandbox: true,
  mercadoPagoPublicKey: "",
  mercadoPagoAccessTokenConfigured: false,
  pixEnabled: true,
  pixType: "manual",
  pixKey: "11960149521",
  pixKeyType: "telefone",
  pixBeneficiary: "Restaurante Delícia do Nordeste Santa Cruz",
  cashOnDeliveryEnabled: true,
  cardOnDeliveryEnabled: true,

  specialNotice: "O sabor da culinária nordestina em São Paulo! Atendimento de terça a domingo das 08h às 22h. Refeições no local, retirada e delivery sem contato.",
  specialNoticeActive: true,
  dailySpecialId: "item-baiao-completo"
};

export const initialCategories: Category[] = [
  { id: "cat-pratos-do-dia", name: "Pratos do Dia", slug: "pratos-do-dia", description: "Sugestões especiais e fartas com preço promocional", order: 1, active: true },
  { id: "cat-carnes", name: "Carnes Nordestinas", slug: "carnes", description: "Carne de sol, cupim, linguiças e cortes tradicionais", order: 2, active: true },
  { id: "cat-baiao", name: "Baião de Dois", slug: "baiao-de-dois", description: "O clássico do sertão preparado com queijo coalho e feijão fradinho", order: 3, active: true },
  { id: "cat-porcoes", name: "Porções & Petiscos", slug: "porcoes", description: "Ideais para compartilhar ou acompanhar sua refeição", order: 4, active: true },
  { id: "cat-bebidas", name: "Bebidas & Sucos", slug: "bebidas", description: "Sucos naturais de frutas típicas, refrigerantes e cervejas", order: 5, active: true },
  { id: "cat-sobremesas", name: "Sobremesas Típicas", slug: "sobremesas", description: "Pudim de tapioca, doce de leite e delícias regionais", order: 6, active: true },
];

export const initialMenuItems: MenuItem[] = [
  {
    id: "item-baiao-completo",
    name: "Baião de Dois Completo da Casa [EXEMPLO]",
    slug: "baiao-de-dois-completo",
    categoryId: "cat-pratos-do-dia",
    description: "[EXEMPLO FICTÍCIO] Autêntico baião com arroz, feijão de corda, carne de sol desfiada, bacon, queijo coalho tostado na chapa e cheiro-verde fresco.",
    price: 49.90,
    promotionalPrice: 44.90,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Prato do Dia",
    estimatedMinutes: 30,
    order: 1,
    tags: ["Serve 2 pessoas", "Mais Pedido", "Nordestino"],
    optionGroups: [
      {
        id: "opt-tamanho-baiao",
        name: "Tamanho da Porção",
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: "sz-individual", name: "Individual (Aproximadamente 450g)", priceModifier: 0, isDefault: true },
          { id: "sz-duplo", name: "Serve 2 Pessoas (Aproximadamente 900g)", priceModifier: 22.00 },
          { id: "sz-familia", name: "Família Serve 4 (Aproximadamente 1.8kg)", priceModifier: 48.00 }
        ]
      },
      {
        id: "opt-extras-baiao",
        name: "Adicionais Especiais (Opcional)",
        minSelections: 0,
        maxSelections: 3,
        choices: [
          { id: "ext-queijo-extra", name: "Queijo Coalho Grelhado Extra (120g)", priceModifier: 8.50 },
          { id: "ext-manteiga-garrafa", name: "Dose de Manteiga de Garrafa Pura (60ml)", priceModifier: 5.00 },
          { id: "ext-farofa-crocante", name: "Farofa de Bacon e Alho Crocante", priceModifier: 6.00 }
        ]
      }
    ]
  },
  {
    id: "item-carne-sol-macaxeira",
    name: "Carne de Sol com Macaxeira na Manteiga [EXEMPLO]",
    slug: "carne-de-sol-com-macaxeira",
    categoryId: "cat-carnes",
    description: "[EXEMPLO FICTÍCIO] Suculenta carne de sol maturada e puxada na cebola roxa, servida com macaxeira cozida e regada na manteiga de garrafa do sertão.",
    price: 58.00,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Especial da Casa",
    estimatedMinutes: 35,
    order: 2,
    tags: ["Carne Nobre", "Tradicional da Casa"],
    optionGroups: [
      {
        id: "opt-ponto-carne",
        name: "Preparo da Macaxeira",
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: "mac-cozida", name: "Macaxeira Cozida na Manteiga de Garrafa", priceModifier: 0, isDefault: true },
          { id: "mac-frita", name: "Macaxeira Frita Bem Crocante", priceModifier: 0 }
        ]
      },
      {
        id: "opt-adicionais-carne",
        name: "Complementos",
        minSelections: 0,
        maxSelections: 2,
        choices: [
          { id: "comp-feijao-tropeiro", name: "Porção de Feijão Tropeiro (200g)", priceModifier: 12.00 },
          { id: "comp-vinaigrete", name: "Vinagrete Nordestino Especial", priceModifier: 4.50 }
        ]
      }
    ]
  },
  {
    id: "item-feijao-tropeiro",
    name: "Feijão Tropeiro Tradicional da Casa [EXEMPLO]",
    slug: "feijao-tropeiro-tradicional",
    categoryId: "cat-pratos-do-dia",
    description: "[EXEMPLO FICTÍCIO] Feijão fradinho refogado com farinha de mandioca fina, pedacinhos de linguiça calabresa, bacon crocante, ovos e couve fresca.",
    price: 42.00,
    imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Tradicional",
    estimatedMinutes: 25,
    order: 3,
    tags: ["Típico", "Farto"]
  },
  {
    id: "item-cuscuz-recheado",
    name: "Cuscuz Nordestino com Carne Seca e Queijo [EXEMPLO]",
    slug: "cuscuz-nordestino-carne-seca",
    categoryId: "cat-pratos-do-dia",
    description: "[EXEMPLO FICTÍCIO] Fofo cuscuz de milho no vapor, generosamente recheado com carne seca desfiada e queijo coalho derretido, finalizado com manteiga de garrafa.",
    price: 28.50,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Mais Pedido",
    estimatedMinutes: 20,
    order: 4,
    tags: ["Café ou Almoço", "Cuscuz Quentinho"]
  },
  {
    id: "item-porcao-macaxeira",
    name: "Porção de Macaxeira Frita Douradinha [EXEMPLO]",
    slug: "porcao-macaxeira-frita",
    categoryId: "cat-porcoes",
    description: "[EXEMPLO FICTÍCIO] Pedaços de macaxeira crocantes por fora e macios como veludo por dentro. Acompanha maionese temperada da casa.",
    price: 24.00,
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    estimatedMinutes: 20,
    order: 5,
    tags: ["Petisco", "Crocante"]
  },
  {
    id: "item-pacoca-carne-seca",
    name: "Paçoca de Carne Seca no Pilão [EXEMPLO]",
    slug: "pacoca-de-carne-seca",
    categoryId: "cat-porcoes",
    description: "[EXEMPLO FICTÍCIO] Carne de sol tostada e socada no pilão de madeira com farinha de mandioca e temperos típicos. Porção de 300g.",
    price: 32.00,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Tradicional",
    estimatedMinutes: 15,
    order: 6
  },
  {
    id: "item-suco-caju",
    name: "Suco Natural de Caju (500ml) [EXEMPLO]",
    slug: "suco-natural-caju",
    categoryId: "cat-bebidas",
    description: "[EXEMPLO FICTÍCIO] Feito com a polpa fresca do caju nordestino, bem geladinho e refrescante.",
    price: 9.50,
    imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    order: 7,
    optionGroups: [
      {
        id: "opt-adocante",
        name: "Açúcar / Adoçante",
        minSelections: 1,
        maxSelections: 1,
        choices: [
          { id: "ac-sem", name: "Sem açúcar (Puro)", priceModifier: 0, isDefault: true },
          { id: "ac-com", name: "Com açúcar", priceModifier: 0 },
          { id: "ac-adoc", name: "Com adoçante", priceModifier: 0 }
        ]
      }
    ]
  },
  {
    id: "item-suco-graviola",
    name: "Suco Natural de Graviola (500ml) [EXEMPLO]",
    slug: "suco-natural-graviola",
    categoryId: "cat-bebidas",
    description: "[EXEMPLO FICTÍCIO] Polpa concentrada de graviola batida com água ou leite gelado.",
    price: 11.00,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    order: 8
  },
  {
    id: "item-pudim-tapioca",
    name: "Pudim de Tapioca com Calda de Caramelo [EXEMPLO]",
    slug: "pudim-de-tapioca",
    categoryId: "cat-sobremesas",
    description: "[EXEMPLO FICTÍCIO] Textura única de tapioca granulada cozida em leite de coco e leite condensado, banhada em calda dourada de caramelo.",
    price: 14.00,
    imageUrl: "https://images.unsplash.com/photo-1514849302-984523450ce4?auto=format&fit=crop&w=800&q=80",
    isExampleDemo: true,
    status: "disponivel",
    badge: "Especial da Casa",
    order: 9
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: "coup-nordeste10",
    code: "NORDESTE10",
    description: "10% de desconto no seu pedido de estreia",
    type: "percentage",
    value: 10,
    minValue: 30.00,
    maxDiscount: 20.00,
    maxUses: 100,
    currentUses: 3,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    active: true
  },
  {
    id: "coup-santacruz5",
    code: "SANTACRUZ5",
    description: "R$ 5,00 de desconto especial para moradores da região",
    type: "fixed",
    value: 5.00,
    minValue: 40.00,
    maxUses: 50,
    currentUses: 1,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    active: true
  }
];

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    customerName: "Dona Maria do Socorro",
    rating: 5,
    comment: "Melhor baião de dois de Santa Cruz! A carne de sol é macia e a porção é muito farta. Chegou quentinho.",
    reply: "Muito obrigado pelo carinho, Dona Maria! O sertão é a nossa paixão.",
    status: "aprovada",
    createdAt: "2026-11-10T14:30:00Z"
  },
  {
    id: "rev-2",
    customerName: "Carlos Eduardo Silva",
    rating: 5,
    comment: "A macaxeira frita com queijo coalho e o cuscuz recheado são nota 10. Recomendo demais!",
    status: "aprovada",
    createdAt: "2026-11-09T20:15:00Z"
  }
];

// O Dono inicial padrão tem credencial com sinalização de troca obrigatória no primeiro acesso
// Conforme solicitado no prompt, nunca expomos senhas definitivas ou senhas hardcoded em produção.
export const initialAdminUsers: AdminUser[] = [
  {
    id: "user-owner-1",
    email: "dono@deliciadonordeste.com.br",
    name: "Administrador / Dono",
    role: "Dono",
    active: true,
    mustChangePassword: true,
    createdAt: "2026-11-01T10:00:00Z"
  },
  {
    id: "user-manager-1",
    email: "gerencia@deliciadonordeste.com.br",
    name: "Gerente Operacional",
    role: "Gerente",
    active: true,
    mustChangePassword: true,
    createdAt: "2026-11-01T10:00:00Z"
  },
  {
    id: "user-attendant-1",
    email: "atendente@deliciadonordeste.com.br",
    name: "Atendente Balcão & Cozinha",
    role: "Atendente",
    active: true,
    mustChangePassword: true,
    createdAt: "2026-11-01T10:00:00Z"
  }
];
