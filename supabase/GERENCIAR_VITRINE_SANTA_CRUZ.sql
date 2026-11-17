-- Santa Cruz. Execute após INSTALAR_SANTA_CRUZ.sql.
-- Somente conteúdo público. As políticas da tabela já permitem leitura pública
-- e restringem atualizações aos administradores cadastrados em sc_admins.
alter table public.sc_configuracao
 add column if not exists conteudo jsonb not null default '{}'::jsonb
 check (jsonb_typeof(conteudo) = 'object' and octet_length(conteudo::text) <= 30000);
