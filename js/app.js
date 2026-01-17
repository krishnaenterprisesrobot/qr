const API = "https://script.google.com/macros/s/AKfycbwWa0WNM5koQ2xt4tc5ABb9HTBJXxjQSIrZAp0Fa6UG0sxV8FW4Zo_X6fXRG8TVWde4/exec";

let lastValue = "";
let idleTimeout;

function setIdle() {
    document.getElementById('n').innerText = "System Ready";
    document.getElementById('a').innerText = "0";
    document.getElementById('q').innerHTML =
        `<div class="idle-msg">Waiting for QR...</div>`;
    lastValue = "IDLE";
}

async function update() {
    try {
        const response = await fetch(`${API}?t=${Date.now()}`);
        const data = await response.json();

        if (!data.live.upiid || !data.live.amount || data.live.amount == 0) {
            if (lastValue !== "IDLE") setIdle();
            return;
        }

        const currentValue = data.live.amount + data.live.upiid;
        if (currentValue !== lastValue) {

            clearTimeout(idleTimeout);

            document.getElementById('n').innerText = data.live.name;
            document.getElementById('a').innerText = data.live.amount;

            const upi = `upi://pay?pa=${data.live.upiid}&pn=${encodeURIComponent(data.live.name)}&am=${data.live.amount}&cu=INR`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upi)}`;

            document.getElementById('q').innerHTML =
                `<img src="${qrUrl}" alt="QR Code">`;

            lastValue = currentValue;
            idleTimeout = setTimeout(setIdle, 120000);
        }

    } catch (e) {
        document.getElementById('n').innerText = "Offline - Retrying...";
    }
}

update();
setInterval(update, 3000);
