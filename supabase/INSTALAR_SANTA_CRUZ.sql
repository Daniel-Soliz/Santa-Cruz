-- Santa Cruz: banco próprio para administração do restaurante.
-- Execute SOMENTE no projeto Supabase que você escolher para Santa Cruz.
-- Não utilize o projeto StudioBlack7 para os dados do restaurante.
-- A criação do administrador é MANUAL (instruções no README).

create table if not exists public.sc_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 criado_em timestamptz not null default now()
);
create table if not exists public.sc_configuracao (
 id text primary key default 'principal' check(id='principal'),
 catalogo_publicado boolean not null default false,
 pedidos_ativos boolean not null default true,
 taxa_entrega numeric(10,2) check(taxa_entrega is null or taxa_entrega>=0),
 pedido_minimo numeric(10,2) check(pedido_minimo is null or pedido_minimo>=0),
 bairros_atendidos text[] not null default '{}',
 atualizado_em timestamptz not null default now()
);
insert into public.sc_configuracao(id) values ('principal') on conflict(id) do nothing;

create table if not exists public.sc_produtos (
 id text primary key,
 dados jsonb not null check(jsonb_typeof(dados)='object'),
 publicado boolean not null default false,
 ordem integer not null default 0,
 atualizado_em timestamptz not null default now()
);
create table if not exists public.sc_pedidos (
 id uuid primary key default gen_random_uuid(),
 codigo text not null unique,
 cliente_nome text not null check(length(trim(cliente_nome))>=2),
 telefone text,
 modalidade text not null check(modalidade in ('entrega','retirada','local')),
 total_centavos integer not null check(total_centavos>=0),
 status text not null default 'recebido'
  check(status in ('recebido','em_preparo','pronto','saiu_entrega','entregue','cancelado')),
 itens jsonb not null default '[]'::jsonb check(jsonb_typeof(itens)='array'),
 observacoes text,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
create index if not exists sc_pedidos_criado_em_idx on public.sc_pedidos(criado_em desc);

alter table public.sc_admins enable row level security;
alter table public.sc_configuracao enable row level security;
alter table public.sc_produtos enable row level security;
alter table public.sc_pedidos enable row level security;

-- Somente o administrador reconhecido (auth.uid) vê sua própria associação.
drop policy if exists "sc_ver_proprio_admin" on public.sc_admins;
create policy "sc_ver_proprio_admin" on public.sc_admins
for select to authenticated using (user_id=(select auth.uid()));

-- Informações públicas da loja: sem dados pessoais ou segredos.
drop policy if exists "sc_configuracao_publica" on public.sc_configuracao;
create policy "sc_configuracao_publica" on public.sc_configuracao
for select to anon,authenticated using (true);
drop policy if exists "sc_configuracao_admin_update" on public.sc_configuracao;
create policy "sc_configuracao_admin_update" on public.sc_configuracao
for update to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
) with check (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);

-- Um item só aparece publicamente quando catálogo e item estão publicados.
drop policy if exists "sc_produtos_publicos" on public.sc_produtos;
create policy "sc_produtos_publicos" on public.sc_produtos
for select to anon,authenticated using (
 publicado = true and exists (
 select 1 from public.sc_configuracao s
 where s.id='principal' and s.catalogo_publicado=true
 )
);
drop policy if exists "sc_produtos_admin_select" on public.sc_produtos;
create policy "sc_produtos_admin_select" on public.sc_produtos
for select to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_produtos_admin_insert" on public.sc_produtos;
create policy "sc_produtos_admin_insert" on public.sc_produtos
for insert to authenticated with check (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_produtos_admin_update" on public.sc_produtos;
create policy "sc_produtos_admin_update" on public.sc_produtos
for update to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
) with check (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_produtos_admin_delete" on public.sc_produtos;
create policy "sc_produtos_admin_delete" on public.sc_produtos
for delete to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);

-- Pedidos são privados: apenas administradores. Nenhum cliente tem acesso.
drop policy if exists "sc_pedidos_admin_select" on public.sc_pedidos;
create policy "sc_pedidos_admin_select" on public.sc_pedidos
for select to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_pedidos_admin_insert" on public.sc_pedidos;
create policy "sc_pedidos_admin_insert" on public.sc_pedidos
for insert to authenticated with check (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);
drop policy if exists "sc_pedidos_admin_update" on public.sc_pedidos;
create policy "sc_pedidos_admin_update" on public.sc_pedidos
for update to authenticated using (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
) with check (
 exists(select 1 from public.sc_admins a where a.user_id=(select auth.uid()))
);

revoke all on public.sc_admins,public.sc_produtos,public.sc_configuracao,public.sc_pedidos from anon,authenticated;
grant select on public.sc_configuracao,public.sc_produtos to anon;
grant select on public.sc_admins,public.sc_configuracao,public.sc_produtos,public.sc_pedidos to authenticated;
grant update on public.sc_configuracao to authenticated;
grant insert,update,delete on public.sc_produtos to authenticated;
grant insert,update on public.sc_pedidos to authenticated;

-- Atualizações em tempo real no painel quando a publicação existir.
do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sc_pedidos') then
  alter publication supabase_realtime add table public.sc_pedidos;
 end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='sc_produtos') then
  alter publication supabase_realtime add table public.sc_produtos;
 end if;
end $$;
