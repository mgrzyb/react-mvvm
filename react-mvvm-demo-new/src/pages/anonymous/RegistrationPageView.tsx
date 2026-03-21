import {Form, registerContentView } from "my-objects";
import { RegistrationPage } from "./RegistrationPage";
import { observer } from "mobx-react-lite";
import { Card } from "antd";
import {Link} from "my-objects-antd";

registerContentView(RegistrationPage, p => <RegistrationPageView page={p}/>);

const RegistrationPageView = observer(({page}: { page: RegistrationPage }) => (
    <Card title="Login" style={{width: 400}}>
        <h1>Registration</h1>
        <Link anchor={page.links.login}>Login</Link>
    </Card>
));
