// src/lib/ai/Controls.ts
export class Controls {
    forward: boolean;
    left: boolean;
    right: boolean;
    reverse: boolean;

    constructor(controlType: 'KEYS' | 'DUMMY' | 'AI' = 'AI') {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        if (controlType === 'KEYS') {
            this.#addKeyboardListeners();
        } else if (controlType === 'DUMMY') {
            this.forward = true;
        }
    }

    #addKeyboardListeners() {
        if (typeof window === 'undefined') return;

        window.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft": this.left = true; break;
                case "ArrowRight": this.right = true; break;
                case "ArrowUp": this.forward = true; break;
                case "ArrowDown": this.reverse = true; break;
            }
        }
        window.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft": this.left = false; break;
                case "ArrowRight": this.right = false; break;
                case "ArrowUp": this.forward = false; break;
                case "ArrowDown": this.reverse = false; break;
            }
        }
    }
}
