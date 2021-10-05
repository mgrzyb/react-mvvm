export async function runWithCancelableAction(func: (action: ICancelableAction) => Promise<void> | void) {
  const action = new CancelableAction();
  await func(action);
  return await action.complete();
}

export interface ICancelableAction {
  readonly canceled: boolean;
  cancel(): void;
  then(continuation: () => void): void;
}

export class CancelableAction implements ICancelableAction {
  private readonly continuations: (() => Promise<any> | void)[] = [];

  private _canceled = false;
  get canceled() {
    return this._canceled;
  }

  cancel(): void {
    this._canceled = true;
  }

  then(continuation: () => Promise<any> | void): void {
    this.continuations.push(continuation);
  }

  async complete() {
    if (this.canceled) return false;

    for (const continuation of this.continuations) {
      await continuation();
    }
    return true;
  }
}
