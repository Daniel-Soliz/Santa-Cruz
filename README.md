# Delícia do Nordeste Santa Cruz | Loja online

**Projeto:** React 19 + Vite 8 + Tailwind 4 + Firebase Authentication, Cloud Firestore, Cloud Storage e Cloud Functions (Node 22).
**Site:** https://daniel-soliz.github.io/Santa-Cruz/
**Painel:** https://daniel-soliz.github.io/Santa-Cruz/admin/ (redireciona para a rota `#/admin`)

## O que funciona

- Home com pratos em destaque, cardápio com categorias, filtros, busca, foto, descrição, preço e estado esgotado
- Modal de tamanho, observação e quantidade, carrinho persistido no navegador e botão fixo no celular
- Checkout com retirada, delivery por CEP ou consumo no local, busca pelo ViaCEP e formas de pagamento
- Pedidos gravados via Cloud Functions, preços recalculados no servidor com os produtos reais do Firestore
- Pix emitido pela API de pagamentos do Mercado Pago com QR Code e copia e cola; cartão via Checkout Pro
- Número do pedido e acompanhamento em tempo real pelo usuário que fez a compra
- Login administrativo por e-mail e senha, pedidos ao vivo, alerta sonoro, impressão 80 mm, fotos no Storage e CRUD do cardápio
- Regras de horário na zona `America/Sao_Paulo`, terça a domingo de 08h às 22h como padrão
- SEO, schema.org Restaurant e Menu, sitemap, robots.txt, fallback sem JavaScript, acessibilidade e layout responsivo

**Importante:** o GitHub Pages hospeda apenas o frontend. Para finalizar pedidos reais, é necessário ativar o Firebase e implantar as Functions. Sem essa etapa, a vitrine usa exemplos claramente identificados e bloqueia a finalização. Não há simulação de compra aprovada.

## 1. Criar e configurar Firebase

1. Abra https://console.firebase.google.com/ e crie um projeto para o restaurante.
2. Adicione um aplicativo **Web**. Em **Configurações do projeto → Seus aplicativos**, copie o objeto de configuração do SDK.
3. Em **Authentication → Sign-in method**, habilite **Anônimo** para clientes e **E-mail/senha** para funcionários.
4. Em **Authentication → Settings → Authorized domains**, autorize `daniel-soliz.github.io`.
5. Crie o **Cloud Firestore** no modo de produção e ative **Cloud Storage**. Para implantação de Functions/Storage, pode ser necessário ativar faturamento no plano Blaze.
6. Nas configurações do Firestore e Storage, publique as regras dos arquivos `firestore.rules` e `storage.rules`. A implantação pelo CLI está explicada adiante.

O SDK usa apenas as seis variáveis públicas do arquivo `.env.example`, prefixadas com `VITE_FIREBASE_`. Elas identificam o aplicativo e **não** são o token privado do Mercado Pago.

Para testar localmente, crie `.env.local` na raiz, copiando os nomes do `.env.example` e preenchendo com a configuração do seu app Firebase:

```bash
npm install
npm run dev
```

Abra a URL do Vite mostrada no terminal. A loja funciona com exemplos mesmo antes de conectar o Firebase, mas não aceita pedidos reais sem o backend.

## 2. Configurar GitHub Pages

No repositório GitHub, vá em **Settings → Secrets and variables → Actions → Variables** e crie:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MESSAGING_SENDER_ID
```

Preencha com os valores **públicos** de configuração do Firebase Web. Não insira Access Token, webhook secret, senha de administrador nem credencial de serviço nesse painel de variáveis públicas. Em **Settings → Pages → Source**, selecione **GitHub Actions**.

O workflow `.github/workflows/deploy-pages.yml` compila a loja com a base `/Santa-Cruz/`, checa os arquivos e publica após merge na `main`. Enquanto a branch não for integrada, o site principal não muda.

## 3. Implantar Firestore, Storage e Cloud Functions

No computador com Node.js 22, instale e autentique o Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
npm --prefix functions install
npm --prefix functions run build
firebase deploy --only firestore:rules,storage,functions
```

Selecione o **mesmo projeto** usado nas variáveis Web. O deploy das Functions usa a região `southamerica-east1`. Configure e limite gastos no Firebase/Google Cloud antes de permitir pedidos reais.

Para o backend, crie `functions/.env` com base em `functions/env.example`:

```text
PUBLIC_SITE_URL=https://daniel-soliz.github.io/Santa-Cruz/
MP_WEBHOOK_URL=https://URL-HTTPS-REAL-DO-SEU-WEBHOOK
```

O endereço do webhook é gerado pelo Firebase ao implantar a função `mercadoPagoWebhook`. Copie a URL **exata** indicada no terminal ou console e publique novamente após preencher o `.env`. **Nunca** use uma URL de `github.io` para o webhook.

## 4. Credenciais Mercado Pago, sem expor secrets

Crie uma aplicação no painel https://www.mercadopago.com.br/developers/pt. Use inicialmente credenciais de teste. No terminal:

```bash
firebase functions:secrets:set MP_ACCESS_TOKEN
firebase functions:secrets:set MP_WEBHOOK_SECRET
firebase deploy --only functions
```

Cada comando pede o valor de maneira interativa. O Access Token é privado. O `MP_WEBHOOK_SECRET` é a chave secreta da configuração de **Webhooks** no Mercado Pago Developers, na aplicação correspondente. Associe o tópico **payment** à URL pública da Function `mercadoPagoWebhook`.

O servidor recalcula preços, valida a identidade da sessão, emite cobranças, confere a assinatura HMAC e o pagamento diretamente na API do Mercado Pago e só então registra `paid`. O retorno do Checkout Pro nunca confirma a compra sozinho. Dados de CPF são enviados ao provedor para emitir o Pix, sem salvar o CPF no documento do pedido.

**Cartão:** usa Checkout Pro, que abre o ambiente seguro do Mercado Pago e depois retorna ao seu site.

**Pix:** usa Payments API e mostra o QR Code/código copia e cola no próprio site. A integração precisa ser testada com a sua conta real ou de teste antes da abertura.

Docs oficiais:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/configure-back-urls
- https://www.mercadopago.com.br/developers/pt/docs/checkout-api-payments/integration-configuration/integrate-pix
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications

## 5. Criar o primeiro administrador

No Console Firebase → Authentication, crie um usuário com **e-mail e senha**. Depois conceda a claim `admin: true` usando o script do projeto com credenciais de aplicação padrão do Google Cloud (ADC) ou uma máquina autorizada:

```bash
gcloud auth application-default login
npm --prefix functions run make-admin -- email@seudominio.com.br
```

O projeto selecionado nas credenciais ADC deve ser o mesmo projeto Firebase. Também é possível definir `GOOGLE_CLOUD_PROJECT` no terminal antes de executar. A permissão de administrador não é concedida pelo frontend. Encerre a sessão e entre novamente pelo painel `#/admin`.

Não compartilhe senhas nem arquivos JSON de conta de serviço no GitHub. Para revogar acesso, desative o usuário no Firebase Authentication ou retire sua claim no ambiente administrativo.

## 6. Publicar o cardápio real

Entre no painel em `#/admin`. A primeira versão exibe produtos demonstrativos definidos em `src/data/storeCatalog.ts`, com fotos meramente ilustrativas. Clique **Importar exemplos** se quiser usá-los como ponto de partida no Firestore.

Para cada prato, ajuste nome, preço real, foto, categoria, adicionais e disponibilidade. Em seguida, **desmarque a opção “Produto ilustrativo”** somente depois da conferência. Produtos demo não podem virar pedidos reais. Organize as categorias e publique as configurações da loja.

Em **Configurações**, confirme endereço, telefone, horários, pedido mínimo, bairros/CEPs atendidos, taxas, tempos e meios de pagamento. O delivery começa desligado; adicione ao menos uma região com prefixo ativo antes de habilitar. Pix e Mercado Pago também começam desligados e só devem ser ativados após testar as cobranças.

## Segurança e privacidade

- Firestore: catálogo público e configurações públicas são legíveis; pedidos são legíveis **somente pelo usuário autenticado dono do pedido ou por admin**. Clientes criam pedidos **via callable Cloud Function** que calcula o valor; escrita direta na coleção `orders` é proibida.
- Storage: só contas com custom claim admin podem fazer upload/alterar imagens (limite de tamanho e tipos).
- Access Tokens/segredos do Mercado Pago ficam no Secret Manager e são acessíveis somente pelas Functions.
- A função limita novos pedidos a 8 por sessão e por hora para reduzir abuso. Para proteção adicional, configure Firebase App Check antes de escala comercial.
- Um pedido anônimo só pode ser acompanhado no **mesmo navegador enquanto a sessão anônima persistir**. Para suporte após limpeza de dados, a equipe pode localizar o pedido pelo painel.
- Use política de privacidade e retenção de dados adequada à LGPD antes de abrir para clientes.

## Testar antes de receber dinheiro

```bash
npm run lint
npm run build:pages
npm run test:pages
npm --prefix functions install
npm --prefix functions run test
```

No navegador: teste filtros e sacola no celular, horários, CEP atendido e não atendido, compra de retirada, Pix de teste, cartão de teste, webhook, status de pedido e impressão. O GitHub Actions roda os testes estáticos e os testes das regras de negócio, mas **não comprova uma cobrança real nem um deploy Firebase conectado**.

## Arquivos principais

- `src/data/storeCatalog.ts`: modelos, sete categorias, catálogo de demonstração e horários padrão.
- `src/storefront/StorefrontApp.tsx`: home, filtros, modal, sacola, navegação e mapa.
- `src/storefront/Checkout.tsx`: etapas de checkout, ViaCEP e pagamento.
- `src/storefront/Tracking.tsx`: confirmação, status e Pix no próprio site.
- `src/storefront/AdminPanel.tsx`: equipe, pedidos, cardápio, fotos e configurações.
- `src/lib/firebase.ts`: cliente modular Firebase e callable Functions.
- `functions/src/index.ts` e `functions/src/core.ts`: backend seguro, cálculos e webhooks.
- `firestore.rules`, `storage.rules`, `firebase.json`: segurança e deploy.

## O que ainda depende do restaurante

Fotos reais dos pratos, nomes e preços finais, catálogo e adicionais, áreas e valores de entrega, chave/conta Mercado Pago, configuração do Firebase, dados de contato/horários confirmados e política comercial (cancelamentos, reembolso e LGPD).
