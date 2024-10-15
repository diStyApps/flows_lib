export function addImageCompareSlider(canvas, img) {
    const imageWidth = img.scaleX * img.width;
    const imageHeight = img.scaleY * img.height;
    const leftEdge = img.left - imageWidth / 2;
    const rightEdge = img.left + imageWidth / 2;
    const topMargin = 23;
    const bottomMargin = 23;

    let line = new fabric.Line([img.left, 0, img.left, canvas.height], {
        id: 'sliderLine',
        stroke: '#570d7b',
        strokeWidth: 2,
        selectable: false,
        hasControls: false,
        evented: true,
        originX: 'center',
        visible: true
    });
    canvas.add(line);

    let sliderHandle = new fabric.Circle({
        id: 'sliderHandle',
        left: img.left,
        top: canvas.height / 2,
        radius: 18,
        fill: '#570d7b',
        stroke: '#fff',
        strokeWidth: 4,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasBorders: false,
        hasControls: false,
    });

    canvas.add(sliderHandle);
    canvas.bringToFront(sliderHandle);

    function updateClipPath() {
        line.set({ left: sliderHandle.left });
        img.clipPath = new fabric.Rect({
            originX: 'left',
            originY: 'top',
            left: leftEdge,
            top: 0,
            width: sliderHandle.left - leftEdge,
            height: canvas.height,
            absolutePositioned: true
        });
        canvas.requestRenderAll();
    }

    updateClipPath();

    canvas.on('object:moving', function (e) {
        if (e.target === sliderHandle) {
            let newY = Math.max(topMargin, Math.min(sliderHandle.top, canvas.height - bottomMargin));
            let newX = Math.max(leftEdge, Math.min(sliderHandle.left, rightEdge));
            sliderHandle.set({ top: newY, left: newX });
            updateClipPath();
        }
    });

    sliderHandle.on('mousedblclick', function () {
        line.visible = !line.visible;
        canvas.requestRenderAll();
    });

    let animating = false;
    let pingPong = true;
    let moveRight = true;

    function animateSlider() {
        animating = true;
        let leftEdge = img.left - (img.scaleX * img.width) / 2;
        let rightEdge = img.left + (img.scaleX * img.width) / 2;

        let startPosition = sliderHandle.left;
        let endValue = moveRight ? rightEdge : leftEdge;
        let distance = Math.abs(endValue - startPosition);
        let duration = (distance / (rightEdge - leftEdge)) * 1500;

        fabric.util.animate({
            startValue: startPosition,
            endValue: endValue,
            duration: duration,
            onChange: function (value) {
                if (!animating) return;
                let adjustedValue = Math.max(leftEdge, Math.min(value, rightEdge));
                sliderHandle.set({ left: adjustedValue });
                line.set({ left: adjustedValue });
                updateClipPath();
            },
            onComplete: function () {
                if (pingPong && animating) {
                    moveRight = !moveRight;
                    animateSlider();
                } else {
                    animating = false;
                    updateClipPath();
                    sliderHandle.setCoords();
                }
            }
        });
    }

    canvas.on('mouse:dblclick', function (e) {
        if (e.target !== sliderHandle) {
            if (!animating) {
                animateSlider();
            } else {
                animating = false;
                sliderHandle.setCoords();
            }
        }
    });
}
