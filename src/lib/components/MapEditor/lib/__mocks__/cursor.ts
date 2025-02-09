import { vi } from 'vitest';

export class MockCursor {
	grab = vi.fn();
	hover = vi.fn();
	precise = vi.fn();
}
