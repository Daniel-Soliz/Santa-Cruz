-- Execute após GERENCIAR_SUPORTE_SANTA_CRUZ.sql.
-- A chave estrangeira existente remove as mensagens da conversa em cascata.
begin;

do $$
begin
 if not exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'sc_suporte_conversas'
    and policyname = 'sc_suporte_conversas_admin_excluir'
 ) then
  create policy sc_suporte_conversas_admin_excluir
   on public.sc_suporte_conversas for delete to authenticated
   using ((select exists(select 1 from public.sc_admins where user_id = auth.uid())));
 end if;
end;
$$;

grant delete on public.sc_suporte_conversas to authenticated;
notify pgrst, 'reload schema';

commit;
