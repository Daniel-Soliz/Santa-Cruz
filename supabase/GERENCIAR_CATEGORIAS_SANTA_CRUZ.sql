-- Delícia do Nordeste · Santa Cruz
-- Execute após INSTALAR_SANTA_CRUZ.sql e ATUALIZAR_OPERACAO_SANTA_CRUZ.sql.
-- Cria categorias próprias, separadas dos dados fictícios do catálogo antigo.
-- Não há categorias ou produtos reais criados automaticamente.

create table if not exists public.sc_categorias (
 id text primary key check(length(id) between 4 and 90),
 nome text not null check(length(trim(nome)) between 2 and 90),
 ordem integer not null default 0 check(ordem >= 0),
 ativa boolean not null default true,
 atualizado_em timestamptz not null default now()
);

create index if not exists sc_categorias_ordem_idx on public.sc_categorias(ordem,nome);
alter table public.sc_categorias enable row level security;

drop policy if exists "sc_categorias_publicas" on public.sc_categorias;
create policy "sc_categorias_publicas" on public.sc_categorias
 for select to anon, authenticated
 using (
   ativa = true and exists (
    select 1 from public.sc_configuracao c
    where c.id = 'principal' and c.catalogo_publicado = true
   )
 );

drop policy if exists "sc_categorias_admin_select" on public.sc_categorias;
create policy "sc_categorias_admin_select" on public.sc_categorias
 for select to authenticated
 using (exists (
  select 1 from public.sc_admins a where a.user_id = (select auth.uid())
 ));

drop policy if exists "sc_categorias_admin_insert" on public.sc_categorias;
create policy "sc_categorias_admin_insert" on public.sc_categorias
 for insert to authenticated
 with check (exists (
  select 1 from public.sc_admins a where a.user_id = (select auth.uid())
 ));

drop policy if exists "sc_categorias_admin_update" on public.sc_categorias;
create policy "sc_categorias_admin_update" on public.sc_categorias
 for update to authenticated
 using (exists (
  select 1 from public.sc_admins a where a.user_id = (select auth.uid())
 ))
 with check (exists (
  select 1 from public.sc_admins a where a.user_id = (select auth.uid())
 ));

drop policy if exists "sc_categorias_admin_delete" on public.sc_categorias;
create policy "sc_categorias_admin_delete" on public.sc_categorias
 for delete to authenticated
 using (exists (
  select 1 from public.sc_admins a where a.user_id = (select auth.uid())
 ));

revoke all on public.sc_categorias from anon, authenticated;
grant select on public.sc_categorias to anon;
grant select,insert,update,delete on public.sc_categorias to authenticated;

-- Impede perder a categoria de um prato já cadastrado, inclusive em rascunho.
-- SECURITY INVOKER mantém a RLS do usuário que está editando.
create or replace function public.sc_proteger_categoria()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
 if exists (
  select 1 from public.sc_produtos p where p.dados ->> 'categoriaId' = old.id
 ) then
  raise exception 'Antes de excluir esta categoria, mova ou exclua os pratos vinculados.';
 end if;
 return old;
end;
$$;

drop trigger if exists sc_proteger_categoria_delete on public.sc_categorias;
create trigger sc_proteger_categoria_delete
 before delete on public.sc_categorias
 for each row execute function public.sc_proteger_categoria();

-- Cada produto novo ou publicado precisa pertencer a uma categoria existente.
-- Produtos fictícios legados podem continuar em rascunho para migração manual.
create or replace function public.sc_validar_categoria_produto()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
 if new.publicado = true and not exists (
  select 1 from public.sc_categorias c
  where c.id = new.dados ->> 'categoriaId' and c.ativa = true
 ) then
  raise exception 'O produto precisa pertencer a uma categoria ativa.';
 end if;
 return new;
end;
$$;

drop trigger if exists sc_validar_categoria_produto_save on public.sc_produtos;
create trigger sc_validar_categoria_produto_save
 before insert or update on public.sc_produtos
 for each row execute function public.sc_validar_categoria_produto();

do $$
begin
 if not exists (
  select 1 from pg_publication_tables
  where pubname = 'supabase_realtime' and schemaname = 'public'
    and tablename = 'sc_categorias'
 ) then
  alter publication supabase_realtime add table public.sc_categorias;
 end if;
end $$;
