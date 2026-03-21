import { observer } from "mobx-react-lite";
import {Card } from 'antd';
import { LoginPage } from "./LoginPage";
import { registerContentView } from "my-objects";
import { TextInput, Form, Link, Button } from "my-objects-antd";

registerContentView(LoginPage, p => <LoginPageView page={p}/>);

const LoginPageView = observer(({page}: { page: LoginPage }) => (
    <Card title="Login" style={{width: 400}}>
        <Form form={page.form}
            layout="vertical"
            style={{maxWidth: 360}}
        >
            {fields => (<>
                <Form.Field field={fields.username} label="Username">
                    {inputProps => <TextInput {...inputProps} autoFocus />}
                </Form.Field>

                <Form.Field field={fields.password} label="Password">
                    {inputProps => <TextInput password {...inputProps} />}
                </Form.Field>

                <Button block type="primary" htmlType="submit" command={page.submit}>
                    Log in
                </Button>
                or <Link anchor={page.links.registration}>Register now!</Link>
            </>)}
        </Form>
    </Card>
));
