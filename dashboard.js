import { auth } from "./firebase.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const functions = getFunctions();

const useKeyFunc = httpsCallable(functions, "useKey");
const buyFunc = httpsCallable(functions, "buyStock");

// 🔑 USE KEY
window.useKey = async () => {
  try {
    const res = await useKeyFunc({ key: keyInput.value });
    alert("Coins added!");
  } catch (e) {
    alert(e.message);
  }
};

// 🛒 BUY
window.buy = async (id) => {
  try {
    const res = await buyFunc({ id });
    alert("SUCCESS\n" + res.data.account);
  } catch (e) {
    alert(e.message);
  }
};
