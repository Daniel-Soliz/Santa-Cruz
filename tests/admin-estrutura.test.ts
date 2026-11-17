import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(name:string)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('ADM tem rota integrada ao site e link pequeno no rodapé',()=>{
 const app=read('src/App.tsx'),store=read('src/loja/LojaApp.tsx');
 assert.match(app,/hash\.startsWith\('#\/admin'\)/);
 assert.match(app,/lazy\(\(\)=>import\('\.\/admin\/AdminApp'\)\)/);
 assert.match(store,/href="#\/admin"/);
 assert.match(store,/Área da equipe/);
});
test('autenticação e autorização não usam senha fixa no código',()=>{
 const backend=read('src/admin/backend.ts'),app=read('src/admin/AdminApp.tsx'),login=read('src/admin/AdminLogin.tsx');
 assert.match(backend,/VITE_SUPABASE_PUBLISHABLE_KEY/);
 assert.match(login,/signInWithPassword/);
 assert.match(app,/\.from\('sc_admins'\)/);
 assert.doesNotMatch(backend,/ADMIN_PASSWORD=/);
 assert.doesNotMatch(app,/localStorage\.(get|set)Item\(['"]nordeste_admin_token/);
});
test('SQL exige RLS, perfil de admin e protege dados de pedidos',()=>{
 const sql=read('supabase/INSTALAR_SANTA_CRUZ.sql');
 for(const table of ['sc_admins','sc_produtos','sc_configuracao','sc_pedidos'])
  assert.match(sql,new RegExp('alter table public\\.'+table+' enable row level security'));
 assert.match(sql,/auth\.uid\(\)/);
 assert.match(sql,/revoke all on public\.sc_admins/);
 assert.match(sql,/grant select on public\.sc_configuracao,public\.sc_produtos to anon/);
 assert.doesNotMatch(sql,/grant (select|insert|update|delete).*sc_pedidos to anon/);
});
test('painel diferencia pedidos cadastrados manualmente dos pedidos por WhatsApp',()=>{
 const painel=read('src/admin/AdminDashboard.tsx');
 assert.match(painel,/O checkout seguro registra pedidos nesta lista/);
 assert.match(painel,/Solicitações enviadas pelo chat chegam na aba Suporte/);
 assert.match(painel,/Pedidos combinados pelo chat ou pelo WhatsApp podem ser registrados aqui pela equipe/);
 assert.match(painel,/Somente registros do banco/);
 const editor=read('src/admin/GestorCardapio.tsx');
 assert.match(editor,/Produto demonstrativo/);
});

test('o login oferece recuperação real sem incluir senha no repositório',()=>{
 const auth=read('src/admin/backend.ts'),app=read('src/admin/AdminApp.tsx'),login=read('src/admin/AdminLogin.tsx');
 assert.match(auth,/detectSessionInUrl:true/);
 assert.match(login,/resetPasswordForEmail/);
 assert.match(app,/auth\.updateUser\(\{password:senha\}\)/);
});

test('novo cardápio permite criar e reorganizar categorias próprias sem publicar exemplos',()=>{
 const gestor=read('src/admin/GestorCategorias.tsx');
 const produtos=read('src/admin/GestorCardapio.tsx');
 const loja=read('src/loja/LojaApp.tsx');
 const sql=read('supabase/GERENCIAR_CATEGORIAS_SANTA_CRUZ.sql');
 assert.match(gestor,/\.from\('sc_categorias'\)\.insert/);
 assert.match(gestor,/\.from\('sc_categorias'\)\.update/);
 assert.match(gestor,/\.from\('sc_categorias'\)\.delete/);
 assert.match(produtos,/Publicar meu novo cardápio/);
 assert.match(produtos,/EditorFoto/);
 assert.match(produtos,/EditorOpcoes/);
 assert.match(loja,/\.from\('sc_categorias'\)/);
 assert.match(loja,/idsAtivos\.has\(p\.categoriaId\)/);
 assert.match(sql,/alter table public\.sc_categorias enable row level security/);
 assert.match(sql,/sc_proteger_categoria_delete/);
 assert.match(sql,/sc_validar_categoria_produto_save/);
});
