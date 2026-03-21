import { Command, ICommand } from './Command';
import React from "react";

export * from './Command';

export function command<T, K = boolean>(execute: (e: K) => T, enabled?: () => K | false | undefined) : ICommand<T> {
  return new Command<T, K>(execute, enabled);
}

export function bindToCommand(command: ICommand<any>, callback?: (value: Promise<any>) => Promise<any>) {
  return {
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) : void => {
      e.preventDefault();
      e.stopPropagation();
      callback ? callback(command.execute()) : command.execute();
    },
    disabled: !command.isEnabled
  };
}