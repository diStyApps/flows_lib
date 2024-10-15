export function initializeZoomControls(canvas) {
    document.getElementById('zoom-in-btn').addEventListener('click', function () {
        canvas.setZoom(canvas.getZoom() * 1.1);
        canvas.renderAll();
    });

    document.getElementById('zoom-out-btn').addEventListener('click', function () {
        canvas.setZoom(canvas.getZoom() * 0.9);
        canvas.renderAll();
    });

    document.getElementById('reset-zoom-btn').addEventListener('click', function () {
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.setZoom(1);
        canvas.renderAll();
    });

    canvas.on('mouse:wheel', function (opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.min(Math.max(zoom, 0.1), 20);

        if (opt.e.ctrlKey) {
            var pointer = canvas.getPointer(opt.e, true);
            var zoomPoint = new fabric.Point(pointer.x, pointer.y);

            if (delta > 0) {
                canvas.zoomToPoint(zoomPoint, zoom / 1.1);
            } else {
                canvas.zoomToPoint(zoomPoint, zoom * 1.1);
            }
        }

        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    canvas.forEachObject(function (object) {
        object.selectable = false;
    });

    let isPanning = false;
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && !isPanning) {
            isPanning = true;
            canvas.defaultCursor = 'grab';
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    });

    document.addEventListener('keyup', function (e) {
        if (e.code === 'Space' && isPanning) {
            isPanning = false;
            canvas.defaultCursor = 'default';
        }
    });

    canvas.on('mouse:down', function (opt) {
        if (isPanning) {
            var evt = opt.e;
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
        }
    });

    canvas.on('mouse:move', function (opt) {
        if (this.isDragging) {
            var e = opt.e;
            var vpt = this.viewportTransform;
            vpt[4] += e.clientX - this.lastPosX;
            vpt[5] += e.clientY - this.lastPosY;
            this.requestRenderAll();
            this.lastPosX = e.clientX;
            this.lastPosY = e.clientY;
        }
    });

    canvas.on('mouse:up', function (opt) {
        this.isDragging = false;
        this.lastPosX = null;
        this.lastPosY = null;
        this.setCursor('default');
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete') {
            var activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
                canvas.requestRenderAll();
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === '0') {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.setZoom(1);
            canvas.renderAll();
        }
    });
}

