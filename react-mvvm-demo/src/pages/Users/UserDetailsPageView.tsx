import * as React from "react";
import { observer } from "mobx-react";
import { bindToCommand } from "react-mvvm";
import { UserDetailsPage } from "./UserDetailsPage";
import { AntField, AntForm } from "../../components/AntForm";
import { AntTextInput } from "../../components/AntTextInput";
import { AntSingleSelect } from "../../components/AntSelect";
import { AntMultiSelect } from "../../components/AntSelect";
import { Button, PageHeader } from "antd";

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
    },
};

export const UserDetailsPageView = observer(({ model : { state } } : { model : UserDetailsPage}) => {
    switch(state) {
        case "Loading":
            return <div>Loading...</div>
        case "NotFound":
            return <div>Not found</div>
        default:
            return <PageHeader title={`${state.user.firstName} ${state.user.lastName}`}>
                <AntForm form={state.userForm} {...formItemLayout}>
                {(fields) => (
                    <fieldset disabled={state.save.isRunning} >
                        <AntField field={fields.firstName} label="First name">
                            { props => <AntTextInput {...props} /> }
                        </AntField>
                        <AntField field={fields.lastName} label="Last name">
                            {(props) => <AntTextInput {...props} />}
                        </AntField>
                        <AntField field={fields.department} label="Department">
                            { props => <AntSingleSelect {...props} dataSource={state.departments} optionText={d => d.name}/> }
                        </AntField>
                        <AntField field={fields.tags} label="Tags">
                            { props => <AntMultiSelect {...props} dataSource={state.tags} optionText={d => d.id}/> }
                        </AntField>
    
                        <Button {...bindToCommand(state.save)}>Save</Button>
                        <Button {...bindToCommand(state.reset)}>Reset</Button>
                    </fieldset>)
                }
                </AntForm>
            </PageHeader>
    }});
