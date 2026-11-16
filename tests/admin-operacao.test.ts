import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ler=(nome:string)=>readFileSync(new URL('../'+nome,import.meta.url),'utf8');

test('fotos: editor suporta upload, enquadramento e remoção controlada',()=>{
 const editor=ler('src/admin/EditorFoto.tsx');
 const image=ler('src/admin/imagem.ts');
 const files=ler('src/admin/fotosStorage.ts');
 assert.match(editor,/image\/webp/);
 assert.match(editor,/getPublicUrl/);
 assert.match(editor,/EditorFoto/);
 assert.match(image,/LARGURA_FOTO=960/);
 assert.match(image,/ALTURA_FOTO=720/);
 assert.match(image,/zoom/);
 assert.match(editor,/Selecionar imagem do aparelho/);
 assert.match(files,/produtoId\.replace/);
 assert.match(files,/sc-fotos-cardapio/);
});
test('SQL: RLS de pedidos, caixa e Storage, nenhum insert público',()=>{
 const original=ler('supabase/INSTALAR_SANTA_CRUZ.sql');
 const novo=ler('supabase/ATUALIZAR_OPERACAO_SANTA_CRUZ.sql');
 assert.match(original,/alter table public\.sc_pedidos enable row level security/);
 assert.match(novo,/alter table public\.sc_movimentos_caixa enable row level security/);
 assert.match(novo,/for insert to authenticated with check/);
 assert.match(novo,/bucket_id='sc-fotos-cardapio'/);
 assert.match(novo,/pagamento_status/);
 assert.match(novo,/aguardando_confirmacao/);
 assert.doesNotMatch(novo,/for insert to anon/);
});
test('Checkout vincula pedido real ao ADM sem fingir pagamento',()=>{
 const checkout=ler('src/loja/components/Checkout.tsx');
 const loja=ler('src/loja/LojaApp.tsx');
 const edge=ler('supabase/functions/criar-pedido/index.ts');
 assert.match(checkout,/functions\.invoke\('criar-pedido'/);
 assert.match(checkout,/total_cliente_centavos/);
 assert.match(checkout,/Continuar pelo WhatsApp sem registro no painel/);
 assert.match(loja,/registradoNoPainel/);
 assert.match(edge,/turnstile\/v0\/siteverify/);
 assert.match(edge,/total_cliente_centavos!==total/);
 assert.match(edge,/status:'aguardando_confirmacao'/);
 assert.match(edge,/SUPABASE_SERVICE_ROLE_KEY/);
 assert.doesNotMatch(checkout,/SUPABASE_SERVICE_ROLE_KEY/);
});
test('ADM tem controle de valores separados e cartões não declarados vendas reais',()=>{
 const admin=ler('src/admin/AdminDashboard.tsx');
 const financeiro=ler('src/admin/Financeiro.tsx');
 const preview=ler('src/admin/AdminPreview.tsx');
 assert.match(admin,/pagamento_status:'pendente'/);
 assert.match(admin,/Recebido \(conferido\)/);
 assert.match(financeiro,/não é extrato bancário/);
 assert.match(financeiro,/Saldo registrado/);
 assert.match(preview,/Sem banco conectado/);
});
