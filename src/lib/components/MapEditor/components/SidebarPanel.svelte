<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		open = true,
		title,
		disabled = false
	}: { children: Snippet; disabled?: boolean; open?: boolean; title: string } = $props();
</script>

<div class={{ panel: true, open, disabled }}>
	<button class="header" onclick={() => (open = !open)}>
		{title}
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
		margin: var(--gap) 0;
		.header {
			background: #0002;
			border: none;
			color: #000;
			cursor: pointer;
			font-size: 0.8em;
			margin: 0;
			padding: var(--gap);
			position: relative;
			text-align: left;
			width: 100%;
			.chevron {
				display: block;
				position: absolute;
				top: var(--gap);
				right: 0.4em;
				opacity: 0.7;
				width: 1em;
				height: 1em;
				padding: 0;
				box-sizing: border-box;
				svg {
					width: 100%;
					height: 100%;
					rotate: 0deg;
					transition: rotate 0.1s linear;
					transform-origin: 40% 50%;
				}
			}
		}
		.content {
			background-color: #0001;
			margin: 0;
			height: 0;
			overflow: hidden;
			padding: 0;
			box-sizing: border-box;
		}
	}
	.open {
		.header {
			.chevron {
				svg {
					rotate: 90deg;
				}
			}
		}
		.content {
			height: auto;
			padding: var(--gap);
		}
	}
	.disabled {
		.header {
			color: #0005;
			svg {
				opacity: 0.3;
			}
		}
		.content {
			display: none;
		}
	}
</style>
