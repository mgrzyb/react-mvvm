import { observer } from "mobx-react";
import { NewUserDialog } from "./NewUserDialog";
import React from "react";
import { AntModal } from "../../components/AntModal";
import { AntField, AntForm } from "../../components/AntForm";
import { AntTextInput } from "../../components/AntTextInput";
import { AntSingleSelect } from "../../components/AntSelect";

export const NewUserDialogView = observer(({ dialog } : { dialog : NewUserDialog}) => (
    <AntModal title="New user" okCommand={dialog.save} cancel={dialog.cancel}>
        <AntForm form={dialog.userForm}>
            {(fields) => (
                <>
                    <AntField field={fields.firstName} label="First name">
                        { props => <AntTextInput {...props} /> }
                    </AntField>
                    <AntField field={fields.lastName} label="Last name">
                        {(props) => <AntTextInput {...props} />}
                    </AntField>
                    <AntField field={fields.email} label="Email">
                        {(props) => <AntTextInput {...props} />}
                    </AntField>
                    <AntField field={fields.department} label="Department">
                        { props => <AntSingleSelect {...props} dataSource={dialog.departments} optionText={d => d.name}/> }
                    </AntField>
                </>)
            }
        </AntForm>
    </AntModal>
));