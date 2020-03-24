import React, { PropsWithChildren } from "react";
import { Modal } from "antd";
import { ICommand } from "react-mvvm";
import { observer } from "mobx-react";
import { ModalProps } from "antd/lib/modal";

export const AntModal = observer((props : PropsWithChildren<{ okCommand? : ICommand, cancel : () => void, cancelCommand? : ICommand}> & ModalProps) => {
    function onCancel() {
        props.cancel?.();
        props.cancelCommand?.execute()
    }
    
    return (
        <Modal {...props} visible={true} 
               onOk={() => props.okCommand?.execute()}
               okButtonProps={{disabled: !props.okCommand?.isEnabled}}
               confirmLoading={props.okCommand?.isRunning}
               onCancel={onCancel}
               cancelButtonProps={{disabled: props.cancelCommand && !props.cancelCommand.isEnabled}}>
            {props.children}
        </Modal>
    );
});

