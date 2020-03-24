import { Command } from "./Command";
import { MouseEvent } from "react";
import { ContextualCommand } from "./ContextualCommand";

export * from "./Command";
export * from "./ContextualCommand"

export function asyncCommand<T, K = boolean>(execute : (e : K) => Promise<T>, enabled? : () => K | undefined){
    return new Command<T, K>(execute, enabled)
}

export function command<T>(execute : () => T, enabled? : () => boolean) {
    return new Command<T>(execute, enabled);
}

export function bindToCommand(command : Command<any>) {
    return {
        onClick: (e : MouseEvent) => { e.preventDefault(); e.stopPropagation(); return command.execute() },
        disabled: !command.isEnabled
    }
}

export function bindToContextualCommand<T>(command : ContextualCommand<T>, context : T) {
    return {
        onClick: (e : MouseEvent) => { e.preventDefault(); e.stopPropagation(); return command.execute(context) },
        disabled: !command.canExecute(context)
    }
}