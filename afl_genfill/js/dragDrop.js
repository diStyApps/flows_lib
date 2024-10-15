
export function initializeDragDropHandlers(dropArea, addImageToCanvas, showSpinner, hideSpinner, workflow) {
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', async (e) => {
        showSpinner();
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (!file) {
            console.log("No file selected.");
            hideSpinner();
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const imageUrl1 = event.target.result;
            addImageToCanvas(imageUrl1, 'DroppedImage', false, true, true, 'back', true);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload/image', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                workflow["87"]["inputs"]["image"] = result.name;
                hideSpinner();
            } else {
                console.error("Upload failed", result.message);
                hideSpinner();
            }
        } catch (error) {
            console.error("Error during upload", error);
            hideSpinner();
        }
    });
}