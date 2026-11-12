import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { verifyMercadoPagoSignature, amountMatches } from './src/server/paymentSecurity';
import { 
  StoreSettings, 
  Category, 
  MenuItem, 
  Order, 
  Coupon, 
  Review, 
  AdminUser, 
  AuditLog,
  OrderStatus,
  PaymentStatus 
} from './src/types';
import { 
  initialStoreSettings, 
  initialCategories, 
  initialMenuItems, 
  initialCoupons, 
  initialReviews, 
  initialAdminUsers 
} from './src/data/seedData';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data storage file
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
if (isProd && !process.env.DATA_DIR) {
  throw new Error('Configure DATA_DIR em um volume persistente antes de publicar o sistema.');
}
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  settings: StoreSettings;
  categories: Category[];
  menuItems: MenuItem[];
  coupons: Coupon[];
  reviews: Review[];
  adminUsers: (AdminUser & { passwordHash: string; salt: string })[];
  orders: Order[];
  auditLogs: AuditLog[];
  processedWebhooks: string[]; // Idempotency list
}

// In-memory sessions
const activeSessions = new Map<string, { userId: string; role: string; expiresAt: number }>();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as DatabaseSchema;
    } catch (e) {
      console.error('Não foi possível ler o banco de pedidos.', e);
      throw new Error('Banco existente inválido. Faça a recuperação do backup, não reinicialize os pedidos.');
    }
  }

  // Initial user setup
  // Password initially requires change on first login as instructed in prompt
  const bootstrapPassword = process.env.ADMIN_PASSWORD || (isProd ? '' : 'Nordeste@2026');
  const bootstrapEmail = process.env.ADMIN_EMAIL || (isProd ? '' : 'dono@deliciadonordeste.com.br');
  if (!bootstrapEmail || bootstrapPassword.length < 12) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres) para criar o primeiro administrador.');
  }
  // Apenas uma conta proprietária é criada. Novos funcionários são cadastrados no painel.
  const initialUsersWithPass = initialAdminUsers.slice(0, 1).map(u => {
    const salt = crypto.randomBytes(16).toString('hex');
    return { ...u, email: bootstrapEmail, passwordHash: hashPassword(bootstrapPassword, salt), salt };
  });

  const defaultDb: DatabaseSchema = {
    settings: initialStoreSettings,
    categories: initialCategories,
    menuItems: initialMenuItems,
    coupons: initialCoupons,
    reviews: initialReviews,
    adminUsers: initialUsersWithPass,
    orders: [],
    auditLogs: [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        userId: 'system',
        userEmail: 'sistema@deliciadonordeste.com.br',
        action: 'INICIALIZACAO_BANCO',
        details: 'Banco de dados inicializado com sucesso para Restaurante Delícia do Nordeste - Casa do Norte Santa Cruz.'
      }
    ],
    processedWebhooks: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  return defaultDb;
}

let db = ensureDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Falha ao salvar os pedidos em disco:', err);
    throw err;
  }
}

// Auth Middleware
function authRequired(requiredRoles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      activeSessions.delete(token);
      return res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
    }

    if (requiredRoles && !requiredRoles.includes(session.role)) {
      return res.status(403).json({ 
        error: `Acesso negado. Seu perfil (${session.role}) não tem permissão para esta ação.` 
      });
    }

    (req as any).user = session;
    next();
  };
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// Endpoint de saúde do servidor e da API
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'santa-cruz-pedidos' });
});

// A publicação estática no GitHub Pages NÃO executa esta API.
function mercadoPagoReady() {
  const url = process.env.APP_URL || '';
  return !!process.env.MERCADO_PAGO_ACCESS_TOKEN &&
    !!process.env.MERCADO_PAGO_WEBHOOK_SECRET &&
    /^https:\/\/[^/]+/i.test(url) &&
    !!db.settings.mercadoPagoEnabled;
}

// Configuração pública sem credenciais privadas.
app.get('/api/settings', (_req: Request, res: Response) => {
  const url = process.env.APP_URL || '';
  res.json({
    ...db.settings,
    mercadoPagoAccessTokenConfigured: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    mercadoPagoReady: mercadoPagoReady(),
    mercadoPagoEnabled: mercadoPagoReady(),
    mercadoPagoWebhookUrl: /^https:\/\/[^/]+/i.test(url)
      ? `${url.replace(/\/$/, '')}/api/payments/mercadopago/webhook`
      : ''
  });
});

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  const activeCategories = db.categories
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);
  res.json(activeCategories);
});

// Menu Items (Public)
app.get('/api/menu', (_req: Request, res: Response) => {
  // Only return items that are not hidden
  const publicMenu = db.menuItems
    .filter(item => item.status !== 'oculto')
    .sort((a, b) => a.order - b.order);
  res.json(publicMenu);
});

// Single Menu Item
app.get('/api/menu/:slug', (req: Request, res: Response) => {
  const item = db.menuItems.find(i => i.slug === req.params.slug || i.id === req.params.slug);
  if (!item || item.status === 'oculto') {
    return res.status(404).json({ error: 'Prato não encontrado' });
  }
  res.json(item);
});

// Validate Coupon
app.get('/api/coupons/validate', (req: Request, res: Response) => {
  const code = (req.query.code as string || '').toUpperCase().trim();
  const subtotal = parseFloat(req.query.subtotal as string || '0');

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code && c.active);
  if (!coupon) {
    return res.status(400).json({ error: 'Cupom inválido ou inexistente' });
  }

  const now = new Date().toISOString();
  if (coupon.validFrom && now < coupon.validFrom) {
    return res.status(400).json({ error: 'Este cupom ainda não está ativo' });
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return res.status(400).json({ error: 'Este cupom já expirou' });
  }
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return res.status(400).json({ error: 'Limite de usos deste cupom esgotado' });
  }
  if (coupon.minValue && subtotal < coupon.minValue) {
    return res.status(400).json({ 
      error: `Valor mínimo para este cupom é de R$ ${coupon.minValue.toFixed(2).replace('.', ',')}` 
    });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, subtotal);

  res.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discountAmount: Math.round(discount * 100) / 100,
  });
});

// As zonas ativas são uma lista de CEPs autorizados, não apenas sugestões.
function quoteDelivery(cepValue: unknown, subtotal: number) {
  if (!db.settings.deliveryEnabled) throw new Error('Entregas pausadas neste momento.');
  const cep = String(cepValue || '').replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('Informe um CEP válido com 8 números.');
  const zones = db.settings.deliveryZones || [];
  const match = [...zones].filter(z => z.active && z.cepPrefix && cep.startsWith(z.cepPrefix.replace(/\D/g, '')))
    .sort((a,b) => (b.cepPrefix?.length || 0) - (a.cepPrefix?.length || 0))[0];
  if (zones.length > 0 && !match) throw new Error('Ainda não entregamos neste CEP. Escolha retirada ou fale com a equipe.');
  const amount = Number(match ? match.fee : db.settings.defaultDeliveryFee);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Taxa de entrega não configurada corretamente.');
  return {
    available: true,
    cep,
    zone: match?.name || 'Área de entrega',
    fee: db.settings.freeDeliveryAbove && subtotal >= db.settings.freeDeliveryAbove ? 0 : amount,
    estimatedMinutes: match?.estimatedMinutes || db.settings.defaultPrepMinutes + 20
  };
}

app.post('/api/delivery/quote', (req: Request, res: Response) => {
  try {
    const subtotal = Number(req.body?.subtotal || 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) throw new Error('Subtotal inválido.');
    res.json(quoteDelivery(req.body?.cep, subtotal));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Real Server-Side Order Calculation
// Crucial security requirement: Client CANNOT dictate final price!
function calculateOrderTotals(payload: {
  items: {
    menuItemId: string;
    quantity: number;
    selectedOptions?: { groupId: string; choiceId: string }[];
    observation?: string;
  }[];
  deliveryType: 'delivery' | 'pickup';
  address?: { cep?: string; neighborhood?: string };
  couponCode?: string;
}) {
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 40) {
    throw new Error('Pedido inválido: escolha entre 1 e 40 produtos.');
  }
  if (payload.deliveryType !== 'delivery' && payload.deliveryType !== 'pickup') {
    throw new Error('Escolha entrega ou retirada.');
  }
  if (payload.deliveryType === 'pickup' && !db.settings.pickupEnabled) {
    throw new Error('Retirada indisponível neste momento.');
  }

  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const requestedItem of payload.items) {
    if (!requestedItem || !Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1 || requestedItem.quantity > 50) {
      throw new Error('A quantidade por prato deve ser de 1 a 50.');
    }
    if (requestedItem.selectedOptions !== undefined && !Array.isArray(requestedItem.selectedOptions)) {
      throw new Error('Os adicionais enviados são inválidos.');
    }
    const menuItem = db.menuItems.find(m => m.id === requestedItem.menuItemId);
    if (!menuItem) {
      throw new Error(`Item ${requestedItem.menuItemId} não existe no cardápio.`);
    }
    if (menuItem.status === 'indisponivel' || menuItem.status === 'oculto') {
      throw new Error(`O prato "${menuItem.name}" está indisponível no momento.`);
    }
    if (menuItem.status === 'esgotado_hoje') {
      throw new Error(`O prato "${menuItem.name}" esgotou por hoje.`);
    }

    for (const group of menuItem.optionGroups || []) {
      const chosen = (requestedItem.selectedOptions || []).filter(s => s.groupId === group.id);
      if (chosen.length < group.minSelections || chosen.length > group.maxSelections) {
        throw new Error('Confira as escolhas obrigatórias de ' + group.name + '.');
      }
      if (new Set(chosen.map(s => s.choiceId)).size !== chosen.length) {
        throw new Error('Não repita o mesmo adicional.');
      }
    }

    let unitPrice = menuItem.promotionalPrice ?? menuItem.price;
    const selectedOptionSnapshots: any[] = [];

    if (requestedItem.selectedOptions && requestedItem.selectedOptions.length > 0) {
      for (const sel of requestedItem.selectedOptions) {
        const group = menuItem.optionGroups?.find(g => g.id === sel.groupId);
        if (!group) throw new Error('Grupo de adicional inválido.');
        const choice = group.choices?.find(c => c.id === sel.choiceId);
        if (!choice) throw new Error('Adicional inválido.');

        unitPrice += choice.priceModifier;
        selectedOptionSnapshots.push({
          groupId: group.id,
          groupName: group.name,
          choiceId: choice.id,
          choiceName: choice.name,
          priceModifier: choice.priceModifier
        });
      }
    }

    const itemTotal = unitPrice * requestedItem.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: requestedItem.quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      selectedOptions: selectedOptionSnapshots,
      observation: requestedItem.observation || '',
      totalItemPrice: Math.round(itemTotal * 100) / 100
    });
  }

  // Cálculo único compartilhado pelo checkout e pela consulta de entrega.
  const deliveryFee = payload.deliveryType === 'delivery'
    ? quoteDelivery(payload.address?.cep, subtotal).fee
    : 0;

  // Coupon discount
  let discount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (payload.couponCode) {
    const coupon = db.coupons.find(c => c.code.toUpperCase() === payload.couponCode!.toUpperCase() && c.active);
    if (coupon) {
      const now = new Date().toISOString();
      const isValidTime = (!coupon.validFrom || now >= coupon.validFrom) && (!coupon.validUntil || now <= coupon.validUntil);
      const isUnderMax = !coupon.maxUses || coupon.currentUses < coupon.maxUses;
      const meetsMin = !coupon.minValue || subtotal >= coupon.minValue;

      if (isValidTime && isUnderMax && meetsMin) {
        appliedCouponCode = coupon.code;
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
      }
    }
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);

  return {
    verifiedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    couponCode: appliedCouponCode,
    total: Math.round(total * 100) / 100
  };
}

// Calculate preview endpoint
app.post('/api/orders/calculate', (req: Request, res: Response) => {
  try {
    const calculation = calculateOrderTotals(req.body);
    res.json(calculation);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao calcular pedido' });
  }
});

// Create Order (Public client)
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { 
      items, 
      deliveryType, 
      customer, 
      address, 
      couponCode, 
      paymentMethod, 
      changeFor 
    } = req.body;

    // Loja fechada ou pausada não recebe novos pedidos.
    if (!db.settings.isOpenManual) {
      return res.status(400).json({ error: 'Restaurante fechado para novos pedidos no momento.' });
    }
    if (db.settings.isOrdersPaused) {
      return res.status(400).json({ 
        error: `Pedidos temporariamente pausados: ${db.settings.pauseReason || 'Voltaremos em breve!'}` 
      });
    }

    if (!customer || typeof customer.name !== 'string' || typeof customer.phone !== 'string' ||
        !customer.name.trim() || !/^\d{10,13}$/.test(customer.phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Nome e telefone do cliente são obrigatórios.' });
    }

    if (deliveryType === 'delivery') {
      if (!address || !address.street || !address.number || !address.neighborhood) {
        return res.status(400).json({ error: 'Endereço completo é obrigatório para entrega.' });
      }
    }

    const enabledMethods: Record<string, boolean> = {
      pix: !!db.settings.pixEnabled && db.settings.pixType === 'manual' && !!db.settings.pixKey?.trim(),
      mercadopago: mercadoPagoReady(),
      dinheiro: !!db.settings.cashOnDeliveryEnabled,
      cartao_entrega: !!db.settings.cardOnDeliveryEnabled
    };
    if (!Object.prototype.hasOwnProperty.call(enabledMethods, paymentMethod) || !enabledMethods[paymentMethod]) {
      return res.status(400).json({ error: 'Selecione uma forma de pagamento disponível.' });
    }

    // Server-side calculation to prevent tampering
    const calculation = calculateOrderTotals({
      items,
      deliveryType,
      address,
      couponCode
    });

    const parsedChangeFor = paymentMethod === 'dinheiro' && changeFor !== undefined && changeFor !== ''
      ? Number(String(changeFor).replace(',', '.'))
      : undefined;
    if (parsedChangeFor !== undefined && (!Number.isFinite(parsedChangeFor) || parsedChangeFor < calculation.total)) {
      return res.status(400).json({ error: 'Valor para troco deve ser maior ou igual ao total do pedido.' });
    }

    if (isProd && process.env.ALLOW_DEMO_ORDERS !== 'true' &&
        calculation.verifiedItems.some(i => db.menuItems.some(m => m.id === i.menuItemId && m.isExampleDemo))) {
      return res.status(400).json({ error: 'Cardápio de demonstração. Cadastre os pratos e preços reais antes de vender.' });
    }

    if (calculation.subtotal < db.settings.minOrderValue) {
      return res.status(400).json({ 
        error: `Valor mínimo do pedido é de R$ ${db.settings.minOrderValue.toFixed(2).replace('.', ',')}` 
      });
    }

    // Generate unique collision-free ID and high-entropy tracking token
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `PED-${new Date().getFullYear()}-${randomSuffix}`;
    const accessToken = 'sec_' + crypto.randomBytes(24).toString('hex');

    let initialPaymentStatus: PaymentStatus = 'Aguardando pagamento';
    if (paymentMethod === 'dinheiro' || paymentMethod === 'cartao_entrega') {
      initialPaymentStatus = 'Aguardando conferência manual';
    } else if (paymentMethod === 'pix' && db.settings.pixType === 'manual') {
      initialPaymentStatus = 'Aguardando conferência manual';
    }

    const newOrder: Order = {
      id: orderNumber,
      accessToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: deliveryType,
      status: 'Recebido',
      statusHistory: [
        {
          status: 'Recebido',
          timestamp: new Date().toISOString(),
          note: 'Pedido recebido pelo sistema da Casa do Norte Santa Cruz.'
        }
      ],
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim()
      },
      address: deliveryType === 'delivery' ? address : undefined,
      items: calculation.verifiedItems,
      subtotal: calculation.subtotal,
      deliveryFee: calculation.deliveryFee,
      discount: calculation.discount,
      couponCode: calculation.couponCode,
      total: calculation.total,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      changeFor: parsedChangeFor,
      paymentDetails: {
        provider: paymentMethod === 'mercadopago' ? 'mercadopago' : 'manual'
      },
      estimatedTime: `${db.settings.defaultPrepMinutes + (deliveryType === 'delivery' ? 20 : 0)} a ${db.settings.defaultPrepMinutes + (deliveryType === 'delivery' ? 35 : 10)} min`
    };

    // Increment coupon uses
    if (calculation.couponCode) {
      const c = db.coupons.find(cp => cp.code === calculation.couponCode);
      if (c) c.currentUses += 1;
    }

    // Save order
    db.orders.unshift(newOrder);
    saveDatabase();

    res.status(201).json({
      success: true,
      orderId: newOrder.id,
      accessToken: newOrder.accessToken,
      order: newOrder
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(400).json({ error: err.message || 'Erro ao processar pedido' });
  }
});

// Secure Tracking Route: only accessible with accessToken or Admin token
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  const queryToken = req.query.token as string;
  const authHeader = req.headers.authorization;
  let isAdmin = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      isAdmin = true;
    }
  }

  // Security enforcement: client must have the secret order token
  if (!isAdmin && (!queryToken || queryToken !== order.accessToken)) {
    return res.status(403).json({ 
      error: 'Acesso restrito ao pedido. O token de acompanhamento fornecido é inválido.' 
    });
  }

  res.json(order);
});

// Reviews
app.get('/api/reviews', (_req: Request, res: Response) => {
  const approved = db.reviews.filter(r => r.status === 'aprovada');
  res.json(approved);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { customerName, rating, comment, orderId } = req.body;
  if (!customerName || !rating || !comment) {
    return res.status(400).json({ error: 'Nome, nota e comentário são obrigatórios.' });
  }

  const newReview: Review = {
    id: 'rev-' + crypto.randomBytes(4).toString('hex'),
    orderId,
    customerName: customerName.trim(),
    rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
    comment: comment.trim(),
    status: 'pendente', // Moderation required
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);
  saveDatabase();

  res.status(201).json({ 
    success: true, 
    message: 'Avaliação recebida! Ela será exibida no site após moderação da equipe.',
    review: newReview 
  });
});

// ViaCEP Proxy Helper
app.get('/api/viacep/:cep', async (req: Request, res: Response) => {
  const cleanCep = req.params.cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return res.status(400).json({ error: 'CEP deve ter 8 dígitos' });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      throw new Error('Falha ao consultar ViaCEP');
    }
    const data = await response.json();
    if (data.erro) {
      return res.status(404).json({ error: 'CEP não encontrado na base dos Correios.' });
    }
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: 'Serviço dos Correios indisponível no momento' });
  }
});

// QR Code generator endpoint
app.get('/api/qrcode', async (req: Request, res: Response) => {
  const text = req.query.text as string;
  if (!text) {
    return res.status(400).json({ error: 'Parâmetro text é obrigatório' });
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#722238', // Maroon brand color
        light: '#FFFFFF'
      }
    });
    res.json({ dataUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// ----------------------------------------------------
// MERCADO PAGO INTEGRATION ENDPOINTS
// ----------------------------------------------------

// Checkout Pro via Preferences API. Credenciais ficam apenas no servidor.
app.post('/api/payments/mercadopago/create-preference', async (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.body?.orderId);
  if (!order || order.accessToken !== req.body?.orderToken) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }
  if (order.paymentMethod !== 'mercadopago' || order.status === 'Cancelado') {
    return res.status(409).json({ error: 'Pedido não permite pagamento com Mercado Pago.' });
  }
  if (order.paymentStatus === 'Pago') {
    return res.status(409).json({ error: 'Este pedido já está pago.' });
  }
  if (!mercadoPagoReady()) {
    return res.status(503).json({ error: 'Mercado Pago indisponível. Confirme credenciais, webhook e APP_URL HTTPS.' });
  }
  if (order.paymentDetails?.preferenceId && order.paymentDetails.checkoutUrl) {
    return res.json({ configured: true, preferenceId: order.paymentDetails.preferenceId, initPoint: order.paymentDetails.checkoutUrl });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  try {
    // A volta ao site não confirma o pagamento. Somente o webhook validado pode alterar o status.
    const returnUrl = `${appUrl}/#/pedido/${encodeURIComponent(order.id)}?token=${encodeURIComponent(order.accessToken)}`;
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': crypto.createHash('sha256').update(order.id).digest('hex')
      },
      body: JSON.stringify({
        items: [{ id: order.id, title: `Pedido ${order.id} · Delícia do Nordeste`, quantity: 1,
          currency_id: 'BRL', unit_price: order.total }],
        ...(order.customer.email ? { payer: { name: order.customer.name, email: order.customer.email } } : {}),
        back_urls: { success: `${returnUrl}&mp=success`, failure: `${returnUrl}&mp=failure`, pending: `${returnUrl}&mp=pending` },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/payments/mercadopago/webhook`,
        external_reference: order.id
      })
    });
    if (!response.ok) {
      console.error('Erro ao solicitar preferência MP:', response.status);
      return res.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
    }
    const preference = await response.json();
    const initPoint = db.settings.mercadoPagoSandbox ? preference.sandbox_init_point : preference.init_point;
    if (!preference.id || !initPoint || !/^https:\/\//.test(initPoint)) {
      return res.status(502).json({ error: 'Mercado Pago não retornou um checkout válido.' });
    }
    order.paymentDetails = { ...order.paymentDetails, preferenceId: preference.id, checkoutUrl: initPoint };
    saveDatabase();
    return res.json({ configured: true, preferenceId: preference.id, initPoint });
  } catch (err) {
    console.error('Falha de comunicação Mercado Pago', err);
    return res.status(502).json({ error: 'Não foi possível contatar o Mercado Pago.' });
  }
});

// O webhook só confia em assinatura válida e consulta a API do MP como fonte de verdade.
app.post('/api/payments/mercadopago/webhook', async (req: Request, res: Response) => {
  const dataId = req.query['data.id'];
  if (!verifyMercadoPagoSignature({
    dataId,
    requestId: req.header('x-request-id'),
    signature: req.header('x-signature'),
    secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET
  })) {
    return res.status(process.env.MERCADO_PAGO_WEBHOOK_SECRET ? 401 : 503).json({ error: 'Notificação não autenticada.' });
  }
  if (req.body?.type !== 'payment') return res.status(200).send('Ignorado');
  const paymentId = String(dataId);
  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || ''}` }
    });
    if (!mpRes.ok) return res.status(503).json({ error: 'Falha ao validar pagamento no provedor.' });
    const payment = await mpRes.json();
    const order = db.orders.find(o => o.id === payment.external_reference);
    if (!order || order.paymentMethod !== 'mercadopago' ||
        !amountMatches(payment.transaction_amount, order.total) ||
        payment.currency_id !== 'BRL' || String(payment.id) !== paymentId ||
        payment.live_mode !== !db.settings.mercadoPagoSandbox) {
      console.warn('Webhook ignorado: pagamento não corresponde a um pedido elegível.');
      return res.status(200).send('Pagamento não vinculado');
    }
    const key = `${paymentId}:${payment.status}`;
    if (db.processedWebhooks.includes(key)) return res.status(200).send('Já processado');
    // Não desfazemos a aprovação se chegar uma notificação antiga de pending ou rejected.
    if (order.paymentStatus !== 'Pago' || payment.status === 'refunded' || payment.status === 'charged_back') {
      const status: PaymentStatus | null = payment.status === 'approved' ? 'Pago'
        : payment.status === 'refunded' || payment.status === 'charged_back' ? 'Reembolsado'
        : payment.status === 'rejected' || payment.status === 'cancelled' ? 'Falhou'
        : payment.status === 'pending' || payment.status === 'in_process' ? 'Aguardando pagamento' : null;
      if (status && order.paymentStatus !== status) {
        order.paymentStatus = status;
        order.updatedAt = new Date().toISOString();
        order.paymentDetails = { ...order.paymentDetails, transactionId: paymentId,
          ...(status === 'Pago' ? { paidAt: new Date().toISOString() } : {}) };
        order.statusHistory.push({ status: order.status, timestamp: new Date().toISOString(),
          note: `Mercado Pago: ${status} (transação ${paymentId})` });
      }
    }
    db.processedWebhooks.push(key);
    if (db.processedWebhooks.length > 500) db.processedWebhooks.splice(0, db.processedWebhooks.length - 500);
    saveDatabase();
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Falha ao consultar pagamento Mercado Pago:', err);
    return res.status(503).json({ error: 'Pagamento ainda não validado, reenviar notificação.' });
  }
});

// ----------------------------------------------------
// ADMIN AUTH & MANAGEMENT ROUTES
// ----------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = db.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.active);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  // Generate session token valid for 24 hours
  const token = 'sess_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    expiresAt
  });

  user.lastLogin = new Date().toISOString();
  saveDatabase();

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: !!user.mustChangePassword
    }
  });
});

// Change Password
app.post('/api/admin/change-password', authRequired(), (req: Request, res: Response) => {
  const session = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
  }

  const user = db.adminUsers.find(u => u.id === session.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const currentHash = hashPassword(currentPassword, user.salt);
  if (currentHash !== user.passwordHash) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  user.salt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, user.salt);
  user.mustChangePassword = false;
  saveDatabase();

  res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

// Admin Get Orders
app.get('/api/admin/orders', authRequired(['Dono', 'Gerente', 'Atendente']), (_req: Request, res: Response) => {
  res.json(db.orders);
});

// Admin Update Order Status
app.patch('/api/admin/orders/:id/status', authRequired(['Dono', 'Gerente', 'Atendente']), (req: Request, res: Response) => {
  const { status, note, cancelReason } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  const allowedStatuses: OrderStatus[] = [
    'Recebido', 'Aceito', 'Em preparo', 'Pronto para retirada', 'Saiu para entrega', 'Finalizado', 'Cancelado'
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status de pedido inválido.' });
  }
  if (order.status === 'Finalizado' || order.status === 'Cancelado') {
    return res.status(409).json({ error: 'Pedido encerrado não pode voltar ao atendimento.' });
  }
  if (status === 'Saiu para entrega' && order.type !== 'delivery' ||
      status === 'Pronto para retirada' && order.type !== 'pickup') {
    return res.status(400).json({ error: 'Status incompatível com a forma de atendimento.' });
  }
  if (status === 'Saiu para entrega' && !order.delivery?.driverName?.trim()) {
    return res.status(400).json({ error: 'Atribua um entregador antes de despachar.' });
  }
  if (order.paymentMethod === 'mercadopago' && order.paymentStatus !== 'Pago' &&
      !['Recebido', 'Cancelado'].includes(status)) {
    return res.status(409).json({ error: 'Aguarde a confirmação de pagamento do Mercado Pago.' });
  }
  if (status === 'Saiu para entrega') {
    order.delivery = { ...order.delivery, dispatchedAt: new Date().toISOString() };
  }
  if (status === 'Finalizado' && order.type === 'delivery') {
    order.delivery = { ...order.delivery, deliveredAt: new Date().toISOString() };
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === 'Cancelado' && cancelReason) {
    order.cancelReason = cancelReason;
  }

  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status alterado para ${status} pela equipe.`
  });

  saveDatabase();
  res.json({ success: true, order });
});

// Cadastro de entregador e observações de despacho. Apenas usuários da loja.
app.patch('/api/admin/orders/:id/delivery', authRequired(['Dono', 'Gerente', 'Atendente']), (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.type !== 'delivery' || ['Finalizado', 'Cancelado'].includes(order.status)) {
    return res.status(409).json({ error: 'Este pedido não está disponível para despacho.' });
  }
  const driverName = typeof req.body.driverName === 'string' ? req.body.driverName.trim().slice(0, 80) : '';
  const driverPhone = typeof req.body.driverPhone === 'string' ? req.body.driverPhone.replace(/\D/g, '').slice(0, 13) : '';
  const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 300) : '';
  if (!driverName) return res.status(400).json({ error: 'Nome do entregador é obrigatório.' });
  if (driverPhone && !/^\d{10,13}$/.test(driverPhone)) {
    return res.status(400).json({ error: 'Telefone do entregador inválido.' });
  }
  order.delivery = { ...order.delivery, driverName, driverPhone, note, assignedAt: new Date().toISOString() };
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({ status: order.status, timestamp: order.updatedAt, note: `Entrega atribuída para ${driverName}` });
  saveDatabase();
  res.json({ success: true, order });
});

// Admin Update Order Payment Status
app.patch('/api/admin/orders/:id/payment', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const { paymentStatus } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  if (order.paymentMethod === 'mercadopago') {
    return res.status(403).json({ error: 'Pagamentos Mercado Pago são conferidos automaticamente pelo webhook, não manualmente.' });
  }
  const validManualStatuses = ['Pago', 'Aguardando conferência manual'];
  if (!validManualStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Selecione um status manual válido.' });
  }
  order.paymentStatus = paymentStatus;
  order.updatedAt = new Date().toISOString();
  if (paymentStatus === 'Pago' && !order.paymentDetails?.paidAt) {
    order.paymentDetails = {
      ...order.paymentDetails,
      paidAt: new Date().toISOString()
    };
  }

  saveDatabase();
  res.json({ success: true, order });
});

// Admin Update Store Settings
app.put('/api/admin/settings', authRequired(['Dono']), (req: Request, res: Response) => {
  const updated = req.body;
  if (updated.deliveryZones !== undefined) {
    if (!Array.isArray(updated.deliveryZones) || updated.deliveryZones.length > 30 ||
        updated.deliveryZones.some((z: any) => !/^\d{2,8}$/.test(String(z.cepPrefix || '')) ||
          !Number.isFinite(z.fee) || z.fee < 0 ||
          !Number.isInteger(z.estimatedMinutes) || z.estimatedMinutes < 1)) {
      return res.status(400).json({ error: 'Confira os CEPs, taxas e prazos das áreas de entrega.' });
    }
  }
  const { mercadoPagoReady, mercadoPagoWebhookUrl, mercadoPagoAccessTokenConfigured, ...safeSettings } = updated;
  db.settings = { ...db.settings, ...safeSettings };
  saveDatabase();
  res.json({ success: true, settings: db.settings });
});

// Admin Quick Pause Orders Toggle
app.post('/api/admin/settings/pause-orders', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const { paused, reason } = req.body;
  db.settings.isOrdersPaused = Boolean(paused);
  db.settings.pauseReason = reason || '';
  saveDatabase();
  res.json({ success: true, isOrdersPaused: db.settings.isOrdersPaused, pauseReason: db.settings.pauseReason });
});

// Admin Menu CRUD
app.get('/api/admin/menu', authRequired(['Dono', 'Gerente', 'Atendente']), (_req: Request, res: Response) => {
  res.json(db.menuItems);
});

app.post('/api/admin/menu', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const { name, categoryId, description, price, imageUrl, optionGroups, status, badge, tags, estimatedMinutes } = req.body;

  if (!name || !categoryId || price === undefined) {
    return res.status(400).json({ error: 'Nome, categoria e preço base são obrigatórios.' });
  }

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + crypto.randomBytes(2).toString('hex');

  const newItem: MenuItem = {
    id: 'item-' + crypto.randomBytes(4).toString('hex'),
    name: name.trim(),
    slug,
    categoryId,
    description: description || '',
    price: parseFloat(price),
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    isExampleDemo: false,
    status: status || 'disponivel',
    badge,
    tags: tags || [],
    estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 30,
    order: db.menuItems.length + 1,
    optionGroups: optionGroups || []
  };

  db.menuItems.push(newItem);
  saveDatabase();
  res.status(201).json(newItem);
});

app.put('/api/admin/menu/:id', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const index = db.menuItems.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  db.menuItems[index] = {
    ...db.menuItems[index],
    ...req.body,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : db.menuItems[index].price,
    promotionalPrice: req.body.promotionalPrice !== undefined && req.body.promotionalPrice !== '' ? parseFloat(req.body.promotionalPrice) : undefined
  };

  saveDatabase();
  res.json(db.menuItems[index]);
});

app.delete('/api/admin/menu/:id', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const index = db.menuItems.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }

  db.menuItems.splice(index, 1);
  saveDatabase();
  res.json({ success: true });
});

// Admin Quick Stock Toggle
app.post('/api/admin/menu/:id/status', authRequired(['Dono', 'Gerente', 'Atendente']), (req: Request, res: Response) => {
  const item = db.menuItems.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item não encontrado.' });
  }
  item.status = req.body.status;
  saveDatabase();
  res.json({ success: true, item });
});

// Admin Categories CRUD
app.post('/api/admin/categories', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

  const newCat: Category = {
    id: 'cat-' + crypto.randomBytes(3).toString('hex'),
    name: name.trim(),
    slug,
    description: description || '',
    order: db.categories.length + 1,
    active: true
  };

  db.categories.push(newCat);
  saveDatabase();
  res.status(201).json(newCat);
});

// Admin Coupons CRUD
app.get('/api/admin/coupons', authRequired(['Dono', 'Gerente']), (_req: Request, res: Response) => {
  res.json(db.coupons);
});

app.post('/api/admin/coupons', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const { code, description, type, value, minValue, maxDiscount, maxUses, validUntil } = req.body;
  if (!code || value === undefined) {
    return res.status(400).json({ error: 'Código e valor do desconto são obrigatórios.' });
  }

  const newCoupon: Coupon = {
    id: 'coup-' + crypto.randomBytes(3).toString('hex'),
    code: code.toUpperCase().trim(),
    description: description || '',
    type: type || 'percentage',
    value: parseFloat(value),
    minValue: minValue ? parseFloat(minValue) : undefined,
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
    maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
    currentUses: 0,
    validFrom: new Date().toISOString(),
    validUntil: validUntil || '2026-12-31',
    active: true
  };

  db.coupons.push(newCoupon);
  saveDatabase();
  res.status(201).json(newCoupon);
});

app.delete('/api/admin/coupons/:id', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  db.coupons = db.coupons.filter(c => c.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// Admin Reviews Moderation
app.get('/api/admin/reviews', authRequired(['Dono', 'Gerente']), (_req: Request, res: Response) => {
  res.json(db.reviews);
});

app.patch('/api/admin/reviews/:id', authRequired(['Dono', 'Gerente']), (req: Request, res: Response) => {
  const review = db.reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Avaliação não encontrada.' });

  if (req.body.status) review.status = req.body.status;
  if (req.body.reply !== undefined) review.reply = req.body.reply;

  saveDatabase();
  res.json({ success: true, review });
});

// Admin Reports (Sales, averages, top items)
app.get('/api/admin/reports', authRequired(['Dono', 'Gerente']), (_req: Request, res: Response) => {
  const validOrders = db.orders.filter(o => o.status !== 'Cancelado');

  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Pago' ? o.total : 0), 0);
  const totalOrders = validOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Items sold frequency
  const itemMap: { [name: string]: { count: number; revenue: number } } = {};
  for (const o of validOrders) {
    for (const it of o.items) {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { count: 0, revenue: 0 };
      }
      itemMap[it.name].count += it.quantity;
      itemMap[it.name].revenue += it.totalItemPrice;
    }
  }

  const topItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status breakdown
  const statusCounts: { [status: string]: number } = {};
  for (const o of db.orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    averageTicket: Math.round(averageTicket * 100) / 100,
    topItems,
    statusCounts
  });
});

// CSV Export
app.get('/api/admin/reports/csv', authRequired(['Dono', 'Gerente']), (_req: Request, res: Response) => {
  const rows = [
    ['ID do Pedido', 'Data', 'Cliente', 'Telefone', 'Tipo', 'Status', 'Pagamento', 'Subtotal', 'Taxa Entrega', 'Desconto', 'Total']
  ];

  for (const o of db.orders) {
    rows.push([
      o.id,
      new Date(o.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      `"${o.customer.name.replace(/"/g, '""')}"`,
      o.customer.phone,
      o.type === 'delivery' ? 'Entrega' : 'Retirada',
      o.status,
      o.paymentStatus,
      o.subtotal.toFixed(2),
      o.deliveryFee.toFixed(2),
      o.discount.toFixed(2),
      o.total.toFixed(2)
    ]);
  }

  const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="pedidos-delicia-do-nordeste.csv"');
  res.send(csvContent);
});

// Admin Users Management (Dono only)
app.get('/api/admin/users', authRequired(['Dono']), (_req: Request, res: Response) => {
  const usersSafe = db.adminUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    mustChangePassword: !!u.mustChangePassword,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));
  res.json(usersSafe);
});

app.post('/api/admin/users', authRequired(['Dono']), (req: Request, res: Response) => {
  const { name, email, role, tempPassword } = req.body;
  if (!name || !email || !role || !tempPassword) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  if (db.adminUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Já existe um usuário com este e-mail.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(tempPassword, salt);

  const newUser = {
    id: 'user-' + crypto.randomBytes(3).toString('hex'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    active: true,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
    passwordHash,
    salt
  };

  db.adminUsers.push(newUser);
  saveDatabase();

  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    active: newUser.active
  });
});

// Backup Export & Restore (Dono only)
app.get('/api/admin/backup', authRequired(['Dono']), (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="backup-delicia-do-nordeste.json"');
  res.json(db);
});

// ----------------------------------------------------
// FRONTEND INTEGRATION: VITE MIDDLEWARE OR STATIC FILES
// ----------------------------------------------------
async function setupViteOrStatic() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DELICIA DO NORDESTE] Servidor rodando em http://localhost:${PORT}`);
  });
}

setupViteOrStatic();
