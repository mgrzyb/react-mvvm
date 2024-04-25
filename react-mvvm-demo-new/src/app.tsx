import React from 'react';
import {createRoot} from 'react-dom/client';
import {
    Button,
    Card,
    DatePicker,
    Flex,
    Layout,
    Menu,
    MenuProps,
    Input,
    Table,
    Drawer,
    Divider,
    Space,
    Form
} from 'antd';
import {
    ControlOutlined,
    PlusCircleOutlined,
    UploadOutlined, UserAddOutlined, UserDeleteOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';

type MenuItem = Required<MenuProps>['items'][number];

const {Sider, Content, Header, Footer} = Layout;

const items: MenuItem[] = [
    {
        key: '1',
        icon: <UserOutlined/>,
        label: 'Users & Groups',
        children: [
            {
                key: '1.1',
                label: 'Users'
            },
            {
                key: '1.2',
                label: 'Groups'
            },
            {
                key: '1.3',
                label: 'Roles'
            },
        ]
    },
    {
        key: '2',
        icon: <VideoCameraOutlined/>,
        label: 'nav 2',
    },
    {
        key: '3',
        icon: <UploadOutlined/>,
        label: 'nav 3',
    },
];

interface UserDto {
    key: React.Key;
    firstName: string;
    lastName: string;
    lastLogin: string;
}

const columns: ColumnsType<UserDto> = [
    {
        title: 'First Name',
        dataIndex: 'firstName',
        render: (text: string) => <a>{text}</a>,
    },
    {
        title: 'Last Name',
        dataIndex: 'lastName',
    },
    {
        title: 'Last Login',
        dataIndex: 'lastLogin',
    },
];

const App = () => {
    const [detailsVisible, setDetailsVisible] = React.useState(false);

    return (
        <>
            <Layout style={{height: "100vh"}}>
                <Header style={{flexGrow: 0, height: 40, backgroundColor: "gray"}}></Header>
                <Layout hasSider style={{flexGrow: 1}}>
                    <Sider collapsible>
                        <Menu mode="inline" theme={"dark"} items={items}/>
                    </Sider>
                    <Layout>
                        <Content style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch",
                            overflowX: "auto"
                        }}>
                            <Card style={{width: "100%"}} bodyStyle={{padding: "5px 10px"}}>
                                <Flex vertical={false} align={"center"}>
                                    <h2 style={{flexGrow: 1}}>Users</h2>
                                    <Space>
                                        <Button type="default"><UserAddOutlined/>Add user</Button>
                                        <Button type="default" disabled><UserDeleteOutlined/>Delete users</Button>
                                        <Input.Search placeholder="Type to search..." style={{width: 200}}/>
                                    </Space>
                                </Flex>
                                <Table

                                    pagination={false}
                                    onRow={(record) => ({
                                        onClick: () => {
                                            setDetailsVisible(true)
                                        }
                                    })}
                                    columns={columns}
                                    dataSource={[{
                                        key: "1",
                                        firstName: "John",
                                        lastName: "Doe",
                                        lastLogin: "2020-01-01",
                                    }]}
                                />
                            </Card>
                            <Drawer open={detailsVisible} onClose={() => setDetailsVisible(false)} mask={false} title={"John Doe"}                                     
                                    footer={<Space><Button type={"primary"}>Save</Button><Button type="link">Cancel</Button></Space> }
                            >
                                <Form>
                                    <Form.Item label={"First Name"}>
                                        <Input/>
                                    </Form.Item>
                                    <Form.Item label={"Last Name"}>
                                        <Input/>
                                    </Form.Item>
                                </Form>
                            </Drawer>
                        </Content>
                        <Footer style={{flexGrow: 0, height: 40, padding: 5}}>Elo melo</Footer>
                    </Layout>
                </Layout>
            </Layout>
        </>
    );
};

const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App/>)
} else {
    alert("Failed to render app because root element is missing.")
}