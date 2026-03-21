import { Layout } from 'antd';
import {AnonymousShell} from './AnonymousShell';
import {ContentView, registerContentView} from 'my-objects';
import { observer } from 'mobx-react-lite';

registerContentView(AnonymousShell, shell => <AnonymousShellView shell={shell}/>);

const AnonymousShellView = observer(({shell}: { shell: AnonymousShell }) => (
    <Layout>
        <Layout.Content style={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <ContentView content={() => shell.content.current} />
        </Layout.Content>
    </Layout>));
