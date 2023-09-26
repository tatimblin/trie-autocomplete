import Dictionary from "./dictionary";

export default class Typeahead {
    #index: number;
    #phrase: string;
    #suggestions: string[];

    constructor() {
        this.#index = 0;
        this.#phrase = ""
        this.#suggestions = [];
    }

    phrase(phrase: string) {
        this.#index = 0;
        this.#phrase = phrase;
        this.#suggestions = Dictionary.search(phrase);
    }

    get typeahead() {
        if (this.#suggestions.length <= this.#index) {
            return "";
        }
        return this.#suggestions[this.#index].slice(this.slice);
    }

    get slice() {
        return this.#phrase.length;
    }

    increment(change: number) {
        const max = this.#suggestions.length - 1;
        const min = 0;
        const proposed = this.#index + change;

        if (change < 0) {
            this.#index = proposed <= max ? proposed : max;
        } else {
            this.#index = proposed >= min ? proposed : min;
        }
    }
}
