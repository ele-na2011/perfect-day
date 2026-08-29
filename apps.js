// happiness tracker, coins tracker, function later
let happiness = 0;
let coins = 0;

const gameMusic = document.getElementById("bg-music");

if (gameMusic) {
    gameMusic.volume = 0.25;

    const startMusic = () => {
        gameMusic.play().catch(() => {
            // autoplay may be blocked until the user interacts with the page
        });
    };

    document.addEventListener("pointerdown", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });
}

// background drag + item placement
const field = document.querySelector(".field");
const placedItems = document.querySelector(".placed-items");
const inventoryItems = document.querySelectorAll(".item");

let isDragging = false;
let X = 0;
let Y = 0;
let bgX = 0;
let bgY = 0;

const imageWidth = 2500;
const imageHeight = 1350;

// move the map
field.addEventListener("mousedown", (e) => {
    if (e.target.closest(".placed-item")) return;
    if (e.target.closest(".item")) return;

    isDragging = true;
    X = e.clientX;
    Y = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - X;
    const dy = e.clientY - Y;

    let newX = bgX + dx;
    let newY = bgY + dy;

    const minX = field.offsetWidth - imageWidth;
    const minY = field.offsetHeight - imageHeight;

    newX = Math.min(0, Math.max(minX, newX));
    newY = Math.min(0, Math.max(minY, newY));

    bgX = newX;
    bgY = newY;

    field.style.backgroundPosition = `${bgX}px ${bgY}px`;

    placedItems.style.left = `${bgX}px`;
    placedItems.style.top = `${bgY}px`;
    
    X = e.clientX;
    Y = e.clientY;
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// happiness + coins!!!
function updateHappiness() {
    const happinessText = document.querySelector("#happy-value");
    const happinessBar = document.querySelector("#bar-fill");

    happinessText.textContent = `${happiness}%`;
    happinessBar.style.width = `${happiness}%`;

    const coinsText = document.querySelector("#coins");
    coinsText.textContent = `${coins}`;
}

// create a sticker from the backpack
inventoryItems.forEach((item) => {
    item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const sticker = document.createElement("img");

        sticker.dataset.happiness = item.dataset.happiness;
        sticker.dataset.coins = item.dataset.coins;
        sticker.src = item.src;
        sticker.alt = item.alt;

        happiness += Number(item.dataset.happiness);
        coins += Number(item.dataset.coins);
        updateHappiness();

        sticker.className = "placed-item";

        placedItems.appendChild(sticker);

        const fieldRect = field.getBoundingClientRect();

        const x = e.clientX - fieldRect.left - bgX - 50;
        const y = e.clientY - fieldRect.top - bgY - 50;

        sticker.style.left = `${x}px`;
        sticker.style.top = `${y}px`;

        dragSticker(sticker, e);
    });
});

// move an existing sticker
function dragSticker(sticker, startEvent) {
    let startX = startEvent.clientX;
    let startY = startEvent.clientY;

    const startLeft = parseFloat(sticker.style.left);
    const startTop = parseFloat(sticker.style.top);

    function move(e) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newLeft = startLeft + dx;
        let newTop = startTop + dy;

        const maxX = imageWidth - sticker.offsetWidth;
        const maxY = imageHeight - sticker.offsetHeight;

        newLeft = Math.max(0, Math.min(maxX, newLeft));
        newTop = Math.max(0, Math.min(maxY, newTop));

        sticker.style.left = `${newLeft}px`;
        sticker.style.top = `${newTop}px`;
    }

    function stop() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
}


// prevent map from moving when dragging a sticker
placedItems.addEventListener("mousedown", (e) => {
    const sticker = e.target.closest(".placed-item");

    if (!sticker) return;

    e.preventDefault();
    e.stopPropagation();

    dragSticker(sticker, e);
});


// delete items with double right click :))
let rightClicks = 0;
let rightClickTimer;

placedItems.addEventListener("contextmenu", (e) => {
    const sticker = e.target.closest(".placed-item");

    if (!sticker) return;

    e.preventDefault();

    rightClicks++;

    if (rightClicks === 2) {
        happiness -= Number(sticker.dataset.happiness);
        updateHappiness();
        sticker.remove();

        rightClicks = 0;
        clearTimeout(rightClickTimer);
    }

    rightClickTimer = setTimeout(() => {
        rightClicks = 0;
    }, 400);
});

// backpack grabber
const backpack = document.getElementById("backpack");
const grabber = backpack ? backpack.querySelector(".grabber") : null;

const closedOffset = 200;
let isOpen = true;
let dragging = false;
let startY = 0;
let startOffset = 0;
let activePointerId = null;

function applyOffset(offset, animated = true) {
    backpack.style.transition = animated ? "transform .35s cubic-bezier(.34, 1.3, .64, 1)" : "none";
    backpack.style.transform = `translateX(-50%) translateY(${offset}px)`;
}

function snapToState(openState) {
    isOpen = openState;
    applyOffset(isOpen ? 0 : closedOffset, true);
}

function getCurrentOffset() {
    const transform = backpack ? backpack.style.transform : "";
    if (!transform || transform === "") {
        return 0;
    }
    const startText = "translateY(";
    const startIndex = transform.indexOf(startText);
    if (startIndex === -1) {
        return 0;
    }
    let valueText = "";
    let i = startIndex + startText.length;

    while (i < transform.length) {
        const ch = transform[i];

        if (ch === "p") {
            break;
        }

        if (ch === "-" || ch === "." || (ch >= "0" && ch <= "9")) {
            valueText += ch;
        } else if (valueText !== "") {
            break;
        }

        i++;
    }

    if (valueText === "") {
        return 0;
    }

    const value = Number(valueText);
    return Number.isFinite(value) ? value : 0;
}

if (backpack && grabber) {
    snapToState(true);

    grabber.addEventListener("pointerdown", (e) => {
        dragging = true;
        activePointerId = e.pointerId;
        startY = e.clientY;
        startOffset = getCurrentOffset();
        grabber.setPointerCapture(e.pointerId);
        applyOffset(startOffset, false);
    });

    window.addEventListener("pointermove", (e) => {
        if (!dragging) return;

        const deltaY = e.clientY - startY;
        const nextOffset = Math.min(closedOffset, Math.max(0, startOffset + deltaY));
        applyOffset(nextOffset, false);
    });

    const finishDrag = () => {
        if (!dragging) return;
        dragging = false;

        if (activePointerId !== null && grabber.hasPointerCapture(activePointerId)) {
            grabber.releasePointerCapture(activePointerId);
        }
        activePointerId = null;

        const currentOffset = getCurrentOffset();
        snapToState(currentOffset < closedOffset / 2);
    };

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
}   
// game guide panel toggle
const guideBtn = document.querySelector(".titlebar .pill-btn");
const panel = document.querySelector(".panel");

if (guideBtn && panel) {
    guideBtn.addEventListener("click", () => {
        panel.classList.toggle("open");
    });
}

//time tracker
function updateTime() {
    var currentTime = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });
    var timeText = document.querySelector("#timeElement");
    if (timeText) {
        timeText.innerHTML = currentTime;
    }
}
setInterval(updateTime, 1000);