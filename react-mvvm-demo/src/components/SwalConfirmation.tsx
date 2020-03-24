import { observer } from "mobx-react";
import * as React from "react";
import Swal from "sweetalert2";
import { IConfirmationDialog } from "react-mvvm";

@observer
export class SwalConfirmation extends React.Component<{ dialog: IConfirmationDialog }> {

    async componentDidMount() {
        const result = await Swal.fire({
            titleText: this.props.dialog.title,
            text: this.props.dialog.content,
            type: 'question',
            showCancelButton: true
        });

        if (result.value && !result.dismiss)
            this.props.dialog.yes();
        else
            this.props.dialog.no();
    }

    render() {
        return null;
    }
}