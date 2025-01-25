// lib/api.ts
export async function fetchStages() {
    const response = await fetch("/api/stage");
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des stages");
    }
    return response.json();
  }
  
  export async function createPaymentIntent(stage) {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: stage.price * 100, currency: "eur" }),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la création de PaymentIntent");
    }
    return response.json();
  }
  
  export async function registerUser(data) {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'inscription");
    }
    return response.json();
  }
  
  export async function sendConfirmationEmail(data) {
    const response = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi de l'email de confirmation");
    }
    return response.json();
  }
  