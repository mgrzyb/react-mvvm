import * as React from "react";
import { observer } from "mobx-react";
import { bindToCommand } from "react-mvvm";
import { UserDetailsPage } from "./UserDetailsPage";
import { TextInput } from "../../components/TextIput";
import { DropDown } from "../../components/DropDown";
import { Form, Input } from "antd";
import { AntField, AntForm } from "../../components/AntForm";
import { AntTextInput } from "../../components/AntTextInput";
import { AntSelect } from "../../components/AntSelect";

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
            let fields = state.userForm.fields;
            return <div>
                <AntForm form={state.userForm} {...formItemLayout}>
                {(_) => (
                    <>
                        <AntField field={fields.firstName} label="First name">
                            { props => <AntTextInput {...props} /> }
                        </AntField>
                        <AntField field={fields.lastName} label="Last name">
                            {(props) => <AntTextInput {...props} />}
                        </AntField>
                        <AntField field={fields.department} label="Department">
                            { props => <AntSelect {...props} dataSource={state.departments} optionText={d => d.name}/> }
                        </AntField>
    
                        <button {...bindToCommand(state.save)}>Save</button>
                        <button {...bindToCommand(state.reset)}>Reset</button>
                    </>)
                }
                </AntForm>
            </div>
    }});
