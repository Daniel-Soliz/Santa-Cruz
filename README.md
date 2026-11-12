# Santa Cruz | Pedidos do restaurante

## Por que a página ficava branca?

O endereço `https://daniel-soliz.github.io/Santa-Cruz/` estava usando o código fonte do React/TypeScript diretamente. Navegadores não executam arquivos `.tsx` desse jeito. Também faltava configurar o caminho `/Santa-Cruz/` para CSS, JavaScript e imagens.

Foi adicionada uma publicação compilada no GitHub Actions (`.github/workflows/deploy-pages.yml`), além de uma apresentação estática de segurança no `index.html`, que aparece mesmo se o JavaScript falhar.

### Como configurar a publicação

1. Abra **GitHub → Santa-Cruz → Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions** (em vez de *Deploy from a branch*).
3. Vá a **Actions → Publicar apresentação no GitHub Pages → Run workflow**, caso o fluxo não tenha começado.
4. Verifique a conclusão verde do fluxo. Abra `https://daniel-soliz.github.io/Santa-Cruz/` e recarregue com Ctrl+F5.

Se a configuração continuar como publicação por branch, o `index.html` já inclui uma página básica para evitar a tela branca, mas a versão React compilada exige **GitHub Actions**. Confira se não existe uma configuração antiga de publicação por Jekyll.

### Limite importante

No GitHub Pages, o site é **uma apresentação visual com atendimento pelo WhatsApp**, sem envio automático de pedidos. O Pages não executa o servidor Express, não persiste pedidos e não conecta pagamentos. Para ativar o fluxo completo de cardápio, sacola, checkout e painel, é obrigatório hospedar a API e usar banco persistente. **Não trate a versão do Pages como um sistema de pedidos automatizado.**

Comandos para validar:

```bash
npm install
npm run lint
npm run build
npm run test:smoke
npm run build:pages
npm run test:pages
```

O site usa largura máxima consistente, grades responsivas para celular e computador, botão de contato acessível e imagens com caminho ajustado pelo Vite. Mantenha `DEPLOY_TARGET=github-pages` e `VITE_STATIC_PREVIEW=true` somente na versão estática.


Aplicação de cardápio e pedidos da Delícia do Nordeste. O cliente escolhe produtos, informa nome e telefone, opta por entrega ou retirada, seleciona o pagamento e acompanha o pedido. A equipe recebe e atualiza pedidos em `#/admin`.

## Rodar localmente

Requer **Node.js 22**. Na primeira execução, instale as dependências e inicie:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Confira a API em `http://localhost:3000/api/health`. Para validar o código:

```bash
npm run lint
npm run build
npm start
```

Por padrão, o banco é criado em `data/database.json` (ignorado pelo Git). Em desenvolvimento, o primeiro administrador é `dono@deliciadonordeste.com.br` com senha temporária `Nordeste@2026`; troque-a no primeiro login. **Em produção essas credenciais não funcionam**: configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo 12 caracteres).

## Publicação no Google Cloud

Este aplicativo precisa de **servidor Node.js**. O **Firebase Hosting estático sozinho não atende `/api/orders`**; use Cloud Run, com o Dockerfile incluído, ou outra hospedagem que execute o servidor Express.

**Atenção: ainda não publique para receber pedidos reais sem armazenamento persistente.** O banco atual é um arquivo JSON; no Cloud Run o sistema só inicia em produção com `DATA_DIR` apontando para um volume persistente montado. A arquitetura de arquivo requer apenas uma instância e requisições serializadas para evitar conflito, além de backup e controle de acesso. Para operação maior, migre o banco para Firestore ou Cloud SQL antes de publicar. Não use um diretório temporário do contêiner como banco de pedidos.

Configure também:
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: credenciais privadas do responsável pela loja.
- `DATA_DIR`: caminho montado e persistente do banco (ex.: `/mnt/pedidos`).
- `PORT`: definida pela plataforma, normalmente `8080`.
- `MERCADO_PAGO_ACCESS_TOKEN`: apenas caso queira ativar Mercado Pago em produção.

Antes de vender, substitua **todos os nove pratos de demonstração**, identificados como `[EXEMPLO]`, pelos produtos e preços reais no painel. Confirme WhatsApp, endereço, horários, entrega, Pix e meios de pagamento. O QR Code, a finalização do pedido e o painel dependem das rotas da API em execução.

## Estrutura

- `src/pages`: cardápio, acompanhamento e páginas públicas.
- `src/pages/admin`: pedidos, cardápio, pagamentos, loja, cupons e usuários.
- `src/components`: carrinho, personalizações e componentes visuais.
- `src/context` e `src/services`: estado do pedido e acesso à API.
- `server.ts`: API Express, validação de valores e persistência.
- `public`: imagens e manifest para o navegador.

## Segurança e dados

Não envie `.env` nem `data/database.json` para o GitHub: este último contém pedidos e dados dos clientes. O histórico de commits anteriores do repositório tinha um `database.json` e credenciais de teste conhecidas; não reutilize esses dados nem essas senhas para uma loja real. Use um backup privado e controle de acesso para cada funcionário.

As regras antigas do Firebase foram removidas porque a aplicação não usa o SDK do Firestore; elas não protegiam o banco JSON nem as rotas do Express.
