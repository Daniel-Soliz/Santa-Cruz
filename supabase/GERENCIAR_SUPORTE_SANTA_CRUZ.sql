begin;

alter table public.sc_configuracao
 add column if not exists chat_suporte_ativo boolean not null default false;

create schema if not exists sc_privado;
revoke all on schema sc_privado from public;
grant usage on schema sc_privado to anon, authenticated;

create table if not exists public.sc_suporte_conversas (
 id uuid primary key default gen_random_uuid(),
 chave_hash bytea unique not null,
 nome text not null check (char_length(nome) between 1 and 60),
 pendente boolean not null default true,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
create index if not exists sc_suporte_conversas_fila on public.sc_suporte_conversas (pendente desc, atualizado_em desc);
create index if not exists sc_suporte_conversas_criacao on public.sc_suporte_conversas (criado_em);

create table if not exists public.sc_suporte_mensagens (
 id uuid primary key,
 conversa_id uuid not null references public.sc_suporte_conversas(id) on delete cascade,
 ordem bigint generated always as identity,
 autor text not null check (autor in ('cliente','equipe')),
 texto text not null check (char_length(texto) between 1 and 1500),
 criado_em timestamptz not null default now()
);
create index if not exists sc_suporte_mensagens_ordem on public.sc_suporte_mensagens (conversa_id, ordem);

alter table public.sc_suporte_conversas enable row level security;
alter table public.sc_suporte_mensagens enable row level security;
revoke all on public.sc_suporte_conversas, public.sc_suporte_mensagens from public, anon, authenticated;
grant select (id, nome, pendente, atualizado_em) on public.sc_suporte_conversas to authenticated;
grant select on public.sc_suporte_mensagens to authenticated;

drop policy if exists sc_suporte_conversas_admin on public.sc_suporte_conversas;
create policy sc_suporte_conversas_admin on public.sc_suporte_conversas for select to authenticated
 using ((select exists(select 1 from public.sc_admins where user_id = auth.uid())));
drop policy if exists sc_suporte_mensagens_admin on public.sc_suporte_mensagens;
create policy sc_suporte_mensagens_admin on public.sc_suporte_mensagens for select to authenticated
 using ((select exists(select 1 from public.sc_admins where user_id = auth.uid())));

-- A chave aleatória identifica uma única conversa. A loja guarda a chave no
-- navegador e o banco guarda apenas seu hash. Nenhuma tabela é exposta ao visitante.
create or replace function sc_privado.suporte_cliente(p_chave text, p_id uuid, p_texto text, p_nome text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_hash bytea;
 v_conversa uuid;
 v_texto text := btrim(p_texto);
 v_nome text := btrim(p_nome);
begin
 if p_chave is null or p_chave !~ '^[0-9a-f]{64}$' then
  raise exception 'Conversa inválida.';
 end if;

 if p_texto is not null then
  if not exists(select 1 from public.sc_configuracao where id = 'principal' and chat_suporte_ativo) then
   raise exception 'O chat está indisponível no momento.';
  end if;
  if p_id is null or char_length(v_texto) not between 1 and 1500 or v_texto !~ '[^[:space:]]' then
   raise exception 'Escreva uma mensagem de até 1.500 caracteres.';
  end if;
 end if;

 v_hash := sha256(convert_to(p_chave, 'UTF8'));
 if p_texto is null then
  select id into v_conversa from public.sc_suporte_conversas where chave_hash = v_hash;
 else
  select id into v_conversa from public.sc_suporte_conversas where chave_hash = v_hash for update;
  if v_conversa is null then
   if v_nome is null or char_length(v_nome) not between 1 and 60 or v_nome !~ '[^[:space:]]' then
    raise exception 'Informe seu nome.';
   end if;
   perform pg_advisory_xact_lock(43021, 1);
   select id into v_conversa from public.sc_suporte_conversas where chave_hash = v_hash for update;
   if v_conversa is null then
    if (select count(*) from public.sc_suporte_conversas where criado_em >= now() - interval '5 minutes') >= 90 then
     raise exception 'O suporte está ocupado. Tente novamente em alguns minutos.';
    end if;
    insert into public.sc_suporte_conversas (chave_hash, nome) values (v_hash, v_nome) returning id into v_conversa;
   end if;
  end if;
  if not exists(select 1 from public.sc_suporte_mensagens where id = p_id and conversa_id = v_conversa and autor = 'cliente') then
   if (select count(*) from public.sc_suporte_mensagens where conversa_id = v_conversa and autor = 'cliente' and criado_em >= now() - interval '1 minute') >= 6 then
    raise exception 'Aguarde um minuto antes de enviar outra mensagem.';
   end if;
   insert into public.sc_suporte_mensagens (id, conversa_id, autor, texto) values (p_id, v_conversa, 'cliente', v_texto);
   update public.sc_suporte_conversas set atualizado_em = now(), pendente = true where id = v_conversa;
  end if;
 end if;
 return jsonb_build_object('existe', v_conversa is not null, 'mensagens', coalesce(
  (select jsonb_agg(to_jsonb(m) order by ordem) from (
   select id, ordem, autor, texto, criado_em from public.sc_suporte_mensagens
    where conversa_id = v_conversa order by ordem desc limit 100
  ) m), '[]'::jsonb));
end;
$$;

create or replace function sc_privado.suporte_responder(p_conversa uuid, p_id uuid, p_texto text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from public.sc_admins where user_id = auth.uid()) then
  raise insufficient_privilege using message = 'Acesso restrito à equipe.';
 end if;
 if p_id is null or p_texto is null or char_length(btrim(p_texto)) not between 1 and 1500 or p_texto !~ '[^[:space:]]' then
  raise exception 'Escreva uma resposta de até 1.500 caracteres.';
 end if;
 perform id from public.sc_suporte_conversas where id = p_conversa for update;
 if not found then raise exception 'Conversa indisponível.'; end if;
 if exists(select 1 from public.sc_suporte_mensagens where id = p_id and conversa_id = p_conversa and autor = 'equipe') then
  return;
 end if;
 insert into public.sc_suporte_mensagens (id, conversa_id, autor, texto) values (p_id, p_conversa, 'equipe', btrim(p_texto));
 update public.sc_suporte_conversas set atualizado_em = now(), pendente = false where id = p_conversa;
end;
$$;

create or replace function public.sc_suporte_cliente(p_chave text, p_id uuid default null, p_texto text default null, p_nome text default null)
returns jsonb language sql security invoker set search_path = '' as $$
 select sc_privado.suporte_cliente(p_chave, p_id, p_texto, p_nome);
$$;

create or replace function public.sc_suporte_responder(p_conversa uuid, p_id uuid, p_texto text)
returns void language sql security invoker set search_path = '' as $$
 select sc_privado.suporte_responder(p_conversa, p_id, p_texto);
$$;

revoke all on function sc_privado.suporte_cliente(text,uuid,text,text), public.sc_suporte_cliente(text,uuid,text,text),
 sc_privado.suporte_responder(uuid,uuid,text), public.sc_suporte_responder(uuid,uuid,text) from public, anon, authenticated;
grant execute on function sc_privado.suporte_cliente(text,uuid,text,text), public.sc_suporte_cliente(text,uuid,text,text) to anon, authenticated;
grant execute on function sc_privado.suporte_responder(uuid,uuid,text), public.sc_suporte_responder(uuid,uuid,text) to authenticated;
notify pgrst, 'reload schema';
commit;
