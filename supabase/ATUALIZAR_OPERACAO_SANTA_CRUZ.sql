-- Etapa 2 do restaurante Santa Cruz. Execute DEPOIS de INSTALAR_SANTA_CRUZ.sql
-- no projeto Supabase EXCLUSIVO do restaurante. Pode executar novamente.
-- Cria fotos públicas sem autorização de escrita para clientes, financeiro
-- protegido, estados de pagamento e pedidos originados pelo site.

alter table public.sc_configuracao
 add column if not exists formas_pagamento jsonb not null
 default '{"pix":true,"cartao":true,"dinheiro":true}'::jsonb;

alter table public.sc_pedidos
 add column if not exists origem text not null default 'manual';
alter table public.sc_pedidos
 add column if not exists forma_pagamento text;
alter table public.sc_pedidos
 add column if not exists pagamento_status text not null default 'pendente';
alter table public.sc_pedidos
 add column if not exists subtotal_centavos integer;
alter table public.sc_pedidos
 add column if not exists taxa_entrega_centavos integer;
alter table public.sc_pedidos
 add column if not exists endereco jsonb;
alter table public.sc_pedidos
 add column if not exists ip_hash text;
alter table public.sc_pedidos
 drop constraint if exists sc_pedidos_status_check;
alter table public.sc_pedidos
 add constraint sc_pedidos_status_check check (status in
 ('aguardando_confirmacao','recebido','em_preparo','pronto','saiu_entrega','entregue','cancelado'));
alter table public.sc_pedidos
 drop constraint if exists sc_pedidos_origem_check;
alter table public.sc_pedidos
 add constraint sc_pedidos_origem_check check (origem in ('manual','site','whatsapp'));
alter table public.sc_pedidos
 drop constraint if exists sc_pedidos_pagamento_status_check;
alter table public.sc_pedidos
 add constraint sc_pedidos_pagamento_status_check check (pagamento_status in ('pendente','pago','estornado'));
alter table public.sc_pedidos
 drop constraint if exists sc_pedidos_forma_pagamento_check;
alter table public.sc_pedidos
 add constraint sc_pedidos_forma_pagamento_check check
 (forma_pagamento is null or forma_pagamento in ('pix','cartao','dinheiro','outro'));
create index if not exists sc_pedidos_ip_hash_idx on public.sc_pedidos(ip_hash,criado_em desc);

create table if not exists public.sc_movimentos_caixa (
 id uuid primary key default gen_random_uuid(),
 tipo text not null check(tipo in ('entrada','saida')),
 descricao text not null check(length(trim(descricao)) between 3 and 180),
 valor_centavos integer not null check(valor_centavos>0),
 forma_pagamento text not null check(forma_pagamento in ('pix','cartao','dinheiro','outro')),
 criado_em timestamptz not null default now(),
 registrado_por uuid references auth.users(id) default auth.uid()
);
create index if not exists sc_movimentos_caixa_criado_idx on public.sc_movimentos_caixa(criado_em desc);
alter table public.sc_movimentos_caixa enable row level security;
drop policy if exists "sc_caixa_admin_select" on public.sc_movimentos_caixa;
create policy "sc_caixa_admin_select" on public.sc_movimentos_caixa
for select to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid())));
drop policy if exists "sc_caixa_admin_insert" on public.sc_movimentos_caixa;
create policy "sc_caixa_admin_insert" on public.sc_movimentos_caixa
for insert to authenticated with check (
 (registrado_por=(select auth.uid())) and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid())));
revoke all on public.sc_movimentos_caixa from anon,authenticated;
grant select,insert on public.sc_movimentos_caixa to authenticated;

-- Bucket de fotos: imagens ficam públicas porque precisam aparecer na loja,
-- mas SOMENTE administradores autenticados podem enviar ou apagar.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('sc-fotos-cardapio','sc-fotos-cardapio',true,2097152,array['image/webp'])
on conflict (id) do update set
 public=excluded.public,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "sc_fotos_admin_escrever" on storage.objects;
create policy "sc_fotos_admin_escrever" on storage.objects
for insert to authenticated with check (
 bucket_id='sc-fotos-cardapio' and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_fotos_admin_alterar" on storage.objects;
create policy "sc_fotos_admin_alterar" on storage.objects
for update to authenticated using (
 bucket_id='sc-fotos-cardapio' and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
) with check (
 bucket_id='sc-fotos-cardapio' and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_fotos_admin_excluir" on storage.objects;
create policy "sc_fotos_admin_excluir" on storage.objects
for delete to authenticated using (
 bucket_id='sc-fotos-cardapio' and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_fotos_admin_ler" on storage.objects;
create policy "sc_fotos_admin_ler" on storage.objects
for select to authenticated using (
 bucket_id='sc-fotos-cardapio' and
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
-- O bucket público fornece GET apenas para imagens conhecidas, sem exposição
-- de dados pessoais. Não armazene documentos ou fotos de clientes neste bucket.

do $$
begin
 if not exists(select 1 from pg_publication_tables
 where pubname='supabase_realtime' and schemaname='public' and tablename='sc_movimentos_caixa') then
  alter publication supabase_realtime add table public.sc_movimentos_caixa;
 end if;
end $$;

-- Os pedidos externos entram apenas pela Edge Function criar-pedido.
-- NUNCA habilite insert de pedidos para a role anon.
