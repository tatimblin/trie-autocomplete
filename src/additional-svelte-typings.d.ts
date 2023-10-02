declare namespace svelteHTML {
    interface HTMLAttributes<T> {
        'on:append'?: (e: CustomEvent<string>) => void,
		'on:cycle'?: (e: CustomEvent<number>) => void,
    }
}