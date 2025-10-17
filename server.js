const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gourmet-go-16bac-default-rtdb.firebaseio.com/", // coloque sua URL do Realtime Database
});

const db = admin.database();

// ===============================
// ROTAS DE PRODUTOS
// ===============================
app.get("/products", async (req, res) => {
  try {
    const snapshot = await db.ref("products").once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/products", async (req, res) => {
  try {
    const { name, category, price, available = true } = req.body;
    const ref = db.ref("products").push();
    await ref.set({ name, category, price, available });
    res.json({ id: ref.key, name, category, price, available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ROTAS DE MESAS
// ===============================
app.get("/tables", async (req, res) => {
  try {
    const snapshot = await db.ref("tables").once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tables", async (req, res) => {
  try {
    const { number } = req.body;
    await db.ref(`tables/${number}`).set({
      number,
      status: "livre",
      lastOrderId: null,
    });
    res.json({ number, status: "livre" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ROTAS DE PEDIDOS
// ===============================
app.get("/orders", async (req, res) => {
  try {
    const snapshot = await db.ref("orders").once("value");
    res.json(snapshot.val() || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { table, items } = req.body;

    if (!table || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Dados do pedido inválidos." });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Cria pedido
    const orderRef = db.ref("orders").push();
    const orderData = {
      table,
      status: "pendente",
      items,
      total,
      createdAt: new Date().toISOString(),
    };
    await orderRef.set(orderData);

    // Atualiza mesa com status e último pedido
    await db.ref(`tables/${table}`).update({
      status: "aguardando preparo",
      lastOrderId: orderRef.key,
    });

    res.json({ id: orderRef.key, ...orderData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ATUALIZAR STATUS DO PEDIDO
// ===============================
app.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Status é obrigatório." });

    const orderRef = db.ref(`orders/${id}`);
    const orderSnap = await orderRef.once("value");
    const orderData = orderSnap.val();

    if (!orderData) return res.status(404).json({ error: "Pedido não encontrado." });

    await orderRef.update({ status });

    // Atualiza mesa conforme status do pedido
    const tableRef = db.ref(`tables/${orderData.table}`);
    let tableStatus = "";

    switch (status) {
      case "pendente":
        tableStatus = "aguardando preparo";
        break;
      case "em preparo":
        tableStatus = "em preparo";
        break;
      case "pronto":
        tableStatus = "aguardando entrega";
        break;
      case "entregue":
        tableStatus = "ocupada";
      case "finalizado":
        tableStatus = "livre";
        break;
      default:
        tableStatus = "ocupada";
        break;
    }

    await tableRef.update({ status: tableStatus });

    res.json({ id, status, tableStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🔥 API Restaurante rodando na porta 3000"));
