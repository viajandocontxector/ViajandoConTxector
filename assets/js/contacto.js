document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Guardamos el tiempo de carga del formulario
  const startInput = document.getElementById("form_start");
  startInput.value = Date.now();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    // Antispam: honeypot
    if (data.website) {
      alert("Error al enviar el formulario.");
      return;
    }

    // Antispam: tiempo mínimo
    const elapsed = Date.now() - Number(data.form_start);
    if (elapsed < 1500) {
      alert("Error al enviar el formulario.");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.ok) {
      window.location.href = "/gracias";
    } else {
      alert("Error al enviar el mensaje. Inténtalo más tarde.");
    }
  });
});
