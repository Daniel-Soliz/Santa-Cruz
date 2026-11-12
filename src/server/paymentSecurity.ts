import crypto from 'node:crypto';

/** Verifica x-signature do Mercado Pago. data.id deve ser o valor original da query.
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications
 */
export function verifyMercadoPagoSignature(args: {
  dataId: unknown;
  requestId: string | undefined;
  signature: string | undefined;
  secret: string | undefined;
  now?: number;
}): boolean {
  const { dataId, requestId, signature, secret, now = Date.now() } = args;
  if (typeof dataId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(dataId) ||
      !requestId || !signature || !secret) return false;
  const params = Object.fromEntries(signature.split(',').map(part => {
    const [key, value] = part.trim().split('=');
    return [key, value];
  }));
  if (!params.ts || !/^\d{10,14}$/.test(params.ts) || !/^[a-f0-9]{64}$/i.test(params.v1 || '')) return false;
  const epoch = Number(params.ts);
  const timestamp = params.ts.length >= 13 ? epoch : epoch * 1000;
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60 * 1000) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${params.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const candidate = Buffer.from(params.v1, 'hex');
  return candidate.length === 32 && crypto.timingSafeEqual(Buffer.from(expected, 'hex'), candidate);
}

export function amountMatches(amount: unknown, expected: number): boolean {
  return typeof amount === 'number' && Number.isFinite(amount) &&
    Number.isFinite(expected) && Math.round(amount * 100) === Math.round(expected * 100);
}
