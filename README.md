# Delícia do Nordeste · Casa do Norte · Santa Cruz

Site de cardápio com sacola e pedido montado no próprio navegador. **100% estático**, feito em React + Vite + Tailwind e publicado no GitHub Pages.

**Endereço:** https://daniel-soliz.github.io/Santa-Cruz/

## Como editar (sem saber programar)

### 1. Trocar pratos, fotos, descrições e preços
Abra **`src/data/cardapio.json`** no GitHub e clique no lápis (Editar). É o **único arquivo** com o cardápio. Cada item possui:

- `nome`, `descricao`, `categoriaId` e `preco`: preço numérico (use `29.90`, com ponto, sem símbolo R$);
- `foto`: comece com `imagens/meu-prato.webp` e envie o arquivo para `public/imagens/` no repositório. Deixe `""` para mostrar um placeholder;
- `disponivel`: `true` para vender; `false` para mostrar “Indisponível hoje”;
- `destaque`: `true` para aparecer nos pratos em destaque;
- `variacoes`: tamanhos (ex.: individual, para duas pessoas) com `acrescimo`;
- `opcionais`: extras e preferências com `preco`;
- `exemplo`: deixe `true` enquanto o valor e o produto forem fictícios. Troque para `false` após conferência real.

**Importante:** os 16 pratos distribuídos nas 8 categorias foram inventados **exclusivamente como EXEMPLO**, com preços **fictícios**, sem fotos reais. Antes de anunciar para clientes, substitua todos pelo cardápio e valores oficiais e remova o aviso de demonstração na interface quando não houver mais itens fictícios. Os pedidos com itens fictícios são marcados como demonstrativos no WhatsApp.

Se a foto ainda não existe, o site deixa um espaço bonito indicando **PREENCHER**, sem utilizar imagens falsas do restaurante. Prefira fotos WebP comprimidas (p.ex. largura 800 px ou menos).

### 2. Horários, telefone, entrega e pedidos online
Abra **`src/config/loja.ts`**.

- `pedidosOnlineAtivos: true` liga os pedidos; `false` pausa os pedidos e mantém o catálogo visível;
- `taxaEntregaFixa: null` significa **PREENCHER**: substitua `null` pela taxa verdadeira, por exemplo `8.50`; este exemplo numérico **não é a taxa oficial**;
- `pedidoMinimoDelivery: null` também precisa ser preenchido. Use `0` se realmente não houver mínimo;
- `horarios` já está configurado com os dados fornecidos: **terça a domingo das 08:00 às 22:00**, segunda fechado; o relógio usa `America/Sao_Paulo`;
- `heroFoto`: caminho de uma foto real em `public/imagens/`; sem foto, mostra um placeholder com indicação **PREENCHER**;
- `tempoMedioMinutos`: `null` até você informar um prazo real;
- `instagram`: vazio até você fornecer um perfil oficial.

Os dados confirmados permanecem: **Delícia do Nordeste · Casa do Norte · Santa Cruz**, WhatsApp **(11) 96014-9521**, Rua Santa Cruz da Conceição, Parque Belém, São Paulo – SP, CEP **02850-100**.

**Entrega:** enquanto taxa fixa ou mínimo estiverem em `null`, o checkout permite escolher delivery, mas **não deixa enviar** até serem configurados. Retirada e consumo no local podem ser testados sem esses valores. Os cálculos e valores finais desta Fase 1 são ilustrativos e exigem confirmação no WhatsApp.

### 3. Como o cliente faz o pedido
1. Abre o catálogo, escolhe variações e opcionais e adiciona à sacola.
2. Confere quantidades, observações e preenche nome, telefone, tipo, endereço e pagamento em **uma tela**. O CEP pode ser consultado pelo ViaCEP (se falhar, o preenchimento manual continua disponível).
3. Clica **Preparar pedido no WhatsApp**. O site cria um número de pedido e abre uma conversa com a mensagem completa, incluindo emojis, itens, subtotal, taxa e total. **O cliente precisa tocar em Enviar no WhatsApp.** A equipe confirma o recebimento e o pagamento. O site **não** registra pedidos em servidor nem confirma pagamento.

O carrinho é salvo no armazenamento do navegador. Se o navegador bloquear armazenamento, a loja mostra um aviso. Fora de horário, é possível montar e enviar a mensagem, com indicação de que a confirmação só ocorrerá após a próxima abertura.

Pix nesta fase significa **pagamento a combinar no WhatsApp**; não existe QR Code nem cobrança automatizada. Cartão/dinheiro são presenciais.

### 4. Testar antes de publicar
No computador com Node.js 22:

```bash
npm install
npm run dev
npm run lint
npm run test:pedido
npm run build:pages
npm run test:pages
```

Abra a URL local indicada pelo Vite. Teste busca, chips de categoria, modal e sacola no celular, endereço pelo CEP, valores de troco, status fechado, mensagem com acentos e o link do WhatsApp. O CI do GitHub valida a compilação e a estrutura do build, mas não mede automaticamente o Lighthouse no seu aparelho.

### 5. Publicar no GitHub Pages
1. Faça as alterações no GitHub e confirme (Commit).
2. Ao integrar a branch à **`main`**, o workflow **`.github/workflows/deploy-pages.yml`** compila e publica automaticamente.
3. Em **Settings → Pages → Build and deployment**, escolha **GitHub Actions**.
4. Abra **https://daniel-soliz.github.io/Santa-Cruz/** e faça **Ctrl+F5** se aparecer cache antigo.

O Vite mantém a base **`/Santa-Cruz/`**. Imagens em `public/` ficam disponíveis usando caminho relativo. Não há rotas de servidor, portanto não há URLs de páginas que causem 404.

## Fase 2 — não implementada
- **Supabase Auth, Postgres e RLS**: contas administrativas, dados centralizados, categorias, fotos, preços, estoque, CEP/taxa e pedidos com status em tempo real.
- **Mercado Pago**: Pix QR Code/copia e cola e cartão online, com webhook em Supabase Edge Function ou Cloudflare Worker.
- **Notificações**: novo pedido por WhatsApp/e-mail e atualização de status.
- **Segurança**: usar variáveis privadas e segredos no servidor; **NUNCA** enviar senha de administrador, Access Token do Mercado Pago, chave `service_role` do Supabase ou outro segredo para o GitHub Pages.

Será necessário fornecer: fotos reais, nomes/preços reais, adicionais, taxa e mínimo de entrega, prazo médio (se quiser exibir), Instagram oficial (se houver) e dados seguros das contas Supabase/Mercado Pago. O layout está separado dos dados para facilitar essa migração futura.
