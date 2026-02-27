const API = "https://script.google.com/macros/s/AKfycbwWa0WNM5koQ2xt4tc5ABb9HTBJXxjQSIrZAp0Fa6UG0sxV8FW4Zo_X6fXRG8TVWde4/exec"; 

let lastValue = "";
let idleTimeout = null;

const qrContainer = document.getElementById('q');
const amtEl = document.getElementById('a');
const nameEl = document.getElementById('n');

function setIdle() {
    // Add exit animation class to current QR if it exists
    const currentImg = qrContainer.querySelector('img');
    if (currentImg) {
        currentImg.classList.add('qr-exit');
        setTimeout(renderIdleUI, 500);
    } else {
        renderIdleUI();
    }
}

function renderIdleUI() {
    nameEl.innerText = "System Standby";
    amtEl.innerText = "0";
    qrContainer.innerHTML = `
        <div class="idle-ui">
            <div class="scanner-line"></div>
            <p class="status-text">AWAITING SIGNAL</p>
        </div>`;
    lastValue = "IDLE";
}

async function update() {
    try {
        const response = await fetch(`${API}?t=${Date.now()}`);
        if (!response.ok) return;
        
        const data = await response.json();
        const live = data.live;

        if (!live || !live.upiid || !live.amount || live.amount == 0) {
            if (lastValue !== "IDLE") setIdle();
            return;
        }

        const currentValue = live.amount + live.upiid;
        
        if (currentValue !== lastValue) {
            if (idleTimeout) clearTimeout(idleTimeout);

            const upiString = `upi://pay?pa=${live.upiid}&pn=${encodeURIComponent(live.name)}&am=${live.amount}&cu=INR`;
            const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiString)}&size=400&margin=2&ecLevel=H`;

            const tempImg = new Image();
            tempImg.src = qrUrl;
            
            tempImg.onload = () => {
                // Update text with Pop
                amtEl.innerText = live.amount;
                amtEl.parentElement.classList.remove('pop-effect');
                void amtEl.parentElement.offsetWidth; // Trigger reflow
                amtEl.parentElement.classList.add('pop-effect');

                nameEl.innerText = live.name;
                
                // Switch QR with clean animation
                qrContainer.innerHTML = '';
                qrContainer.appendChild(tempImg);
                
                lastValue = currentValue;

                // Auto-idle after 2 minutes
                idleTimeout = setTimeout(setIdle, 120000);
            };
        }
    } catch (error) {
        console.error("3D Sync Error:", error);
    }
}

// Start polling
setInterval(update, 2000);
update();