# Delícia do Nordeste · Casa do Norte · Santa Cruz

Loja mobile-first com cardápio, fotos **ilustrativas**, sacola e pedido preparado no site para envio ao WhatsApp. Frontend **estático** (React + Vite + Tailwind) publicado em https://daniel-soliz.github.io/Santa-Cruz/.

> **Importante:** os 16 pratos, fotos e preços do catálogo são EXEMPLOS. O restaurante confirma os pedidos por WhatsApp. Não há banco de dados nem cobrança automática nesta fase.

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

## Fase 2 — NÃO implementada

- Supabase Auth, Postgres e Row Level Security (RLS) para painel, cardápio e pedidos em tempo real.
- Mercado Pago com Pix QR Code/copia e cola, cartão, webhook validado por função serverless.
- Aviso de novo pedido por WhatsApp/e-mail e gestão de etapas do pedido.

**Nunca** armazene senha de administrador, Access Token do Mercado Pago, token de WhatsApp ou chave `service_role` do Supabase no frontend ou em arquivos do GitHub Pages. Essas credenciais devem ficar exclusivamente em infraestrutura de servidor com secrets.
