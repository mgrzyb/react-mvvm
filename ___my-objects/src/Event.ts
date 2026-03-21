export interface IEvent<TArgs extends unknown[]> {
  once(listener: (...args: TArgs) => Promise<void> | void): void;
  addListener(listener: (...args: TArgs) => Promise<void> | void): () => void;
}

export class Event<TArgs extends unknown[]> {
  private readonly listeners: ((...args: TArgs) => Promise<void> | void)[] = [];

  addListener(listener: (...args: TArgs) => Promise<void> | void) {
    this.listeners.push(listener);
    return () => this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  once(listener: (...args: TArgs) => Promise<void> | void) {
    const d = this.addListener(async (...args) => {
      await listener(...args);
      d();
    });
    return d;
  }

  async emit(...args: TArgs) {
    for (const l of this.listeners) {
      await l(...args);
    }
  }
}
