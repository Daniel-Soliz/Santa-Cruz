import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';

const dataDir = mkdtempSync(path.join(tmpdir(), 'santa-cruz-smoke-'));
const port = await new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const chosen = server.address().port;
    server.close(() => resolve(chosen));
  });
});
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    DATA_DIR: dataDir,
    ADMIN_EMAIL: 'admin@restaurante.teste',
    ADMIN_PASSWORD: 'SenhaExclusivaTeste2026!',
    ALLOW_DEMO_ORDERS: 'true'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
let output = '';
child.stdout.on('data', chunk => { output += String(chunk); });
child.stderr.on('data', chunk => { output += String(chunk); });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const send = async (url, options = {}, expectedStatus = 200) => {
  const response = await fetch(base + url, options);
  assert.equal(response.status, expectedStatus, `${url}: resposta ${response.status}, esperado ${expectedStatus}`);
  const raw = await response.text();
  try { return JSON.parse(raw); } catch { return raw; }
};
const post = (url, data, expectedStatus = 200, token) => send(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  body: JSON.stringify(data)
}, expectedStatus);

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Servidor encerrou durante a inicialização.');
    try {
      const health = await send('/api/health');
      if (health.ok) { ready = true; break; }
    } catch {}
    await sleep(300);
  }
  assert.ok(ready, 'Servidor não ficou pronto.');
  const page = await send('/');
  assert.match(page, /<div id="root"(?:\s|>)/, 'Elemento principal do React não encontrado.');
  const logo = await fetch(base + '/assets/aistudio/logo_casa_do_norte_108ee79c.jpg');
  assert.equal(logo.status, 200, 'Logo não encontrada no build.');

  const settings = await send('/api/settings');
  assert.equal(settings.deliveryEnabled, false);
  assert.equal(settings.pixEnabled, false);
  assert.equal(settings.mercadoPagoReady, false);
  const login = await post('/api/admin/login', { email: 'admin@restaurante.teste', password: 'SenhaExclusivaTeste2026!' });
  assert.ok(login.token);
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` };
  await send('/api/admin/settings', { method: 'PUT', headers: authHeaders,
    body: JSON.stringify({ deliveryEnabled: true, deliveryZones: [
      { id:'test-zone', name:'Parque Belém e Entorno', cepPrefix:'02850', fee:6, estimatedMinutes:30, active:true }
    ] })
  });
  const menu = await send('/api/menu');
  assert.ok(menu.length > 0, 'Cardápio vazio.');
  const item = menu.find(x => x.status === 'disponivel' && (!x.optionGroups || x.optionGroups.length === 0) && x.price >= settings.minOrderValue);
  assert.ok(item, 'Nenhum produto sem adicional obrigatório disponível para o teste.');
  const payload = {
    items: [{ menuItemId: item.id, quantity: 1, selectedOptions: [] }],
    deliveryType: 'pickup',
    customer: { name: 'Cliente Teste', phone: '11999999999' },
    paymentMethod: 'dinheiro'
  };
  await post('/api/orders/calculate', { ...payload, items: [{...payload.items[0], quantity: -1}] }, 400);
  await post('/api/delivery/quote', { cep: '99999-999', subtotal: 42 }, 400);
  const quote = await post('/api/delivery/quote', { cep: '02850-100', subtotal: 42 });
  assert.equal(quote.zone, 'Parque Belém e Entorno');
  assert.equal(quote.fee, 6);
  await post('/api/orders/calculate', { ...payload, deliveryType: 'delivery',
    address: { cep: '99999-999', street: 'Rua teste', number: '10', neighborhood: 'Fora' } }, 400);
  await post('/api/orders', { ...payload, paymentMethod: 'mercadopago' }, 400);
  const calculation = await post('/api/orders/calculate', payload);
  assert.ok(calculation.total > 0 && Number.isFinite(calculation.total));
  const requestId = 'a83b3847-d85d-401c-b327-b91902da610f';
  const created = await post('/api/orders', {...payload, requestId}, 201);
  const retry = await post('/api/orders', {...payload, requestId});
  assert.equal(retry.orderId, created.orderId, 'Reenvio deve recuperar o mesmo pedido');
  assert.ok(created.orderId && created.accessToken);
  const id = encodeURIComponent(created.orderId);
  const token = encodeURIComponent(created.accessToken);
  await send(`/api/orders/${id}`, {}, 403);
  const tracking = await send(`/api/orders/${id}?token=${token}`);
  assert.equal(tracking.status, 'Recebido');

  const orders = await send('/api/admin/orders', { headers: authHeaders });
  assert.equal(orders[0].id, created.orderId);
  await send(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Em preparo' })
  });
  const updated = await send(`/api/orders/${id}?token=${token}`);
  assert.equal(updated.status, 'Em preparo');

  const deliveryOrder = await post('/api/orders', { ...payload, deliveryType: 'delivery',
    address: { cep: '02850-100', street: 'Rua de teste', number: '10', neighborhood: 'Parque Belém',
      city: 'São Paulo', state: 'SP' } }, 201);
  assert.equal(deliveryOrder.order.deliveryFee, 6);
  await send(`/api/admin/orders/${deliveryOrder.orderId}/status`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ status: 'Saiu para entrega' })
  }, 400);
  const assigned = await send(`/api/admin/orders/${deliveryOrder.orderId}/delivery`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ driverName: 'Entregador de teste', driverPhone: '11999999999', note: 'Retirar no balcão' })
  });
  assert.equal(assigned.order.delivery.driverName, 'Entregador de teste');
  await send(`/api/admin/orders/${deliveryOrder.orderId}/status`, {
    method: 'PATCH', headers: authHeaders,
    body: JSON.stringify({ status: 'Saiu para entrega' })
  });
  const dispatched = await send(`/api/orders/${deliveryOrder.orderId}?token=${deliveryOrder.accessToken}`);
  assert.equal(dispatched.status, 'Saiu para entrega');
  console.log('Teste aprovado: pedidos, segurança, CEP, entregas, atribuição do motoboy e atualização de status.');
} catch (error) {
  console.error(output.slice(-3500));
  throw error;
} finally {
  child.kill('SIGTERM');
  rmSync(dataDir, { recursive: true, force: true });
}
