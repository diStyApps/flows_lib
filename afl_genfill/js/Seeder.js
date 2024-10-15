class Seeder {
    constructor(containerId, config, workflow) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Container not found:", containerId);
            return;
        }
        this.config = {
            increment: 1,
            ...config
        };
        this.config.initialSeed = this.config.initialSeed || Math.floor(Math.random() * 1000000000000000);
        this.workflow = workflow;
        this.seedGenerator = this.createSeedGenerator(this.config.initialSeed, this.config.increment);
        this.buildUI();
        this.initializeUI();
    }

    createSeedGenerator(initialSeed, increment) {
        let currentSeed = initialSeed;
        return {
            next: () => this.modifySeed(currentSeed += increment),
            prev: () => this.modifySeed(currentSeed -= increment),
            setSeed: (newSeed) => this.modifySeed(currentSeed = newSeed),
            reset: () => this.modifySeed(currentSeed = initialSeed)
        };
    }

    modifySeed(newSeed) {
        this.updateExternalConfig(newSeed);
        return newSeed;
    }

    buildUI() {
        const html = `
            <span for="${this.config.id}Input">${this.config.label}</span>
            <input type="text" id="${this.config.id}Input" value="${this.config.initialSeed}">
            <button id="${this.config.id}RandomSeedButton">R</button>
            <button id="${this.config.id}DecrementButton">-</button>
            <button id="${this.config.id}IncrementButton">+</button>
        `;
        this.container.innerHTML = html;

        this.inputElement = document.getElementById(`${this.config.id}Input`);
        this.randomSeedButton = document.getElementById(`${this.config.id}RandomSeedButton`);
        this.incrementButton = document.getElementById(`${this.config.id}IncrementButton`);
        this.decrementButton = document.getElementById(`${this.config.id}DecrementButton`);

        this.addEventListeners();
    }

    initializeUI() {
        // Update UI to reflect the current seed state accurately
        this.inputElement.value = this.seedGenerator.reset();
    }

    addEventListeners() {
        this.randomSeedButton.addEventListener('click', () => {
            const newSeed = Math.floor(Math.random() * 1000000000000000);
            this.seedGenerator.setSeed(newSeed);
            this.inputElement.value = newSeed;
        });
        this.incrementButton.addEventListener('click', () => {
            this.inputElement.value = this.seedGenerator.next();
        });
        this.decrementButton.addEventListener('click', () => {
            this.inputElement.value = this.seedGenerator.prev();
        });
        this.inputElement.addEventListener('input', () => {
            const value = parseInt(this.inputElement.value.replace(/[^0-9]/g, ''), 10) || 0;
            this.seedGenerator.setSeed(value);
            this.inputElement.value = value;
        });
    }

    updateExternalConfig(newSeed) {
        const path = this.config.workflowPath;
        const pathParts = path.split(".");
        let target = this.workflow;
        for (let i = 0; i < pathParts.length - 1; i++) {
            target = target[pathParts[i]] = target[pathParts[i]] || {};
        }
        target[pathParts[pathParts.length - 1]] = newSeed;
    }
}

export default Seeder;
