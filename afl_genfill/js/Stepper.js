class StepperComponent {
    constructor(containerId, config, workflow) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Container not found:", containerId);
            return;
        }
        this.config = config;
        this.workflow = workflow;
        this.createStepper();
        this.initializeUI();
    } WFUI

    createStepper() {
        const html = `
            <span class="${this.config.id}Label" for="${this.config.id}Input">${this.config.label}</span>
            <input type="range" class="range-input" id="${this.config.id}SliderInput" 
                min="${this.config.minValue * this.config.scaleFactor}" 
                max="${this.config.maxValue * this.config.scaleFactor}" 
                step="${this.config.step * this.config.scaleFactor}" 
                value="${this.config.defValue * this.config.scaleFactor}">
            <input type="number" class="text-input" id="${this.config.id}Input" 
                value="${this.config.defValue.toFixed(this.config.precision)}">
            <button id="${this.config.id}DecrementButton">-</button>
            <button id="${this.config.id}IncrementButton">+</button>
        `;
        this.container.innerHTML = html;

        this.inputElement = document.getElementById(`${this.config.id}Input`);
        this.decrementButton = document.getElementById(`${this.config.id}DecrementButton`);
        this.incrementButton = document.getElementById(`${this.config.id}IncrementButton`);
        this.sliderElement = document.getElementById(`${this.config.id}SliderInput`);

        this.attachEventListeners();
    }

    initializeUI() {
        this.setupStepper();
        this.updateDisplay();
        this.updateExternalConfig();
    }

    setupStepper() {
        this.minValue = this.config.minValue;
        this.maxValue = this.config.maxValue;
        this.step = this.config.step;
        this.precision = this.config.precision;
        this.scaleFactor = Math.pow(10, this.precision);
        this.value = parseFloat(this.config.defValue.toFixed(this.precision));
    }

    updateValue(newValue) {
        const scaledValue = parseFloat(newValue);
        if (scaledValue >= this.minValue && scaledValue <= this.maxValue) {
            this.value = scaledValue.toFixed(this.precision);
            this.updateDisplay();
            this.updateExternalConfig();
        }
    }

    updateDisplay() {
        this.inputElement.value = this.value;
        this.sliderElement.value = parseFloat(this.value) * this.scaleFactor;
    }

    updateExternalConfig() {
        const path = this.config.workflowPath;
        const pathParts = path.split(".");
        let target = this.workflow;
        for (let i = 0; i < pathParts.length - 1; i++) {
            target = target[pathParts[i]] = target[pathParts[i]] || {};
        }
        target[pathParts[pathParts.length - 1]] = parseFloat(this.value);
    }

    increment() {
        this.updateValue(parseFloat(this.value) + this.step);
    }

    decrement() {
        this.updateValue(parseFloat(this.value) - this.step);
    }

    attachEventListeners() {
        this.incrementButton.addEventListener('click', () => this.increment());
        this.decrementButton.addEventListener('click', () => this.decrement());
        this.sliderElement.addEventListener('input', () => {
            this.updateValue(this.sliderElement.value / this.scaleFactor);
        });
        this.inputElement.addEventListener('input', () => {
            this.updateValue(this.inputElement.value);
        });
    }
}
export default StepperComponent;
