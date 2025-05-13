import { describe, it, expect, vi } from 'vitest';
import { EventHandler } from './event_handler.js';

describe('EventHandler', () => {
	it('should initialize correctly', () => {
		const handler = new EventHandler();
		expect(handler).toBeDefined();
	});

	describe('on', () => {
		it('should call all callbacks registered for an event when emit is called', () => {
			const handler = new EventHandler();
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			handler.on('testEvent', callback1);
			handler.on('testEvent', callback2);
			handler.emit('testEvent');
			expect(callback1).toHaveBeenCalledTimes(1);
			expect(callback2).toHaveBeenCalledTimes(1);
		});

		it('should not call callbacks for other events when emit is called', () => {
			const handler = new EventHandler();
			const callback = vi.fn();
			handler.on('otherEvent', callback);
			handler.emit('testEvent');
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('once', () => {
		it('should call the callback only once when the event is emitted multiple times', () => {
			const handler = new EventHandler();
			const callback = vi.fn();
			handler.once('testEvent', callback);
			handler.emit('testEvent');
			expect(callback).toHaveBeenCalledTimes(1);
			handler.emit('testEvent');
			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should not call the callback if the event is never emitted', () => {
			const handler = new EventHandler();
			const callback = vi.fn();
			handler.once('testEvent', callback);
			expect(callback).not.toHaveBeenCalled();
		});
	});

	describe('off', () => {
		it('should remove the specified callback from the event', () => {
			const handler = new EventHandler();
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			const i = handler.on('testEvent', callback1);
			handler.on('testEvent', callback2);
			handler.off('testEvent', i);
			handler.emit('testEvent');
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).toHaveBeenCalledTimes(1);
		});
		it('should remove all callbacks for the event if no callback is specified', () => {
			const handler = new EventHandler();
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			handler.on('testEvent', callback1);
			handler.on('testEvent', callback2);
			handler.off('testEvent');
			handler.emit('testEvent');
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
		it('should not throw an error if trying to remove a callback that does not exist', () => {
			const handler = new EventHandler();
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			handler.on('testEvent', callback1);
			handler.off('testEvent', 5);
			handler.emit('testEvent');
			expect(callback1).toHaveBeenCalledTimes(1);
			expect(callback2).not.toHaveBeenCalled();
		});
		it('should not throw an error if trying to remove a callback from an event that has no callbacks', () => {
			const handler = new EventHandler();
			const callback = vi.fn();
			handler.off('testEvent', 5);
			handler.emit('testEvent');
			expect(callback).not.toHaveBeenCalled();
		});
	});
	describe('clear', () => {
		it('should remove all callbacks for all events', () => {
			const handler = new EventHandler();
			const callback1 = vi.fn();
			const callback2 = vi.fn();
			handler.on('testEvent', callback1);
			handler.on('otherEvent', callback2);
			handler.clear();
			handler.emit('testEvent');
			handler.emit('otherEvent');
			expect(callback1).not.toHaveBeenCalled();
			expect(callback2).not.toHaveBeenCalled();
		});
		it('should not throw an error if clear is called when there are no events', () => {
			const handler = new EventHandler();
			expect(() => handler.clear()).not.toThrow();
		});
		it('should not throw an error if clear is called multiple times', () => {
			const handler = new EventHandler();
			const callback = vi.fn();
			handler.on('testEvent', callback);
			handler.clear();
			expect(() => handler.clear()).not.toThrow();
			handler.emit('testEvent');
			expect(callback).not.toHaveBeenCalled();
		});
	});

	it('should handle emit being called with no registered callbacks gracefully', () => {
		const handler = new EventHandler();
		expect(() => handler.emit('nonExistentEvent')).not.toThrow();
	});
});
