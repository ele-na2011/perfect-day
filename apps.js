// background drag
const field = document.querySelector(".field");

let isDragging = false;
let X = 0;
let Y = 0;
let bgX = 0;
let bgY = 0;

field.addEventListener("mousedown", (e) => {
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

    const fieldWidth = field.offsetWidth;
    const fieldHeight = field.offsetHeight;

    const imageWidth = 1600;

    const imageHeight = 900;

    const minX = fieldWidth - imageWidth;
    const minY = fieldHeight - imageHeight;

    newX = Math.min(0, Math.max(minX, newX));
    newY = Math.min(0, Math.max(minY, newY));

    field.style.backgroundPosition = `${newX}px ${newY}px`;
});

document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - X;
    const dy = e.clientY - Y;

    bgX += dx;
    bgY += dy;

    const minX = field.offsetWidth - 1600;
    const minY = field.offsetHeight - 900;

    bgX = Math.min(0, Math.max(minX, bgX));
    bgY = Math.min(0, Math.max(minY, bgY));

    isDragging = false;
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