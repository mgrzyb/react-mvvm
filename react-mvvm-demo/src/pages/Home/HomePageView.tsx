import * as React from "react";
import { observer } from "mobx-react";
import { bindToCommand, ContentView } from "react-mvvm";
import { Layout, Menu, Breadcrumb, Modal } from 'antd';
import { HomePage } from "./HomePage";
import { AntModal } from "../../components/AntModal";

export const HomePageView = observer(({ model } : { model : HomePage}) => {

    const nav = model.navigation.items;

    return (
        <Layout className="layout">
            <Layout.Header>
                <div className="logo"/>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={model.navigation.selectedItems.map(i => i.key)}
                    style={{lineHeight: '64px'}}
                >
                    <Menu.Item key={nav.home.key} onClick={nav.home.activate}>Home</Menu.Item>
                    <Menu.Item key={nav.projects.key} onClick={nav.projects.activate}>Projects</Menu.Item>
                    <Menu.Item key={nav.users.key} onClick={nav.users.activate}>Users</Menu.Item>
                </Menu>
            </Layout.Header>
            <Layout.Content style={{padding: '0 50px'}}>
                <ContentView content={model.childPage}>
                    <button {...bindToCommand(model.confirmation)}>Confirmation</button>
                    <button {...bindToCommand(model.alert)}>Alert</button>
                    <button {...bindToCommand(model.showCustomDialog)}>Custom</button>

                    {model.dialog?.type == "Custom" &&
                    <AntModal okCommand={model.dialog.done} cancel={model.dialog.cancel}>
                        <button {...bindToCommand(model.dialog.dec)}>-</button>
                        {model.dialog.count}
                        <button {...bindToCommand(model.dialog.inc)}>+</button>
                    </AntModal>
                    }
                </ContentView>
            </Layout.Content>
            <Layout.Footer style={{textAlign: 'center'}}>Ant Design ©2018 Created by Ant UED</Layout.Footer>
        </Layout>);
});