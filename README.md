# Restaurante Delícia do Nordeste — Casa do Norte (Unidade Santa Cruz)

Sistema profissional de pedidos online, cardápio digital nordestino e painel administrativo integrado em tempo real para a **Casa do Norte Delícia do Nordeste — Unidade Santa Cruz**.

---

## 1. Identidade e Manual da Marca

- **Emblema Oficial:** Utilização estrita do arquivo de imagem autoritativo anexado (`/assets/aistudio/logo_casa_do_norte_108ee79c.jpg`), contendo o chapéu de couro sertanejo com as letras **SC** e a medalha circular com os dizeres **CASA DO NORTE**.
- **Paleta de Cores:**
  - Rosa/Vermelho Principal: `#E8365D`
  - Amarelo de Destaque: `#F9D71C`
  - Cinza-Chumbo de Texto: `#4A4A44`
  - Fundo Creme Acolhedor: `#FFF8EC`
  - Vinho Nobre da Medalha: `#722238`
  - Dourado dos Frisos: `#D4AF37`
  - Azul de Apoio: `#1F5FA8`
- **Tipografia:** `Baloo 2` para títulos e `Poppins` / `Inter` para textos corridos.
- **Telefone da Fachada:** `3984-1957` (registrado como telefone fixo; DDD e WhatsApp editáveis e confirmáveis pelo lojista nas configurações).
- **Endereço e Coordenadas:** Unidade Santa Cruz / RJ cadastrado e editável no painel administrativo, sem dados fictícios apresentados como definitivos.

---

## 2. Arquitetura e Tecnologias

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Motion.
- **Backend Full-Stack:** Express com middleware Vite em desenvolvimento e endpoints REST seguros para catálogo, cálculo de comandas, webhooks e painel administrativo.
- **Persistência de Dados:** Banco local JSON com sincronização contínua (`data/database.json`), compatível com migração direta para Cloud Firestore.
- **Segurança de Preços:** Cálculo de totais, taxa de entrega, cupom de desconto e adicionais **exclusivamente executado no servidor**, impedindo manipulação de valores pelo navegador.
- **Acompanhamento Seguro:** Rota `/pedido/:id?token=...` protegida por token secreto de alta entropia para proteção contra enumeração e cumprimento da LGPD.
- **Impressão de Comanda:** Layout térmico (58mm / 80mm) compatível com impressoras de cozinha e balcão via CSS `@media print`.

---

## 3. Primeiro Acesso Administrativo e Perfis (RBAC)

O sistema possui controle de acesso por papéis (RBAC):
- **Dono:** Acesso irrestrito a configurações da loja, pagamentos, relatórios, usuários e backup.
- **Gerente:** Gestão de pedidos, cardápio, cupons, avaliações e relatórios.
- **Atendente:** Visualização e atualização de pedidos em tempo real.

### Credenciais Iniciais de Demonstração
Conforme exigido pelo manual de segurança, o primeiro acesso exige troca imediata de senha pessoal:
- **E-mail:** `dono@deliciadonordeste.com.br`
- **Senha Inicial Temporária:** `Nordeste@2026`
- **Procedimento:** Ao fazer o primeiro login, o sistema exibe automaticamente o formulário para definição da nova senha forte (mínimo 8 caracteres) com hash criptográfico PBKDF2 e salt exclusivo.

---

## 4. Meios de Pagamento

1. **Pix Instantâneo e Manual:** Geração de QR Code e chave Pix da loja com cópia-e-cola e status `Aguardando conferência manual`.
2. **Mercado Pago Checkout Pro:** Integração server-side com preferência de pagamento, alternância entre Sandbox e Produção e webhook com idempotência para evitar duplicidade.
3. **Pagamento na Entrega/Balcão:** Dinheiro com cálculo de troco informado pelo cliente e cartão presencial na maquininha.

---

## 5. Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor em desenvolvimento (Porta 3000)
npm run dev

# Gerar build de produção
npm run build
```
