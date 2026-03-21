import { ICommand } from "my-objects";
import { Button as AntButton, ButtonProps } from 'antd';
import { observer } from "mobx-react-lite";
import { useCallback, MouseEvent } from "react";

export const Button = observer(({ command, children, ...props } : { command: ICommand } & ButtonProps) => {
    
    const onClick = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        command.execute();
    }, [command]);
    
    return <AntButton {...props} onClick={onClick} disabled={!command.isEnabled}>{children}</AntButton>
});