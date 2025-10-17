# 🍽️ Fluxo de Funcionamento — App de Gerenciamento de Restaurante

## 🎯 Objetivo do Sistema

O sistema tem como objetivo **organizar e agilizar o atendimento** de um restaurante, **centralizando o fluxo** entre:
- Garçons  
- Cozinha  
- Caixa/Administração  

O aplicativo mobile (React Native com Expo) será usado principalmente por **garçons e equipe da cozinha**, para **criar, acompanhar e atualizar pedidos** em tempo real, consumindo os dados da **API Node.js + Firebase Realtime Database**.

---

## 🧩 Fluxo Geral do Restaurante

LINK POSTMAN: https://app.getpostman.com/join-team?invite_code=07edb3fe18dadb239391dff0b878a6b705426ce8668624355605062dbd4c2e15&target_code=84b93b66a5aaa2ac1c05c7d7319f0646

### 1. 🪑 Cliente chega → Mesa é ocupada
- O garçom **seleciona uma mesa livre** no app.  
- O sistema **cria ou recupera** a mesa com o status inicial `"livre"`.  
- Ao registrar o primeiro pedido, a mesa muda automaticamente para `"aguardando preparo"`.

📱 **Telas envolvidas:**
- **Tela de Mesas:**  
  Mostra todas as mesas e seus status visuais:
  - 🟢 Livre  
  - 🟡 Em preparo  
  - 🔵 Servindo  
  - 🔴 Conta sendo fechada  

**Exemplo visual:**

| Mesa | Status |
|------|---------|
| 🟢 Mesa 1 | Livre |
| 🔵 Mesa 2 | Servindo |
| 🟡 Mesa 3 | Em preparo |
| 🔴 Mesa 4 | Conta sendo fechada |

---

### 🔗 **Endpoints Relacionados**

#### ➕ Criar nova mesa  
**POST** `/tables`
```json
{
  "number": 1
}
🔍 Listar mesas
GET /tables

🔄 Atualizar status da mesa
(geralmente feito automaticamente ao mudar o pedido)
PUT /tables/:id/status

2. 🧾 Garçom cria o pedido
O garçom clica em uma mesa e acessa a tela de novo pedido.

Ele escolhe os itens do cardápio (pratos, bebidas, sobremesas, etc).

O app envia o pedido completo para o backend.

O sistema calcula o total e muda o status da mesa automaticamente.

📱 Telas envolvidas:

Tela de Produtos / Cardápio:
Exibe os produtos cadastrados no Firebase via API.

🔗 Endpoints Relacionados
📋 Listar produtos (para exibir o cardápio)
GET /products

➕ Criar produto (apenas admin)
POST /products

json
Copiar código
{
  "name": "Filé à Parmegiana",
  "category": "Prato Principal",
  "price": 39.90,
  "available": true
}
➕ Criar pedido
POST /orders

json
Copiar código
{
  "table": "1",
  "items": [
    { "productId": "-Nk12abc", "name": "Filé à Parmegiana", "quantity": 2, "price": 39.90 },
    { "productId": "-Nk13def", "name": "Coca-Cola Lata", "quantity": 2, "price": 6.00 }
  ]
}
✅ Resposta esperada:

json
Copiar código
{
  "id": "-Nk56xyz",
  "table": "1",
  "status": "pendente",
  "total": 91.8
}
3. 👨‍🍳 Pedido vai para a cozinha
Assim que o garçom confirma o pedido, ele aparece automaticamente na tela da cozinha.

A equipe da cozinha visualiza todos os pedidos pendentes e pode mudar o status conforme o progresso.

📱 Tela da Cozinha:

less
Copiar código
🍽️ Pedidos em preparo

#1023 — Mesa 5
- Filé à Parmegiana (2)
- Coca-Cola (2)
⏰ 14:22
Status: PENDENTE

[Marcar como EM PREPARO]
🔗 Endpoints Relacionados
🔍 Listar pedidos (para tela da cozinha)
GET /orders

🔄 Atualizar status do pedido
PUT /orders/:id/status

json
Copiar código
{
  "status": "em preparo"
}
✅ Resposta esperada:

json
Copiar código
{
  "id": "-Nk56xyz",
  "status": "em preparo"
}
4. 🧍‍♂️ Garçom recebe notificação → Pedido pronto
Quando a cozinha altera o status para "pronto", o garçom é notificado.

Ele leva o pedido até a mesa e marca como "entregue".

📱 Tela do Pedido Atualizado:

csharp
Copiar código
Mesa 5 — Pedido #1023
Status: ✅ PRONTO PARA ENTREGA
⏰ 14:45

[Marcar como ENTREGUE]
🔗 Endpoints Relacionados
🔄 Atualizar status do pedido para entregue
PUT /orders/:id/status

json
Copiar código
{
  "status": "entregue"
}
✅ Resposta esperada:

json
Copiar código
{
  "id": "-Nk56xyz",
  "status": "entregue"
}
5. 💰 Cliente pede a conta
O garçom acessa o pedido finalizado e encerra a mesa.

O app marca o pedido como "finalizado" e libera a mesa automaticamente.

📱 Tela de Finalização:

makefile
Copiar código
Mesa 5 — Pedido #1023
Total: R$91,80
Status: ENTREGUE

[Fechar Conta]
Após encerrar:

Copiar código
✅ Mesa 5 agora está LIVRE
🔗 Endpoints Relacionados
🔄 Atualizar status do pedido para finalizado
PUT /orders/:id/status

json
Copiar código
{
  "status": "finalizado"
}
🟢 Mesa liberada automaticamente
PUT /tables/:id/status

json
Copiar código
{
  "status": "livre"
}
🧭 Mapa de Telas (Fluxo Visual do App)
bash
Copiar código
🏠 Tela Inicial (Mesas)
   ├── 🍴 Criar Mesa → POST /tables
   ├── 📋 Listar Mesas → GET /tables
   └── 👁️ Ver Mesa
         ├── ➕ Novo Pedido → POST /orders
         │     ├── 🧾 Listar Produtos → GET /products
         │     └── ✅ Confirmar Pedido
         └── 🔄 Atualizar Pedido → PUT /orders/:id/status
🧑‍🍳 Perfis de Usuário e Regras
Tipo de Usuário	Funções	Endpoints Usados
Garçom	Cria pedidos, entrega pedidos, encerra mesas	/tables, /orders, /orders/:id/status
Cozinha	Visualiza pedidos, atualiza status para “em preparo” e “pronto”	/orders, /orders/:id/status
Administrador	Gerencia cardápio e produtos	/products, /tables

📊 Exemplo de Fluxo Completo
Etapa	Pedido	Mesa	Ação	Endpoint
1	Criado (pendente)	aguardando preparo	Garçom cria pedido	POST /orders
2	em preparo	em preparo	Cozinha inicia preparo	PUT /orders/:id/status
3	pronto	pronto	Cozinha finaliza	PUT /orders/:id/status
4	entregue	servindo	Garçom entrega	PUT /orders/:id/status
5	finalizado	livre	Conta encerrada	PUT /orders/:id/status

📲 Sugestão de Telas
🏠 Tela de Mesas
Endpoint: GET /tables

css
Copiar código
[Mesa 1] 🟢 Livre
[Mesa 2] 🟡 Em Preparo
[Mesa 3] 🔵 Servindo
[Mesa 4] 🔴 Conta
🍽️ Tela de Pedido
Endpoints:

GET /products (listar cardápio)

POST /orders (criar pedido)

bash
Copiar código
🍔 Pratos
[+] Filé à Parmegiana  R$39,90
[+] Lasanha Bolonhesa  R$32,00

🍹 Bebidas
[+] Coca-Cola Lata  R$6,00
🧾 Tela de Resumo do Pedido
Endpoint: POST /orders

nginx
Copiar código
Mesa 3 — Pedido #1012

Itens:
- Lasanha (2x) = R$64,00
- Coca-Cola (2x) = R$12,00

Total: R$76,00

[Confirmar Pedido]
👨‍🍳 Tela da Cozinha
Endpoints:

GET /orders (listar todos)

PUT /orders/:id/status (atualizar andamento)

less
Copiar código
#1012 — Mesa 3
Itens:
- Lasanha (2)
- Coca-Cola (2)
⏰ 14:22

[Em Preparo] [Pronto]
💰 Tela de Finalização
Endpoint: PUT /orders/:id/status

makefile
Copiar código
Mesa 3 — Pedido #1012
Total: R$76,00
Status: ENTREGUE

[Fechar Conta]
⚡ Funcionalidades Futuras
Histórico de pedidos por dia/mês

Controle de garçons e turnos

Dashboard de produtos mais vendidos

Relatórios financeiros

Notificações push (Expo)

Impressão de comanda (via Bluetooth)

💡 Resumo
O app atua como painel digital do restaurante, substituindo comandas de papel.
O fluxo de informações é centralizado na API Node.js, que usa o Firebase Realtime Database para sincronização em tempo real.

Tudo gira em torno de:

Pedidos vinculados a Mesas

Status sincronizados (pedido ↔ mesa)

Atualização automática entre garçom e cozinha.

yaml
Copiar código

---

Quer que eu adicione também um **diagrama visual (imagem)** mostrando o fluxo (Mesa → Pedido → Cozinha → Entrega → Conta) para colocar logo abaixo do resumo? Isso deixaria o README ainda mais didático.






