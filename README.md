# Delícia do Nordeste · Casa do Norte · Santa Cruz

Loja mobile-first com cardápio, sacola e checkout WhatsApp, com estrutura opcional para registro seguro dos pedidos no Supabase. Frontend **estático** (React + Vite + Tailwind) publicado em https://daniel-soliz.github.io/Santa-Cruz/.

> **Importante:** os 16 pratos, fotos e preços atuais são EXEMPLOS. O Supabase do restaurante ainda precisa ser criado e conectado para permitir gestão real. Não há pagamento automático por Mercado Pago, e o restaurante continua confirmando os pedidos.

## Painel administrativo (Área da equipe)

O acesso discreto fica no final do rodapé, em **Área da equipe**. A rota da administração é
`https://daniel-soliz.github.io/Santa-Cruz/#/admin`. O login usa o visual escuro como referência do
StudioBlack7, mas mantém o nome e o logo do restaurante. **Saber a URL não dá permissão:
o banco exige autenticação e RLS.**

Você pode abrir **Visualizar prévia do painel** mesmo antes de configurar um projeto. A prévia tem navegação, layout e indicadores vazios, sem acesso a dados pessoais e sem permitir alterações.

### Como colocar o painel para funcionar

1. Crie um **novo projeto Supabase somente para o restaurante Santa Cruz**. Não reutilize
   o projeto chamado StudioBlack7, que pertence a outra aplicação.
2. No painel Supabase desse projeto, abra **SQL Editor** e execute o arquivo
   `supabase/INSTALAR_SANTA_CRUZ.sql`. Esse SQL cria tabelas de administradores, pratos,
   pedidos manuais e configurações, todas com regras de acesso (RLS).
3. Em **Authentication → Users**, crie manualmente o usuário administrador com e-mail e
   senha forte. Não inclua a senha no repositório. Copie o UUID do usuário.
4. No SQL Editor do **projeto Santa Cruz**, execute (substituindo pelo UUID correto):
   ```sql
   insert into public.sc_admins(user_id) values ('COLE-O-UUID-DO-USUARIO-AQUI')
   on conflict (user_id) do nothing;
   ```
   Não ative o cadastro público de administradores.
5. No repositório GitHub acesse **Settings → Secrets and variables → Actions → Variables**.
   Adicione `VITE_SUPABASE_URL` (URL do projeto) e `VITE_SUPABASE_PUBLISHABLE_KEY`
   (chave pública `sb_publishable_...`). Essas duas informações não são senhas, mas
   exigem as regras RLS configuradas no passo 2. **Nunca use service_role, secret key,
   Access Token do Mercado Pago ou a senha do administrador nesse local.**
6. Em **Authentication → URL Configuration**, cadastre a URL da loja
   `https://daniel-soliz.github.io/Santa-Cruz/` como URL de redirecionamento autorizada.
   O link **Esqueceu sua senha?** usa esse retorno com marcador `recuperar_admin` para alterar a senha dentro da área protegida.
7. Execute novamente o workflow **Publicar catálogo e pedidos no GitHub Pages**
   ou faça um commit na `main`. Depois visite `#/admin` e entre com suas credenciais.

### Como usar

- **Visão geral:** contadores reais dos pedidos registrados, em andamento e entregues. O valor
  total é apenas soma de pedidos registrados manualmente e marcados entregues, não um extrato bancário.
- **Pedidos:** lista protegida, cadastro manual de pedido com valor confirmado pela equipe
  e controle de status. Os pedidos enviados pelo **WhatsApp não aparecem automaticamente**.
- **Cardápio e preços:** cadastrar, editar e excluir, marcar disponibilidade e destaque. Pode importar
  os 16 itens demonstrativos **como rascunhos**, sem publicá-los. Confira preços/fotos reais e
  desmarque "Produto de exemplo" antes de publicar.
- **Entrega e ajustes:** definir taxa, pedido mínimo, bairros, disponibilidade de pedidos e
  ativar o cardápio do painel. Só ative a vitrine do painel quando houver ao menos um prato real
  publicado. Campos em branco continuam sem valores inventados.

**Importante:** o painel não possui acesso aos dados privados do StudioBlack7 e não copia o
banco desse site. A estrutura interna da administração original não estava publicamente visível;
o que foi usado como referência foi a apresentação do login e o estilo visual. O painel
do restaurante tem estrutura própria para cardápio e pedidos.

## Operação integrada: fotos, pedidos e financeiro

O site pode trabalhar em dois modos, sem misturar informações:

- **Modo demonstrativo (padrão atual):** funciona sem Supabase, com 16 produtos fictícios e pedidos preparados para envio manual por WhatsApp. Nada é salvo como venda no ADM.
- **Modo conectado:** depois de criar um Supabase exclusivo, o painel salva preços, tamanhos, adicionais, disponibilidade, fotos e configurações. Quando você publicar pelo menos um produto real e ativar o catálogo do painel, a loja passa a exibir somente os produtos publicados. A tela de checkout oferece **registro no painel com confirmação de segurança**. O restaurante ainda precisa confirmar o pedido e o pagamento.

### Como habilitar o editor de fotos e caixa

1. Após executar `supabase/INSTALAR_SANTA_CRUZ.sql`, execute também `supabase/ATUALIZAR_OPERACAO_SANTA_CRUZ.sql` no **mesmo projeto exclusivo do restaurante**. Esse segundo arquivo cria o bucket público de imagens `sc-fotos-cardapio` (escrita apenas por admins), lançamentos de caixa e os campos de pagamento, canal e endereço dos pedidos.
2. Entre em `#/admin` com a conta autorizada. Em **Cardápio e preços**, clique em Novo produto ou no lápis para editar. Preencha nome, preço e categoria. Escolha uma imagem JPG/PNG/WebP do celular; o painel permite zoom, posição horizontal/vertical e gera um arquivo WebP 960 × 720. Clique em **Enviar foto otimizada** e depois em **Salvar no banco**.
3. Também é possível incluir ou excluir tamanhos, adicionais, destacar um prato, marcar como esgotado, alterar a ordem e excluir o produto. Em Configurações, você também escolhe quais formas de pagamento aparecem no checkout (Pix combinado com a equipe, cartão ou dinheiro). Itens fictícios devem continuar como rascunhos até terem dados reais confirmados.
4. Em **Entradas e saídas**, registre despesas e receitas extras sem misturar com os pedidos. Em **Pedidos**, marque manualmente "Recebido (conferido)" apenas depois de verificar que o dinheiro entrou. Valores do painel **não são extrato do banco ou Mercado Pago** e não representam Pix confirmado automaticamente.

### Para receber pedidos do próprio site no ADM

O botão de envio ao painel só funciona quando o banco, o catálogo real e a função de servidor estiverem configurados. A integração foi codificada com recálculo de preços no servidor, proteção Turnstile, limite de tentativas e status inicial `aguardando_confirmacao`.

1. Crie uma conta no **Cloudflare Turnstile**, configure o domínio `daniel-soliz.github.io` (e o domínio próprio se houver) e obtenha **site key** pública e **secret key** privada.
2. No GitHub, em `Settings → Secrets and variables → Actions → Variables`, inclua `VITE_TURNSTILE_SITE_KEY` com a **site key pública**, além das duas variáveis públicas do Supabase descritas acima. Faça novo deploy para o Pages.
3. No projeto Supabase da Santa Cruz, configure os **segredos da Edge Function**, fora do código público: `TURNSTILE_SECRET_KEY` (privado), `RATE_LIMIT_SALT` (um valor forte e aleatório, privado), `SITE_ORIGINS=https://daniel-soliz.github.io`. O Supabase fornece `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em seu ambiente de funções, mas eles **nunca podem estar no navegador**.
4. Publique `supabase/functions/criar-pedido/index.ts` como função **criar-pedido** do Supabase, com `verify_jwt=false` conforme `supabase/config.toml`. É intencional que a função aceite visitantes anônimos, pois ela verifica CAPTCHA, origem, tentativas e preços no servidor. Se usar o CLI, confira `supabase --help` e as instruções atuais do CLI antes de executar deploy remoto.
5. Teste primeiro com um produto real confirmado e uma operação de teste; confira na aba Pedidos se o registro aparece como **Aguardando confirmação**. A mensagem do WhatsApp ainda precisa ser enviada pelo cliente, e a equipe decide aceitar ou cancelar. Nunca interprete o registro ou o valor do pedido como pagamento recebido.

Se a função, o CAPTCHA ou a rede falharem, o checkout mostra o erro e oferece continuar no WhatsApp **sem registro automático**. Não é uma confirmação de entrega ou pagamento. Pedidos recebidos fora do site exigem registro manual no ADM.

**Mercado Pago:** Pix com QR Code, cartão online e webhook de pagamento seguem **inativos**. Não cole Access Token no front-end. Para ativar, será necessária uma integração serverless separada com token privado e webhook validado.

## 1. Edite os dados sem programar

Abra o arquivo desejado no GitHub e clique no ícone de lápis, edite e salve (**Commit changes**).

| Arquivo | O que editar |
| --- | --- |
| `src/data/config.json` | Nome, WhatsApp, número da porta, endereço, horários, taxa, mínimo, prazo, bairros, formas de pagamento, Pix, Google Maps, Instagram e liga/desliga de pedidos |
| `src/data/cardapio.json` | Categorias, nomes e descrições, preços, imagens, tamanhos, opcionais, destaques e disponibilidade |
| `src/data/avaliacoes.json` | Depoimentos: nome, nota (1–5), texto e indicação `exemplo` |
| `README.md` | Este guia |

Em `config.json`, **PREENCHER** indica dado não informado. **Não substitua por dados inventados.** A loja oculta informações ausentes. Exemplo de campos:

- `endereco.numero: "PREENCHER"`: coloque o número correto da porta.
- `taxaEntregaFixa: "PREENCHER"`: coloque um número, como `7.50`, **somente se for o valor verdadeiro**.
- `pedidoMinimoDelivery: "PREENCHER"`: informe número real ou `0` se não houver mínimo.
- `tempoMedioEntregaMinutos`: valor inteiro real, sem "min".
- `bairrosAtendidos: ["PREENCHER"]`: troque por lista de nomes de bairros; se deixada sem informação, não é exibida.
- `formasPagamento`: troque os `true`/`false` para mostrar/esconder Pix, cartão e dinheiro.
- `chavePix`: opcional; não é usada em cobrança automática.
- `instagram`, `avaliacoesGoogleUrl` e `galeria.fachada/salao`: coloque URLs ou caminhos de fotos reais, ou deixe **PREENCHER** para ocultar.
- `pedidosOnlineAtivos: false` pausa novos pedidos online. Use `true` para ligar novamente.

Os horários informados já estão preenchidos corretamente: **terça a domingo, das 8h às 22h, segunda fechado** (fuso São Paulo). O WhatsApp é **(11) 96014-9521**; o endereço inclui CEP **02850-100** e ainda aguarda o número da porta.

## 2. Fotos diretamente no cardápio

No momento, cada um dos 16 itens possui uma **URL de foto ilustrativa** de banco de imagens (Unsplash), exibida no card e no modal como WebP, com carregamento otimizado. A foto **não representa necessariamente o prato real nem o restaurante**. O selo "Foto ilustrativa" aparece para impedir confusão. Não use estas imagens como prova de produto real.

Para usar fotos suas, envie arquivos `.webp` (idealmente 720×540 px, compactados) para uma pasta `public/imagens/` no GitHub, então edite `foto` no item de `cardapio.json`:

```json
"foto": "imagens/carne-de-sol.webp",
"imagemIlustrativa": false,
"exemplo": false
```

Mude `exemplo` para `false` somente depois de corrigir **nome, descrição, tamanho, adicionais e preço**. O botão `Adicionar` não aceita itens com `disponivel: false`. Os quatro produtos em destaque são os que têm `destaque: true`. Para o banner principal, substitua `heroFoto` em `config.json` e defina `heroImagemIlustrativa: false` quando a foto for realmente sua.

A Unsplash permite uso comercial de fotos sob sua licença (https://unsplash.com/license), mas recomendamos substituir as imagens por fotos reais para representar corretamente os pratos.

## Melhorias técnicas do checkout (sem servidor)

- **Conferência de CEP antes da sacola:** o bloco “Confira a entrega pelo CEP” consulta o endereço no ViaCEP e só indica cobertura quando a taxa, o pedido mínimo **e os bairros atendidos** estão preenchidos em `src/data/config.json`. Consultar CEP **não significa reservar entrega nem enviar pedido**.
- **Entrega desativada quando faltam dados:** no checkout, o tipo Delivery fica indisponível até as regras acima estarem completas; retirada e consumo no local continuam disponíveis.
- **Erros de formulário claros:** mensagens aparecem abaixo dos campos e o foco vai ao primeiro erro. Nenhum caminho de arquivo ou texto `PREENCHER` é mostrado ao cliente.
- **Dinheiro e troco:** aceita `100,00` ou `100.00` e calcula o troco estimado na mesma tela.
- **Sacola:** agora pode ser esvaziada de uma vez, após confirmação.
- **Pedido enviado ao WhatsApp:** o navegador abre a conversa com a mensagem, mas o cliente **precisa tocar em Enviar**. O número e a tela final não provam recebimento nem pagamento. A equipe precisa confirmar.
- **Sem mudanças comerciais:** preços, fotos, taxas e avaliações demonstrativos permanecem identificados; a implantação de painel, pagamento automático e notificações exige backend seguro e contas reais.

## 3. Como funciona o pedido

O cliente escolhe pratos e opcionais, monta a sacola e digita nome, telefone e modalidade. Para entrega, informa CEP (consulta ViaCEP) e endereço; a taxa e o mínimo são lidos do JSON. Se estiverem sem configurar, **delivery não pode ser enviado**, evitando informar preços errados.

O checkout cria um número de pedido, prepara mensagem com itens, extras, observações, subtotal, entrega e total, e abre o WhatsApp. **O cliente ainda precisa tocar em Enviar dentro do WhatsApp**. A tela final orienta o cliente a aguardar confirmação da equipe. Fora de horário, os itens continuam disponíveis para montar o pedido, com aviso de confirmação na abertura.

O carrinho fica salvo no navegador pelo `localStorage`; se bloqueado, o site avisa. Pix nesta fase é combinado com a equipe no WhatsApp (sem QR Code, sem pagamento automático). Dinheiro e cartão dependem de confirmação com o restaurante.

**Avaliações:** o arquivo traz 3 cartões fictícios identificados como tal. Apague-os ou substitua por depoimentos reais autorizados, e marque `exemplo: false`. O botão “Avalie no Google” só aparece com `avaliacoesGoogleUrl` real.

**Galeria:** “Nosso espaço” fica oculta até você cadastrar fotos reais da fachada ou do salão em `config.json`; não são exibidos espaços com “PREENCHER”.

## Fundo global do site

A textura de **xilogravura nordestina à esquerda e renda renascença à direita** está em `src/assets/moldura-xilogravura-renda.webp`, convertida da arte fornecida para WebP. O CSS em `src/index.css` aplica a mesma imagem ao site inteiro, com fundo fixo, repetição vertical e seções transparentes. O cabeçalho mantém branco translúcido e os cards têm fundo branco para leitura. Em Safari/iPhone, o fundo acompanha a rolagem para evitar travamentos específicos do navegador.

Para mudar a arte futuramente, substitua o arquivo WebP conservando o nome. O Vite atualiza automaticamente o caminho de publicação em `/Santa-Cruz/`.

## 4. Testar e publicar

Instale Node.js 22 e execute:

```bash
npm install
npm run dev
npm run lint
npm run test:pedido
npm run build:pages
npm run test:pages
```

Ações automáticas do GitHub executam os testes e publicam o site quando alterações entram na branch `main`. Em **Settings → Pages → Build and deployment**, escolha **GitHub Actions**. O domínio atual utiliza base `/Santa-Cruz/` e os arquivos de imagem e logo continuam no lugar correto.

Teste no celular: fotos, categorias, adicionar/editar produto, carrinho, CEP, total, mínimo, troco, horário fechado e link para WhatsApp. Para verificar Lighthouse, abra o Chrome DevTools → Lighthouse → Mobile; metas são acima de 90 em performance, acessibilidade e SEO, **não uma pontuação garantida**.

## 5. Domínio próprio .com.br (sem comprar agora)

**Não há domínio configurado neste momento.** Quando escolher e registrar o seu domínio:

1. No registrador DNS (por exemplo, Registro.br), crie os quatro registros `A` para o domínio raiz `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Para `www`, crie `CNAME` apontando para `daniel-soliz.github.io` (sem `/Santa-Cruz/`).
2. No GitHub: **Settings → Pages → Custom domain**: informe o domínio escolhido, salve e ative **Enforce HTTPS** quando o certificado estiver disponível.
3. No arquivo `src/data/config.json`, altere `siteUrl` para `https://seu-dominio.com.br/` (com barra final).
4. No GitHub: **Settings → Secrets and variables → Actions → Variables**, crie `PAGES_CUSTOM_DOMAIN` com valor `true`. O `vite.config.ts` passará a gerar com base `/`, em vez de `/Santa-Cruz/`.
5. Faça commit das alterações e publique novamente. O SEO, o sitemap e o robots.txt são gerados pelo Vite usando a URL do `config.json`.
6. Para o modo de publicação por GitHub Actions, o arquivo `CNAME` **não é obrigatório**. Se sua publicação mudar para uma branch, crie `public/CNAME` contendo **somente** seu domínio (sem https, sem barra); não crie esse arquivo com um domínio fictício agora.

O DNS pode demorar até 24 horas para propagar. Consulte a documentação oficial do GitHub: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site.

## Próximos passos técnicos

- A interface do painel com Supabase Auth, CRUD de pratos, configurações e pedidos manuais **já está implementada**, mas depende de um **projeto Supabase exclusivo da Santa Cruz** e da execução do SQL antes de operar de verdade.
- Pedidos originados no checkout pelo WhatsApp não são registrados automaticamente, pois a mensagem só é enviada quando o cliente a confirma no aplicativo. Um backend seguro para receber pedidos online, validar totais e gerar status do cliente continua pendente.
- Mercado Pago com Pix QR Code/copia e cola, cartão e webhook validado por função serverless ainda não está conectado.
- Notificações automáticas por WhatsApp/e-mail, upload privado de fotos e perfis de funcionários com níveis diferentes de permissão ficam para a próxima etapa.

**Publicação de preços:** no painel, altere dados reais e marque o produto como não demonstrativo antes de publicá-lo. Depois ative o uso do catálogo do painel em Configurações. Sem isso, a vitrine mantém o JSON de demonstração, sem inventar dados.

**Nunca** armazene senha de administrador, Access Token do Mercado Pago, token de WhatsApp ou chave `service_role` do Supabase no frontend ou em arquivos do GitHub Pages. Essas credenciais devem ficar exclusivamente em infraestrutura de servidor com secrets.
