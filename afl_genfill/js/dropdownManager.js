export function populateDropdown(loaderId, items, customLabel, workflowPath, workflow, storeInLocalStorage = false, loadFromWorkflow = true) {
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

    let searchInput = null;

    if (storeInLocalStorage && !loadFromWorkflow) {
        const storedModel = localStorage.getItem(loaderId);
        if (storedModel) {
            select.value = storedModel;
        }
    }

    if (loadFromWorkflow) {
        const workflowValue = getValueFromWorkflow(workflow, workflowPath);
        if (workflowValue) {
            select.value = workflowValue;
        }
    }

    datalist.style.backgroundColor = 'white';

    select.addEventListener('mousedown', (event) => {
        if (event.target.tagName === 'SELECT') {
            event.preventDefault();
            createSearchInput(container, select, searchInput, datalist, loaderId, workflow, workflowPath, storeInLocalStorage);
        }
    });

    select.addEventListener('change', () => {
        if (select.value !== '') {
            updateWorkflow(workflow, workflowPath, select.value);
            if (storeInLocalStorage) {
                localStorage.setItem(loaderId, select.value);
            }
        }
    });

    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(datalist);
}

function createSearchInput(container, select, searchInput, datalist, loaderId, workflow, workflowPath, storeInLocalStorage) {
    if (!searchInput) {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = `${loaderId}Search`;
        searchInput.setAttribute('list', `${loaderId}List`);

        const tempElement = document.createElement('div');
        tempElement.style.display = 'inline-block';
        tempElement.style.visibility = 'hidden';
        tempElement.style.fontFamily = window.getComputedStyle(select).fontFamily;
        tempElement.style.fontSize = window.getComputedStyle(select).fontSize;
        document.body.appendChild(tempElement);

        let maxWidth = 0;
        items.forEach(item => {
            tempElement.textContent = item;
            const itemWidth = tempElement.offsetWidth;
            maxWidth = Math.max(maxWidth, itemWidth);
        });
        document.body.removeChild(tempElement);

        searchInput.style.width = `100%`;

        searchInput.addEventListener('change', () => {
            handleSearchInputChange(searchInput, select, container, loaderId, workflow, workflowPath, storeInLocalStorage);
        });

        searchInput.addEventListener('blur', () => {
            container.removeChild(searchInput);
            searchInput = null;
            select.style.display = 'inline-block';
        });

        container.insertBefore(searchInput, select);
        select.style.display = 'none';
        searchInput.focus();
    }
}

function handleSearchInputChange(searchInput, select, container, loaderId, workflow, workflowPath, storeInLocalStorage) {
    const selectedOption = Array.from(select.options).find(option => option.value === searchInput.value);
    if (selectedOption) {
        selectedOption.selected = true;
        updateWorkflow(workflow, workflowPath, searchInput.value);
        if (storeInLocalStorage) {
            localStorage.setItem(loaderId, searchInput.value);
        }
    } else {
        select.value = select.options[select.selectedIndex].value;
    }
    container.removeChild(searchInput);
    searchInput = null;
    select.style.display = 'inline-block';
}

// Helper functions
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
