async function getCode() {
  const number = document.getElementById("num").value;

  document.getElementById("status").innerText = "Generating...";

  const res = await fetch("/api/pair", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number })
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("code").innerText = data.pairingCode;
    document.getElementById("status").innerText = "Success";
  } else {
    document.getElementById("status").innerText = data.error;
  }
}
