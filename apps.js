

const backpack = document.getElementById("backpack");
const grabber = backpack ? backpack.querySelector(".grabber") : null;

const closedOffset = 210;
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