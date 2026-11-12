import { 
  StoreSettings, 
  Category, 
  MenuItem, 
  Order, 
  Coupon, 
  Review, 
  AdminUser 
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nordeste_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Public
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações da loja');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Falha ao carregar categorias');
    return res.json();
  },

  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error('Falha ao carregar cardápio');
    return res.json();
  },

  async getMenuItem(slug: string): Promise<MenuItem> {
    const res = await fetch(`${API_BASE}/menu/${slug}`);
    if (!res.ok) throw new Error('Prato não encontrado');
    return res.json();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; code: string; discountAmount: number; description: string }> {
    const res = await fetch(`${API_BASE}/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Cupom inválido');
    return data;
  },

  async calculateOrder(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/orders/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao calcular pedido');
    return data;
  },

  async createOrder(payload: any): Promise<{ success: boolean; orderId: string; accessToken: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido');
    return data;
  },

  async getOrder(id: string, token: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}?token=${encodeURIComponent(token)}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao consultar pedido');
    return data;
  },

  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) return [];
    return res.json();
  },

  async submitReview(payload: { customerName: string; rating: number; comment: string; orderId?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar avaliação');
    return data;
  },

  async lookupCep(cep: string): Promise<any> {
    const res = await fetch(`${API_BASE}/viacep/${cep}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'CEP não encontrado');
    return data;
  },

  async getQrCode(text: string): Promise<string> {
    const res = await fetch(`${API_BASE}/qrcode?text=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar QR Code');
    return data.dataUrl;
  },

  async createMercadoPagoPreference(orderId: string, orderToken: string): Promise<any> {
    const res = await fetch(`${API_BASE}/payments/mercadopago/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, orderToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Falha ao iniciar Mercado Pago');
    return data;
  },

  // Admin
  async adminLogin(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao autenticar');
    return data;
  },

  async adminChangePassword(currentPassword: string, newPassword: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha');
    return data;
  },

  async adminGetOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Não autorizado');
    return res.json();
  },

  async adminUpdateOrderStatus(orderId: string, status: string, note?: string, cancelReason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note, cancelReason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar status');
    return data;
  },

  async adminUpdateOrderPayment(orderId: string, paymentStatus: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pagamento');
    return data;
  },

  async adminUpdateSettings(settings: Partial<StoreSettings>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações');
    return data;
  },

  async adminPauseOrders(paused: boolean, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/settings/pause-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paused, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao pausar pedidos');
    return data;
  },

  async adminGetMenu(): Promise<MenuItem[]> {
    const res = await fetch(`${API_BASE}/admin/menu`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async adminCreateMenuItem(item: any): Promise<MenuItem> {
    const res = await fetch(`${API_BASE}/admin/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar item');
    return data;
  },

  async adminUpdateMenuItem(id: string, item: any): Promise<MenuItem> {
    const res = await fetch(`${API_BASE}/admin/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar item');
    return data;
  },

  async adminDeleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erro ao excluir item');
  },

  async adminSetItemStatus(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/menu/${id}/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async adminCreateCategory(cat: any): Promise<Category> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async adminGetCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async adminCreateCoupon(coupon: any): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(coupon)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar cupom');
    return data;
  },

  async adminDeleteCoupon(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erro ao excluir cupom');
  },

  async adminGetReviews(): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/admin/reviews`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async adminUpdateReview(id: string, update: { status?: string; reply?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(update)
    });
    return res.json();
  },

  async adminGetReports(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async adminGetUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async adminCreateUser(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário');
    return data;
  }
};
