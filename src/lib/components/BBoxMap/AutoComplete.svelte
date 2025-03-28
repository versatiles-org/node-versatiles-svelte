<script lang="ts" generics="T">
	import { isDarkMode } from '$lib/utils/map_style.js';
	/* eslint svelte/no-at-html-tags: off */

	let {
		change,
		initialInputText,
		inputText = $bindable(''),
		items = [],
		maxItems = 10,
		minChar = 3,
		placeholder = ''
	}: {
		change: (value: T) => void;
		initialInputText?: string;
		inputText?: string;
		items?: Item[];
		maxItems?: number;
		minChar?: number;
		placeholder?: string;
	} = $props();

	import { onMount } from 'svelte';

	type Item = { key: string; value: T };
	type ResultItem = Item & { _label: string };

	let inputElement: HTMLInputElement; // Reference to DOM element
	let autocompleteElement: HTMLDivElement; // Reference to DOM element
	let isOpen = $state(false);
	let results: ResultItem[] = $state([]);
	let selectedIndex = $state(0);

	// Escape special characters in search string for use in regex
	const regExpEscape = (s: string) => s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');

	if (inputText.length >= minChar) {
		const r = filterResults();
		if (r.length > 0) {
			const { key, value } = r[0];
			inputText = key;
			change(JSON.parse(JSON.stringify(value)));
		} else {
			inputText = '';
		}
	}

	// Handle input change
	function onChange() {
		if (inputText.length >= minChar) {
			results = filterResults();
			selectedIndex = 0;
			isOpen = true;
		} else {
			isOpen = false;
		}
	}

	function onFocus() {
		inputElement.setSelectionRange(0, 1000);
	}

	// Filter results based on search query
	function filterResults(): ResultItem[] {
		const searchText = inputText.trim();
		const searchTextUpper = searchText.toUpperCase();
		const searchReg = RegExp(regExpEscape(searchText), 'i');
		return items
			.filter((item) => item.key.toUpperCase().includes(searchTextUpper))
			.slice(0, maxItems)
			.map((item) => ({
				...item,
				_label: item.key.replace(searchReg, '<span>$&</span>')
			}));
	}

	// Handle keyboard navigation
	function onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				if (selectedIndex < results.length - 1) selectedIndex += 1;
				break;
			case 'ArrowUp':
				if (selectedIndex > 0) selectedIndex -= 1;
				break;
			case 'Enter':
				event.preventDefault();
				close(selectedIndex);
				break;
			case 'Escape':
				event.preventDefault();
				close();
				break;
		}
	}

	// Close the autocomplete and select an item
	function close(index = -1) {
		isOpen = false;
		if (index >= 0 && results[index]) {
			const { key, value } = results[index];
			inputText = key;
			change(JSON.parse(JSON.stringify(value)));
		}
	}

	onMount(() => {
		const darkMode = isDarkMode(autocompleteElement);
		autocompleteElement.style.setProperty('--bg-color', darkMode ? '#000' : '#fff');
		autocompleteElement.style.setProperty('--fg-color', darkMode ? '#fff' : '#000');
		if (initialInputText) {
			inputText = initialInputText;
			results = filterResults();
			close(0);
		}
	});
</script>

<svelte:window on:click={() => close()} />

<div class="autocomplete" bind:this={autocompleteElement}>
	<input
		type="text"
		bind:value={inputText}
		{placeholder}
		autocomplete="off"
		oninput={onChange}
		onkeydown={onKeyDown}
		onfocusin={onFocus}
		onclick={(e) => e.stopPropagation()}
		bind:this={inputElement}
		aria-activedescendant={isOpen ? `result-${selectedIndex}` : undefined}
		aria-autocomplete="list"
		aria-controls="autocomplete-results"
	/>
	<div class="autocomplete-results" class:hide-results={!isOpen}>
		{#each results as result, i (result.key)}
			<button
				onclick={() => close(i)}
				class={i === selectedIndex ? ' is-active' : ''}
				role="option"
				aria-selected={i === selectedIndex}
			>
				{@html result._label}
			</button>
		{/each}
	</div>
</div>

<style>
	.autocomplete {
		position: relative;
		border-radius: 0.5em;
		background: color-mix(in srgb, var(--bg-color) 80%, transparent);
		box-sizing: border-box;
		line-height: normal;
	}

	input {
		width: 100%;
		display: block;
		box-sizing: border-box;
		padding: 0.3em 0.6em;
		border: none;
		background: none;
		color: var(--fg-color);
	}

	.autocomplete-results {
		padding: 0;
		margin: 0;
		background: none;
		width: 100%;
		display: block;
		border-radius: 0 0 0.5em 0.5em;
	}

	.autocomplete-results.hide-results {
		display: none;
	}

	button {
		padding: 0.2rem 0.5rem;
		cursor: pointer;
		border: none;
		display: block;
		background: transparent;
		font-weight: normal;
		color: color-mix(in srgb, var(--fg-color) 50%, transparent);
		width: 100%;
		text-align: left;
	}

	button > :global(span) {
		color: var(--fg-color);
	}

	button.is-active,
	button:hover {
		background-color: color-mix(in srgb, var(--fg-color) 15%, transparent);
	}
</style>
