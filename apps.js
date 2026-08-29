const backpack = document.getElementById("backpack");
const grabber = backpack ? backpack.querySelector(".grabber") : null;

const closedOffset = 260;
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
    const match = backpack.style.transform.match(/translateY\(([-\d.]+)px\)/);
    return match ? Number(match[1]) : 0;
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