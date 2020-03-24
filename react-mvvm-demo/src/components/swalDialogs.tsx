import * as React from "react";
import { IAlertDialog, IConfirmationDialog } from "react-mvvm";
import { SwalConfirmation } from "./SwalConfirmation";
import { SwalAlert } from "./SwalAlert";

export function swalDialogs(model: {
    dialog: IAlertDialog | IConfirmationDialog | any;
}) {
    return (
        <>
            {model.dialog && model.dialog.type == "Confirmation" && (
                <SwalConfirmation dialog={model.dialog} />
            )}
            {model.dialog && model.dialog.type == "Alert" && (
                <SwalAlert dialog={model.dialog} />
            )}
        </>
    );
}
