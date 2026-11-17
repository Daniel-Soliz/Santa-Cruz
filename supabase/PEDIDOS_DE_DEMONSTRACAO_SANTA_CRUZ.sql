begin;
alter table public.sc_pedidos add column if not exists demonstracao boolean not null default false;
create table if not exists sc_privado.acessos_demo (
 chave_hash text primary key,
 vence_em timestamptz not null,
 usados integer not null default 0
);
alter table sc_privado.acessos_demo enable row level security;
revoke all on sc_privado.acessos_demo from public, anon, authenticated;

create or replace function sc_privado.criar_acesso_demo()
returns text language plpgsql security definer set search_path = '' as $$
declare chave text := replace(gen_random_uuid()::text,'-','');
begin
 if not exists(select 1 from public.sc_admins where user_id=auth.uid()) then
  raise insufficient_privilege using message='Acesso restrito à equipe.';
 end if;
 insert into sc_privado.acessos_demo(chave_hash,vence_em)
 values(encode(sha256(convert_to(chave,'UTF8')),'hex'),now()+interval '3 days');
 return chave;
end;
$$;
create or replace function public.sc_criar_acesso_demo()
returns text language sql security invoker set search_path = '' as $$
 select sc_privado.criar_acesso_demo();
$$;
revoke all on function sc_privado.criar_acesso_demo(),public.sc_criar_acesso_demo() from public, anon, authenticated;
grant execute on function sc_privado.criar_acesso_demo(),public.sc_criar_acesso_demo() to authenticated;

create or replace function sc_privado.registrar_pedido_demo(p_acesso text,p_chave text,p_itens jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 acesso_hash text;
 pedido_hash text;
 usado integer;
 codigo_pedido text;
 lista jsonb := '[]'::jsonb;
 total integer := 0;
 linha jsonb;
 produto jsonb;
 variacao jsonb;
 extra jsonb;
 extra_id text;
 extras text[];
 quantidade integer;
 unitario integer;
 catalogo constant jsonb := $catalogo${"ex-01":["Prato do sertão",3290,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-02":["Almoço da casa",2990,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-03":["Carne de sol na manteiga",5490,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-04":["Costela do sertão",4990,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-05":["Peixe grelhado",4690,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{}],"ex-07":["Macaxeira frita",2390,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{}],"ex-08":["Queijo coalho na chapa",2490,{"individual":["Individual",0],"duas-pessoas":["Para 2 pessoas",2000]},{}],"ex-09":["Baião de dois",1890,{},{}],"ex-10":["Farofa da casa",890,{},{}],"ex-11":["Tapioca de queijo coalho",2190,{},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-12":["Cuscuz com manteiga",1790,{},{"ovo":["Ovo extra",400],"farofa":["Farofa extra",500],"sem-pimenta":["Sem pimenta",0]}],"ex-13":["Pudim caseiro",1490,{},{}],"ex-15":["Suco natural (copo)",1290,{},{}],"ex-16":["Refrigerante (lata)",790,{},{}]}$catalogo$::jsonb;
begin
 if p_acesso is null or p_acesso !~ '^[0-9a-f]{32}$'
  or p_chave is null or p_chave !~ '^[0-9a-f]{32}$' then
  raise exception 'Link de demonstração inválido.';
 end if;
 acesso_hash:=encode(sha256(convert_to(p_acesso,'UTF8')),'hex');
 pedido_hash:=encode(sha256(convert_to(p_chave,'UTF8')),'hex');
 select usados into usado from sc_privado.acessos_demo
 where chave_hash=acesso_hash and vence_em>now() for update;
 if not found then raise exception 'Este link de demonstração expirou ou está inválido.'; end if;
 select codigo,total_centavos into codigo_pedido,total from public.sc_pedidos
 where demonstracao and chave_rastreio_hash=pedido_hash;
 if found then return jsonb_build_object('codigo',codigo_pedido,'total_centavos',total); end if;
 if usado>=30 then raise exception 'O limite de pedidos de demonstração foi atingido.'; end if;
 if p_itens is null or jsonb_typeof(p_itens)<>'array' or octet_length(p_itens::text)>16000 then
  raise exception 'Confira os itens da sacola.';
 end if;
 if jsonb_array_length(p_itens) not between 1 and 25 then raise exception 'Use de 1 a 25 linhas na sacola.'; end if;
 total:=0;
 for linha in select value from jsonb_array_elements(p_itens) loop
  produto:=catalogo->(linha->>'produtoId');
  if produto is null or coalesce(linha->>'quantidade','') !~ '^[1-9][0-9]?$' then
   raise exception 'Confira o produto e a quantidade.';
  end if;
  quantidade:=(linha->>'quantidade')::integer;
  variacao:=(produto->2)->(linha->>'variacaoId');
  if (produto->2)<>'{}'::jsonb and variacao is null then raise exception 'Escolha uma porção disponível.'; end if;
  if coalesce(jsonb_typeof(linha->'opcionaisIds'),'')<>'array' then raise exception 'Confira os adicionais.'; end if;
  select array(select jsonb_array_elements_text(linha->'opcionaisIds')) into extras;
  if cardinality(extras)<>(select count(distinct x) from unnest(extras) x) then raise exception 'Confira os adicionais.'; end if;
  unitario:=(produto->>1)::integer+coalesce((variacao->>1)::integer,0);
  foreach extra_id in array extras loop
   extra:=(produto->3)->extra_id;
   if extra is null then raise exception 'Adicional indisponível.'; end if;
   unitario:=unitario+(extra->>1)::integer;
  end loop;
  total:=total+unitario*quantidade;
  lista:=lista||jsonb_build_array(jsonb_build_object('nome',produto->>0,'quantidade',quantidade,'variacao',variacao->>0));
 end loop;
 codigo_pedido:='SC-'||to_char(now() at time zone 'America/Sao_Paulo','YYYYMMDD')||'-'||upper(left(gen_random_uuid()::text,8));
 insert into public.sc_pedidos(codigo,cliente_nome,modalidade,total_centavos,subtotal_centavos,taxa_entrega_centavos,status,itens,origem,pagamento_status,chave_rastreio_hash,demonstracao)
 values(codigo_pedido,'Pedido de demonstração','retirada',total,total,0,'aguardando_confirmacao',lista,'site','pendente',pedido_hash,true);
 update sc_privado.acessos_demo set usados=usados+1 where chave_hash=acesso_hash;
 return jsonb_build_object('codigo',codigo_pedido,'total_centavos',total);
end;
$$;
create or replace function public.sc_registrar_pedido_demo(p_acesso text,p_chave text,p_itens jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
 select sc_privado.registrar_pedido_demo(p_acesso,p_chave,p_itens);
$$;
revoke all on function sc_privado.registrar_pedido_demo(text,text,jsonb),public.sc_registrar_pedido_demo(text,text,jsonb) from public, anon, authenticated;
grant execute on function sc_privado.registrar_pedido_demo(text,text,jsonb),public.sc_registrar_pedido_demo(text,text,jsonb) to anon, authenticated;
commit;
