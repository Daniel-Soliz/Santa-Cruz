begin;

alter table public.sc_pedidos add column if not exists chave_rastreio_hash text;
create unique index if not exists sc_pedidos_chave_rastreio_idx
 on public.sc_pedidos (chave_rastreio_hash) where chave_rastreio_hash is not null;

create schema if not exists sc_privado;
revoke all on schema sc_privado from public;
grant usage on schema sc_privado to anon, authenticated;

create or replace function sc_privado.acompanhar_pedido(p_codigo text, p_chave text)
returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('status', status, 'modalidade', modalidade,
  'pagamento_status', pagamento_status)
 from public.sc_pedidos
 where p_codigo ~ '^SC-[0-9]{8}-[A-Z0-9]{4,8}$'
  and p_chave ~ '^[0-9a-f]{32}$'
  and codigo = p_codigo
  and chave_rastreio_hash = encode(sha256(convert_to(p_chave, 'UTF8')), 'hex');
$$;

create or replace function public.sc_acompanhar_pedido(p_codigo text, p_chave text)
returns jsonb language sql stable security invoker set search_path = '' as $$
 select sc_privado.acompanhar_pedido(p_codigo, p_chave);
$$;

revoke all on function sc_privado.acompanhar_pedido(text,text),
 public.sc_acompanhar_pedido(text,text) from public, anon, authenticated;
grant execute on function sc_privado.acompanhar_pedido(text,text),
 public.sc_acompanhar_pedido(text,text) to anon, authenticated;

commit;
