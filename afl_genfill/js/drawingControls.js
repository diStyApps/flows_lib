export function setupDrawingControls(canvas, drawToggleBtn, uploadBtn) {
    function createBrushPreview() {
        return new fabric.Circle({
            radius: canvas.freeDrawingBrush.width / 2,
            fill: 'rgba(255, 255, 255, 1)',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
        });
    }

    function updateBrushPreviewPosition(event) {
        var pointer = canvas.getPointer(event.e);
        window.brushPreview.set({ left: pointer.x, top: pointer.y });
        canvas.renderAll();
    }

    function updateBrushWidth(event) {
        var delta = event.e.deltaY;
        var newWidth = canvas.freeDrawingBrush.width + delta * -0.1;
        newWidth = Math.max(1, Math.min(newWidth, 100));
        canvas.freeDrawingBrush.width = newWidth;
        window.brushPreview.set({ radius: newWidth / 2 });
        event.e.preventDefault();
        canvas.renderAll();
    }

    function toggleDraw() {
        if (canvas.isDrawingMode) {
            deactivateDraw();
        } else {
            activateDraw();
        }
    }

    function activateDraw() {
        drawToggleBtn.classList.add('menu-btn-active');
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = 'rgba(255, 255, 255, 1)';
        canvas.freeDrawingBrush.width = 30;
        if (!window.brushPreview) {
            window.brushPreview = createBrushPreview();
            canvas.add(window.brushPreview);
        }
        canvas.lowerCanvasEl.parentElement.classList.add('source-over');
        canvas.on('mouse:move', updateBrushPreviewPosition);
        canvas.on('mouse:wheel', updateBrushWidth);
    }

    function deactivateDraw() {
        drawToggleBtn.classList.remove('menu-btn-active');
        canvas.isDrawingMode = false;
        canvas.lowerCanvasEl.parentElement.classList.remove('source-over');
        canvas.remove(window.brushPreview);
    }

    drawToggleBtn.addEventListener('click', toggleDraw);

    uploadBtn.addEventListener('click', async function () {
        if (!canvas) {
            console.error("Canvas not initialized");
            return;
        }

        canvas.getElement().toBlob(async function (blob) {
            const formData = new FormData();
            formData.append('image', blob, 'drawing.png');

            try {
                const response = await fetch('/upload/image', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Upload successful", result.name);
                    alert("Image uploaded successfully!");
                } else {
                    const errorResult = await response.json();
                    console.error("Upload failed", errorResult.message);
                    alert("Upload failed: " + errorResult.message);
                }
            } catch (error) {
                console.error("Error during upload", error);
                alert("Error during upload: " + error.message);
            }
        }, 'image/png');
    });
}
