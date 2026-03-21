import {createRoot} from 'react-dom/client';
import {
    IApplication,
    createApplication,
    ContentView
} from 'my-objects';
import { User } from './User';
import { observer } from 'mobx-react-lite';

import './shell/AnonymousShellView';
import './shell/AuthenticatedShellView';

import './pages/anonymous/LoginPageView';
import './pages/anonymous/RegistrationPageView';

import './pages/authenticated/OrderListPageView';
import './pages/authenticated/OrderDetailsPageView';

import { AnonymousShell } from './shell/AnonymousShell';
import { AuthenticatedShell } from './shell/AuthenticatedShell';
import {configure} from "mobx";

// @ts-ignore
if (module.hot) {
// @ts-ignore
    module.hot.accept()
}

configure({
    enforceActions: "never",
})

type Shell = AnonymousShell | AuthenticatedShell;

const App = observer(({ app } : { app: IApplication<User, Shell>}) => (
    <>
        <ContentView content={app.shell}/>
    </>
));

const app = createApplication<User, Shell>(null, 
    c => new AnonymousShell(c),
    c => new AuthenticatedShell(c));

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App app={app}/>)
} else {
    alert("Failed to render app because root element is missing.")
}