import Seeder from './Seeder.js';
import StepperComponent  from './Stepper.js';
import { initializeZoomControls } from './zoomControl.js';
import { initializeDragDropHandlers } from './dragDrop.js';
import { setupDrawingControls } from './drawingControls.js';
import { addImageCompareSlider } from './imageCompareSlider.js';
import { loadWorkflow } from './workflowLoader.js';
import { workflowConfig } from './workflowConfig.js';
(async (window, document, undefined) => {
    

    const client_id = uuidv4();
    const workflow = await loadWorkflow('/flow/genfill/js/gen_api_3.json');

    const server_address = window.location.hostname + ':' + window.location.port;
    const socket = new WebSocket('ws://' + server_address + '/ws?clientId=' + client_id);
    socket.addEventListener('open', (event) => {
        console.log('Connected to the server');
    });

    const canvasWidth = 900;
    const canvasHeight = 550;
    const canvas = new fabric.Canvas('canvas', { width: canvasWidth, height: canvasHeight });
    canvas.selection = false;
    const progressbar = document.getElementById('main-progress');
    let imageUrl1 = 'genfill/css/drop_image_rect_no_border.png';
    const dropArea = document.getElementById('drop-area');
    const drawToggleBtn = document.getElementById('draw-toggle-btn');
    const uploadBtn = document.getElementById('upload-btn');

    
    
    function updateWorkflowValue(workflow, pathId, value) {
        const pathConfig = workflowConfig.workflowPaths.find(path => path.id === pathId);
    
        if (pathConfig) {
        const { workflowPath } = pathConfig;
        const [a, b, c] = workflowPath.split('.');
        workflow[a][b][c] = value;
        } else {
        console.warn(`Workflow path not found for ID: ${pathId}`);
        }
    }
    workflowConfig.loaders.forEach(config => {
      const loaderContainer = config.path;
      console.log("loaderContainer", loaderContainer);
    });
    
    workflowConfig.seeders.forEach(config => {
      new Seeder(config.container, config, workflow);
    });
    
    workflowConfig.steppers.forEach(config => {
      new StepperComponent(config.container, config, workflow);
    });
    
    workflowConfig.dropdowns.forEach(loader => {
      const loaderContainer = document.getElementById(loader.id);
      if (loaderContainer) {
        fetch(loader.url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
          })
          .then(data => {
            const loaderData = data[Object.keys(data)[0]];
            if (!loaderData.input.required[loader.key]) {
              return;
            }
            populateDropdown(loader.id, loaderData.input.required[loader.key][0], loader.label, loader.workflowPath, workflow);
          })
          .catch(error => console.error(`Error loading data for ${loader.id}:`, error));
      }
    });
    
    
socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
            updateProgress(data['data']['max'], data['data']['value']);
        } else if (data.type === 'crystools.monitor') {

        } else if (data.type === 'executed' && 'images' in data['data']['output']) {
            const image = data['data']['output']['images'][0];
            const filename = image['filename'];
            const subfolder = image['subfolder'];
            const rand = Math.random();

            if (filename.includes('genfill_bg_pass_3')) {
                const serverImageUrl = `/view?filename=${filename}&type=output&subfolder=${subfolder}&rand=${rand}`;
                addImageToCanvas(serverImageUrl, 'FilledImage', false, false, true, 'back');
                if (!isIdExists('sliderLine')) {
                    addSliderById('DroppedImage');
                }

                hideSpinner();
            }
        } else if (data.type === 'execution_interrupted') {
            hideSpinner();
            console.log('Execution Interrupted');
        } else if (data.type === 'status') {
            updateProgress();
        }
        else {
            // debug log
            // console.log(data);
            // updateProgress();
        }
    } catch (error) {
        if (!error.message.includes("[object Blob]")) {
            hideSpinner();
        }
    }
});




async function queue() {
    workflowConfig.workflowPaths.forEach(pathConfig => {
      const { id } = pathConfig;
      const element = document.getElementById(id.toLowerCase());
  
      if (element) {
        const value = element.value.replace(/(\r\n|\n|\r)/gm, " ");
        updateWorkflowValue(workflow, id, value);
      } else {
        console.warn(`Element not found for ID: ${id}`);
      }
    });
  
    console.log("queue - workflow", workflow);
    await queue_prompt(workflow);
  }


function updateProgress(max = 0, value = 0) {
    progressbar.max = max;
    progressbar.value = value;
}

async function queue_prompt(prompt = {}) {
    const data = { 'prompt': prompt, 'client_id': client_id };
    showSpinner();
    const response = await fetch('/prompt', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

async function queue_interrupt() {
    showSpinner('Interrupting...');
    const data = { 'client_id': client_id };
    try {
        const response = await fetch('/interrupt', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to interrupt the process.');
        }

        const result = await response.json();
        console.log('Interrupted:', result);
    } catch (error) {
        console.error('Error during interrupt:', error);
    } finally {
        hideSpinner();
    }
}

menuButton.addEventListener('click', function () {
    console.log("Queue prompt");
    queue();
});
interruptButton.addEventListener('click', function () {
    console.log("interrupt");
    interrupt();

});

async function interrupt() {
    await queue_interrupt();
}

initializeZoomControls(canvas);
initializeDragDropHandlers(dropArea, addImageToCanvas, showSpinner, hideSpinner, workflow);
addImageToCanvas(imageUrl1, 'DroppedImage', false, true, true, 'back', false);
setupDrawingControls(canvas, drawToggleBtn, uploadBtn);

function addDashedBorders(img) {
    const imageWidth = img.scaleX * img.width;
    const imageHeight = img.scaleY * img.height;
    const leftX = img.left - imageWidth / 2;
    const rightX = img.left + imageWidth / 2;

    const leftBorder = new fabric.Line([leftX, img.top - imageHeight / 2, leftX, img.top + imageHeight / 2], {
        stroke: '#570d7b',
        strokeWidth: 1,
        strokeDashArray: [1, 1],
        selectable: false,
        evented: false,
    });

    const rightBorder = new fabric.Line([rightX, img.top - imageHeight / 2, rightX, img.top + imageHeight / 2], {
        stroke: '#570d7b',
        strokeWidth: 1,
        strokeDashArray: [1, 1],
        selectable: false,
        evented: false,
    });

    canvas.add(leftBorder, rightBorder);
}

function addSliderById(id) {
    var object = canvas.getObjects().find(function (object) {
        return object.id === id;
    });

    if (object) {
        addImageCompareSlider(canvas, object);
    }
}
function addImageToCanvas(imageUrl, id, slider = false, clear = true, deletePreviousImage = true, zIndex, border = false) {
    fabric.Image.fromURL(imageUrl, function (img) {
        img.originalWidth = img.width;
        img.originalHeight = img.height;

        var scaleWidth = canvas.width / img.width;
        var scaleHeight = canvas.height / img.height;
        var scale = Math.min(scaleWidth, scaleHeight);
        img.set({
            id: id,
            scaleX: scale,
            scaleY: scale,
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
        });

        if (deletePreviousImage) {
            var previousImg = getItemById(canvas, id);
            if (previousImg) {
                canvas.remove(previousImg);
            }
        }
        if (clear) {
            canvas.clear();
        }
        canvas.add(img);
        if (border) {
            addDashedBorders(img);
        }
        if (slider) {
            addSliderById(id);
        }
        if (zIndex === 'back') {
            canvas.sendToBack(img);
        } else {
            canvas.bringToFront(img);
        }
        canvas.renderAll();
    });
}

async function populateDropdown(loaderId, items, customLabel, workflowPath, workflow, storeInLocalStorage = true, loadFromWorkflow = false) {
    const container = document.getElementById(loaderId);

    const label = document.createElement('label');
    label.htmlFor = `${loaderId}Dropdown`;
    label.textContent = customLabel;

    const select = document.createElement('select');
    select.id = `${loaderId}Dropdown`;

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item.replace(/\\\\/g, '\\\\\\\\');
        select.appendChild(option);
    });

    const datalist = document.createElement('datalist');
    datalist.id = `${loaderId}List`;

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item.replace(/\\\\/g, '\\\\\\\\');
        datalist.appendChild(option);
    });

    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(datalist);

    applyInitialValue();

    select.addEventListener('change', () => {
        updateSelection(select.value);
    });

    select.addEventListener('mousedown', (event) => {
        handleSelectMousedown(event);
    });

    function applyInitialValue() {
        let initialValue = null;
        if (storeInLocalStorage) {
            initialValue = localStorage.getItem(loaderId);
        }
        if (loadFromWorkflow && !initialValue) {
            initialValue = getValueFromWorkflow(workflow, workflowPath);
        }
        if (initialValue) {
            select.value = initialValue;
            updateSelection(initialValue);
        }
    }

    function updateSelection(value) {
        if (value !== '') {
            updateWorkflow(workflow, workflowPath, value);
            if (storeInLocalStorage) {
                localStorage.setItem(loaderId, value);
            }
        }
    }

    function handleSelectMousedown(event) {
        if (event.target.tagName === 'SELECT' && !searchInput) {
            event.preventDefault();
            createSearchInput();
        }
    }

    let searchInput = null;

    function createSearchInput() {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = `${loaderId}Search`;
        searchInput.setAttribute('list', `${loaderId}List`);
        searchInput.style.width = `100%`;

        searchInput.addEventListener('change', () => {
            const selectedOption = Array.from(select.options).find(option => option.value === searchInput.value);
            if (selectedOption) {
                selectedOption.selected = true;
                updateSelection(searchInput.value);
            } else {
                select.value = select.options[select.selectedIndex].value;
            }
            finalizeSearchInput();
        });

        searchInput.addEventListener('blur', () => {
            finalizeSearchInput();
        });

        container.insertBefore(searchInput, select);
        select.style.display = 'none';
        searchInput.focus();
    }

    function finalizeSearchInput() {
        if (searchInput) {
            container.removeChild(searchInput);
            searchInput = null;
            select.style.display = 'inline-block';
        }
    }
}

function getValueFromWorkflow(workflow, workflowPath) {
    const pathParts = workflowPath.split('.');
    let value = workflow;
    for (const part of pathParts) {
        if (value.hasOwnProperty(part)) {
            value = value[part];
        } else {
            return null;
        }
    }
    return value;
}

function updateWorkflow(workflow, path, value) {
    const pathParts = path.split(".");
    let target = workflow;
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (!target[pathParts[i]]) {
            target[pathParts[i]] = {};
        }
        target = target[pathParts[i]];
    }
    target[pathParts[pathParts.length - 1]] = value;
}



function updateWorkflowAndLog(dimensions) {
    Object.keys(dimensions).forEach(dimension => {
        console.log(`Workflow updated - ${dimension}: ${dimensions[dimension]}`);
    });
}

function handleInputChange(event) {
    const dimension = event.target.name;
    const value = parseInt(event.target.value, 10);
    updateWorkflowAndLog({ [dimension]: value });
}

function updateInputValue(input, change) {
    const min = parseInt(input.getAttribute('min'), 10) || 0;
    const max = parseInt(input.getAttribute('max'), 10) || Number.MAX_SAFE_INTEGER;
    const step = parseInt(input.getAttribute('step'), 10) || 1;
    let currentValue = parseInt(input.value, 10);

    let newValue = currentValue + change * step;
    newValue = Math.max(min, Math.min(newValue, max));

    input.value = newValue;
    updateWorkflowAndLog({ [input.name]: newValue });
}

document.querySelectorAll('.stepper__button').forEach(button => {
    button.addEventListener('click', (event) => {
        const targetInput = document.getElementById(event.target.dataset.target);
        const change = event.target.dataset.action === 'increase' ? 1 : -1;
        updateInputValue(targetInput, change);
    });
});

document.querySelectorAll('.stepper__input').forEach(input => {
    input.addEventListener('change', handleInputChange);
});

document.getElementById('swap-btn').addEventListener('click', () => {
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    [widthInput.value, heightInput.value] = [heightInput.value, widthInput.value];
    updateWorkflowAndLog({
        width: parseInt(widthInput.value, 10),
        height: parseInt(heightInput.value, 10)
    });
});

document.getElementById('aspect-ratio-selector').addEventListener('change', (event) => {
    const value = event.target.value;
    if (value === 'Custom') {
        document.getElementById('width-input').removeAttribute('disabled');
        document.getElementById('height-input').removeAttribute('disabled');
    } else {
        const [width, height] = value.split('x').map(Number);
        document.getElementById('width-input').value = width;
        document.getElementById('height-input').value = height;
        document.getElementById('width-input').setAttribute('disabled', true);
        document.getElementById('height-input').setAttribute('disabled', true);
        updateWorkflowAndLog({ width, height });
        console.log(`width/height: ${width}/${height}`);

    }
});

function getItemById(canvas, id) {
    var objects = canvas.getObjects();
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].id === id) {
            return objects[i];
        }
    }
    return null;
}
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
function isIdExists(id) {
    return canvas.getObjects().some(function (object) {
        return object.id === id;
    });
}

function hideById(id) {
    var object = canvas.getObjects().find(function (object) {
        return object.id === id;
    });

    if (object) {
        object.visible = false;
        canvas.renderAll();
    }
}

function showById(id) {
    var object = canvas.getObjects().find(function (object) {
        return object.id === id;
    });

    if (object) {
        object.visible = true;
        canvas.renderAll();
    }
}

function deleteObjectById(id) {
    var object = canvas.getObjects().find(function (object) {
        return object.id === id;
    });

    if (object) {
        canvas.remove(object);
    }
}

function showSpinner() {
    document.getElementById('spinner').classList.add('spin');
}

function hideSpinner() {
    document.getElementById('spinner').classList.remove('spin');
}

var currentYear = new Date().getFullYear();
document.getElementById('copyright').innerText = `diSty - ${currentYear}`;

})(window,document,undefined);
