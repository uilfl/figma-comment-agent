export type EventListener<T> = (event: T) => void;

export class EventEmitter<T> {
  private _listeners: Map<string, Set<EventListener<T>>> = new Map();

  on(eventName: string, listener: EventListener<T>): void {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName)!.add(listener);
  }

  off(eventName: string, listener: EventListener<T>): void {
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(eventName: string, event: T): void {
    const listeners = this._listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this._listeners.delete(eventName);
    } else {
      this._listeners.clear();
    }
  }
}
