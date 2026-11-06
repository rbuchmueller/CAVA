
(() => {
  const shell = document.querySelector(".dashboard-shell");
  const handle = document.getElementById("forceResizeHandle");

  if (!shell || !handle) return;

  const minHeight = 150;
  let startY = 0;
  let startHeight = 0;
  let dragging = false;

  const clamp = (value) => {
    const maxHeight = Math.max(
      minHeight,
      Math.min(window.innerHeight * 0.65, shell.clientHeight * 0.75)
    );

    return Math.max(minHeight, Math.min(value, maxHeight));
  };

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    dragging = true;
    startY = event.clientY;
    startHeight =
      document.querySelector(".force-section").getBoundingClientRect().height;

    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const delta = startY - event.clientY;
    const height = clamp(startHeight + delta);

    shell.style.setProperty("--relationship-height", `${height}px`);
  });

  const stopDragging = () => {
    dragging = false;
  };

  handle.addEventListener("pointerup", stopDragging);
  handle.addEventListener("pointercancel", stopDragging);

  // Double-click to restore the default size.
  handle.addEventListener("dblclick", () => {
    shell.style.removeProperty("--relationship-height");
  });
})();
