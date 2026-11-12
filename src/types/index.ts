/**
 * Types & Domain Models for Restaurante Delícia do Nordeste - Casa do Norte Santa Cruz
 */

export type UserRole = 'Dono' | 'Gerente' | 'Atendente';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface StoreHours {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  isOpen: boolean;
  openTime: string;  // e.g. "11:00"
  closeTime: string; // e.g. "22:30"
}

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Santa Cruz - Centro", "Bairros adjacentes"
  cepPrefix?: string; // e.g. "235"
  fee: number; // em R$
  estimatedMinutes: number; // e.g. 40
  active: boolean;
}

export interface StoreSettings {
  name: string;
  unit: string;
  concept: string;
  logoUrl: string;
  phoneLandline: string; // "3984-1957"
  phoneLandlineStatus: 'cadastrado_sem_ddd' | 'confirmado';
  phoneDDD?: string;
  whatsappNumber: string; // editable, empty or unconfirmed initially
  whatsappConfirmed: boolean;
  instagram: string;
  facebook: string;
  
  // Endereço (editável no painel)
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressCep: string;
  addressStatus: 'pendente_confirmacao' | 'confirmado';
  googleMapsEmbedUrl?: string;
  googleMapsShareUrl?: string;
  googleRating?: number; // 4.1
  googleTotalReviews?: number; // 16
  priceRange?: string; // "R$ 20 a R$ 80 por pessoa"
  services?: string[]; // ["Refeições no local", "Retirada de pedidos", "Entrega sem contato"]

  // Operação
  isOpenManual: boolean; // toggle geral no painel
  isOrdersPaused: boolean; // pausa temporária de novos pedidos
  pauseReason?: string;
  allowScheduledOrders: boolean;
  minOrderValue: number; // valor mínimo do pedido (R$)
  defaultPrepMinutes: number; // tempo de preparo estimado
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  hours: StoreHours[];
  deliveryZones: DeliveryZone[];
  defaultDeliveryFee: number;
  freeDeliveryAbove?: number;

  // Pagamentos
  mercadoPagoEnabled: boolean;
  mercadoPagoSandbox: boolean;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessTokenConfigured: boolean; // nunca expor o token real no cliente!
  mercadoPagoReady?: boolean; // true somente com servidor e webhook prontos
  mercadoPagoWebhookUrl?: string; // URL pública do backend, sem segredo
  pixEnabled: boolean;
  pixType: 'manual' | 'mercadopago';
  pixKey?: string;
  pixKeyType?: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  pixBeneficiary?: string;
  cashOnDeliveryEnabled: boolean;
  cardOnDeliveryEnabled: boolean;

  // Conteúdo e Avisos
  specialNotice?: string;
  specialNoticeActive: boolean;
  dailySpecialId?: string; // ID do Prato do Dia
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
  imageUrl?: string;
}

export interface OptionChoice {
  id: string;
  name: string;
  description?: string;
  priceModifier: number; // + R$ 0.00 ou + R$ 8.00
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string; // e.g. "Tamanho", "Escolha do Acompanhamento", "Adicionais Especiais"
  description?: string;
  minSelections: number; // 0 = opcional, 1 = obrigatório
  maxSelections: number; // 1 = escolha única (radio), >1 = múltipla escolha (checkboxes)
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number; // Preço base em R$
  promotionalPrice?: number;
  imageUrl: string;
  isExampleDemo: boolean; // Marca clara de prato demonstrativo
  status: 'disponivel' | 'esgotado_hoje' | 'indisponivel' | 'oculto';
  badge?: 'Prato do Dia' | 'Mais Pedido' | 'Tradicional' | 'Novidade' | 'Especial da Casa';
  estimatedMinutes?: number;
  order: number;
  tags?: string[]; // e.g. ["Serve 2 pessoas", "Tradicional Nordestino"]
  optionGroups?: OptionGroup[];
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  priceModifier: number;
}

export interface CartItem {
  cartItemId: string; // unique hash for item + options combination
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  observation?: string;
  unitPriceCalculated: number;
  totalPriceCalculated: number;
}

export type OrderStatus = 
  | 'Recebido' 
  | 'Aceito' 
  | 'Em preparo' 
  | 'Pronto para retirada' 
  | 'Saiu para entrega' 
  | 'Finalizado' 
  | 'Cancelado';

export type PaymentMethod = 'pix' | 'mercadopago' | 'dinheiro' | 'cartao_entrega';

export type PaymentStatus = 
  | 'Aguardando pagamento' 
  | 'Aguardando conferência manual' 
  | 'Pago' 
  | 'Falhou' 
  | 'Expirado' 
  | 'Reembolsado';

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
}

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
}

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: SelectedOption[];
  observation?: string;
  totalItemPrice: number;
}

export interface Order {
  id: string; // e.g. "PED-2026-A1B2"
  accessToken: string; // token secreto seguro para acompanhar o pedido
  createdAt: string;
  updatedAt: string;
  type: 'delivery' | 'pickup';
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  cancelReason?: string;
  customer: OrderCustomer;
  address?: OrderAddress;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  changeFor?: number; // para dinheiro
  paymentDetails?: {
    provider?: 'mercadopago' | 'manual';
    preferenceId?: string;
    pixQrCode?: string;
    pixCopiaECola?: string;
    transactionId?: string;
    paidAt?: string;
    checkoutUrl?: string;
  };
  estimatedTime?: string;
  delivery?: {
    driverName?: string;
    driverPhone?: string;
    note?: string;
    assignedAt?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
  };
}

export interface Coupon {
  id: string;
  code: string; // e.g. "NORDESTE10"
  description: string;
  type: 'percentage' | 'fixed';
  value: number; // 10% ou R$ 15.00
  minValue?: number; // Pedido mínimo
  maxDiscount?: number; // Teto de desconto
  maxUses?: number; // Limite total
  currentUses: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export interface Review {
  id: string;
  orderId?: string;
  customerName: string;
  rating: number; // 1 a 5
  comment: string;
  reply?: string;
  status: 'pendente' | 'aprovada' | 'oculta';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
}
