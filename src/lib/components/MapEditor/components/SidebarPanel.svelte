<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		disabled = false,
		open = true,
		title
	}: { children: Snippet; disabled?: boolean; open?: boolean; title: string } = $props();
</script>

<div class={{ panel: true, open, disabled }}>
	<button class="header" onclick={() => (open = !open)}>
		<span class="title">{title}</span>
		<div class="chevron">
			<svg viewBox="0 0 7 12">
				<path d="M1,0L7,6L1,12L0,11,L5,6L0,1z" />
			</svg>
		</div>
	</button>
	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.panel {
		margin: 1em 0;

		.header {
			background: none;
			border: none;
			color: var(--color-text);
			cursor: pointer;
			font-weight: 600;
			margin: 0;
			padding: 0;
			position: relative;
			text-align: left;
			width: 100%;

			.title {
				opacity: 0.8;
				text-transform: uppercase;
			}

			.chevron {
				box-sizing: border-box;
				display: block;
				height: 1em;
				opacity: 0.7;
				padding: 0;
				position: absolute;
				right: 0.4em;
				top: 0;
				width: 1em;

				svg {
					fill: var(--color-fg);
					height: 100%;
					rotate: 0deg;
					transform-origin: 40% 50%;
					transition: rotate 0.1s linear;
					width: 100%;
				}
			}
		}

		.content {
			box-sizing: border-box;
			height: 0;
			margin: var(--gap) 0;
			overflow: hidden;
			padding: 0;
		}
	}

	.open {
		margin-bottom: 2em;

		.header {
			.chevron {
				svg {
					rotate: 90deg;
				}
			}
		}

		.content {
			height: auto;
		}
	}

	.disabled {
		opacity: 0.3;

		.content {
			display: none;
		}
	}
</style>
