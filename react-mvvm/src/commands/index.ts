import { Command, ICommand } from './Command';
import { MouseEvent } from 'react';
import { ContextualCommand } from './ContextualCommand';

export * from './Command';
export * from './ContextualCommand';

export function asyncCommand<T, K = boolean>(execute: (e: K) => Promise<T>, enabled?: () => K | false | undefined) {
  return new Command<T, K>(execute, enabled);
}

export function command<T, K = boolean>(execute: (e: K) => T, enabled?: () => K | false | undefined) {
  return new Command<T, K>(execute, enabled);
}

export function bindToCommand(command: ICommand, callback?: (value: Promise<any>) => Promise<any>) {
  return {
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return callback ? callback(command.execute()) : command.execute();
    },
    disabled: !command.isEnabled
  };
}

export function bindToContextualCommand<T>(command: ContextualCommand<T>, context: T) {
  return {
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return command.execute(context);
    },
    disabled: !command.canExecute(context)
  };
}
