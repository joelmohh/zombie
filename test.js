const API_URL =
  "https://hackatime.hackclub.com/api/hackatime/v1/users/current/heartbeats";

const API_KEY = "c31551b9-4b0f-493e-b05d-910b4a447604"; 
const PROJECT = "zombie";
const ENTITY = "main.js";
const LANGUAGE = "JavaScript";

const INTERVAL_MS = 1 * 60 * 1000; 
const TOTAL_HOURS = 2;
const TOTAL_MS = TOTAL_HOURS * 60 * 60 * 1000;

let intervalId;

async function sendHeartbeat() {
  const heartbeat = {
    entity: ENTITY,
    type: "file",
    project: PROJECT,
    language: LANGUAGE,
    time: Date.now() / 1000, 
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(heartbeat),
    });

    const text = await res.text();
    console.log("Heartbeat enviado:", res.status, text);
    if(res.status !== 202) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Erro ao enviar heartbeat:", err);
  }
}

function start() {
  console.log("Iniciando heartbeats para Hackatime…");

  // envia o primeiro imediatamente
  sendHeartbeat();

  // continua enviando
  intervalId = setInterval(sendHeartbeat, INTERVAL_MS);

  // agenda parada após 5 horas
  setTimeout(async () => {
    clearInterval(intervalId);

    // envia um último heartbeat no final
    await sendHeartbeat();
    console.log(`Parado após ${TOTAL_HOURS} horas.`);
    process.exit(0);
  }, TOTAL_MS);
}

start();