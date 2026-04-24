const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 🔑 USE KEY (SECURE)
exports.useKey = functions.https.onCall(async (data, context) => {

  if (!context.auth) throw new Error("Not logged in");

  const uid = context.auth.uid;
  const key = data.key;

  const keyRef = db.collection("keys").doc(key);
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (t) => {

    const keyDoc = await t.get(keyRef);
    if (!keyDoc.exists) throw new Error("Invalid key");

    const k = keyDoc.data();
    if (k.used) throw new Error("Key already used");

    const userDoc = await t.get(userRef);
    let balance = userDoc.data().balance || 0;

    balance += k.coins;

    t.update(userRef, { balance });
    t.update(keyRef, { used: true, usedBy: uid });

    return { success: true };
  });
});


// 🛒 BUY SYSTEM (SECURE)
exports.buyStock = functions.https.onCall(async (data, context) => {

  if (!context.auth) throw new Error("Login required");

  const uid = context.auth.uid;
  const stockId = data.id;

  const stockRef = db.collection("stocks").doc(stockId);
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (t) => {

    const stockDoc = await t.get(stockRef);
    if (!stockDoc.exists) throw new Error("Not found");

    const stock = stockDoc.data();
    if (stock.sold) throw new Error("Already sold");

    const userDoc = await t.get(userRef);
    let balance = userDoc.data().balance || 0;

    if (balance < stock.price) throw new Error("Not enough balance");

    balance -= stock.price;

    t.update(userRef, { balance });
    t.update(stockRef, {
      sold: true,
      buyer: uid
    });

    t.create(db.collection("history").doc(), {
      user: uid,
      item: stock.username + "|" + stock.password,
      price: stock.price,
      date: Date.now()
    });

    return {
      success: true,
      account: stock.username + " | " + stock.password
    };
  });
});
