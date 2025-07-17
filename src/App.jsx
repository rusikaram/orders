// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";

const ITEMS = [
  { name: "South Indian mixture (250GMS)", price: 90 },
  { name: "Omapodi (250GMS)", price: 90 },
  { name: "Mullu murukku (250GMS)", price: 90 },
  { name: "Thenkuzhal (250GMS)", price: 90 },
  { name: "Ribbon pakoda (250GMS)", price: 90 },
  { name: "Kaaraboondhi (250GMS)", price: 90 },
  { name: "Butter murukku (250GMS)", price: 100 },
  { name: "Karasev (250GMS)", price: 90 },
  { name: "Ragi ribbon pakoda (250GMS)", price: 95 },
  { name: "Kambu mullu murukku (250GMS)", price: 95 },
];

const App = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentDone: false,
    orderDate: new Date().toISOString().split("T")[0],
    items: ITEMS.map((item) => ({ ...item, quantity: 0 })),
  });
  const [customerDB, setCustomerDB] = useState({});

  useEffect(() => {
    const savedDB = JSON.parse(localStorage.getItem("customerDB") || "{}");
    setCustomerDB(savedDB);
  }, []);

  useEffect(() => {
    localStorage.setItem("customerDB", JSON.stringify(customerDB));
  }, [customerDB]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(savedOrders);
  }, []);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const savedForm = localStorage.getItem("currentForm");
    if (savedForm) {
      setForm(JSON.parse(savedForm));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentForm", JSON.stringify(form));
  }, [form]);

  const handleQuantityChange = (index, value) => {
    const newItems = [...form.items];
    newItems[index].quantity = parseInt(value) || 0;
    setForm({ ...form, items: newItems });
  };

  const handlePhoneChange = (phone) => {
    const data = customerDB[phone] || {};
    setForm({
      ...form,
      phone,
      name: data.name || "",
      address: data.address || "",
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone) return alert("Name and phone required");

    const order = { ...form };
    setOrders([...orders, order]);
    setCustomerDB({
      ...customerDB,
      [form.phone]: { name: form.name, address: form.address },
    });
    setForm({
      name: "",
      phone: "",
      address: "",
      paymentDone: false,
      orderDate: new Date().toISOString().split("T")[0],
      items: ITEMS.map((item) => ({ ...item, quantity: 0 })),
    });
    localStorage.removeItem("currentForm");
  };

  const getTotal = (items) =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const grandTotal = orders.reduce((sum, o) => sum + getTotal(o.items), 0);

  const sendWhatsApp = (name, phone, amount) => {
    const msg = `Hi ${name}, your payment of ₹${amount} for Rusikaram order has been received. Thank you! 🙏`;
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="App" style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>🛍️ Rusikaram Orders</h2>
      <input
        type="date"
        value={form.orderDate}
        onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
      />
      <br />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => handlePhoneChange(e.target.value)}
      />
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Address / Landmarks"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={form.paymentDone}
          onChange={(e) =>
            setForm({ ...form, paymentDone: e.target.checked })
          }
        />{" "}
        Payment Received
      </label>
      <hr />
      {form.items.map((item, i) => (
        <div key={i}>
          <strong>
            {item.name} – ₹{item.price} per 250g:
          </strong>{" "}
          <input
            type="number"
            min="0"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(i, e.target.value)}
            style={{ width: 60, marginLeft: 10 }}
          />
        </div>
      ))}
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        ➕ Add Order
      </button>
      <hr />
      <h3>📦 Orders Summary</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div>
          {orders.map((o, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>
                {o.orderDate} – {o.name} ({o.phone}) – ₹
                {getTotal(o.items)}
              </strong>
              <br />
              📍 {o.address}
              {o.items
                .filter((item) => item.quantity > 0)
                .map((item, idx) => (
                  <div key={idx}>
                    {item.name}: {item.quantity} packs = ₹
                    {item.quantity * item.price}
                  </div>
                ))}
              <div>
                🧮 Total Weight:{" "}
                {o.items.reduce((sum, item) => sum + item.quantity * 250, 0)}g
              </div>
              <div>
                💰 Payment:{" "}
                {o.paymentDone ? "✅ Received" : "❌ Pending"}
              </div>
              {o.paymentDone && (
                <button
                  onClick={() =>
                    sendWhatsApp(o.name, o.phone, getTotal(o.items))
                  }
                >
                  📲 Notify via WhatsApp
                </button>
              )}
            </div>
          ))}
          <h4>Grand Total: ₹{grandTotal}</h4>
        </div>
      ))}
    </div>
  );
};

export default App;
