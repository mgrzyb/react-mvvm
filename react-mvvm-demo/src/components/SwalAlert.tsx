import { observer } from "mobx-react";
import * as React from "react";
import Swal from "sweetalert2";
import { IAlertDialog } from "react-mvvm";

@observer
export class SwalAlert extends React.Component<{ dialog: IAlertDialog }> {

    async componentDidMount() {
        const { title, content, isSuccess } = this.props.dialog;
        await Swal.fire({
            titleText: title,
            text: content,
            type: isSuccess ? 'success' : 'error'
        });
        this.props.dialog.ok();
    }

    render() {
        return null;
    }
}