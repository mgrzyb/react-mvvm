import React from 'react';
import {
    Avatar,
    Card,
    Layout,
    Menu} from 'antd';
import {
    CloseOutlined as CloseIcon,
    UserOutlined,
} from '@ant-design/icons';
import {ContentView, registerContentView, runInTransaction} from 'my-objects';
import { AuthenticatedShell } from './AuthenticatedShell';
import { observer } from 'mobx-react-lite';
import {OrderListPage} from "../pages/authenticated/OrderListPage";


const {Sider, Content, Header, Footer} = Layout;

registerContentView(AuthenticatedShell, shell => <AuthenticatedShellView shell={shell} />);

const AuthenticatedShellView = observer(({ shell } : { shell : AuthenticatedShell }) => {
    return (
        <>
            <Layout style={{height: "100vh"}}>
                <Header style={{flexGrow: 0, height: 45, backgroundColor: "gray", display: 'flex', alignItems: 'center', justifyItems: "center", justifyContent: "end", padding: 10 }} ><Avatar size={30} onClick={() => shell.user.signOut.execute()}>{ shell.user.name[0] }</Avatar></Header>
                <Layout hasSider style={{flexGrow: 1}}>
                    <Sider collapsible>
                        <Menu mode="inline" theme={"dark"} items={[{key: '1',
                            icon: <UserOutlined/>,
                            label: 'Users & Groups',onClick: ()=> runInTransaction(t => shell.navigation.tryReplace(e => new OrderListPage(shell, e), t)) }]}/>
                    </Sider>
                    <Layout>
                        <Content style={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch",
                            overflowX: "auto",
                            overflowY: "hidden",
                            columnGap: 10,
                            padding: 10
                        }}>
                            { [...shell.navigation.entries].map((entry, index) => (
                                <Card key={index} style={{width: "100%", minWidth: "500px", maxWidth: "800px"}} styles={{ body: {padding: "5px 10px"}}} title={entry.content.title} extra={<CloseIcon onClick={()=>runInTransaction(t => entry.tryClose(t))} />}>
                                    <ContentView content={entry.content}/>
                                </Card>
                            )) }
                                
{/*
                            <Card size="small" title="Users" style={{width: "100%", minWidth: "500px", maxWidth: "800px"}} bodyStyle={{padding: "5px 10px"}} extra={<CloseIcon />}>
                                <Space direction="vertical" style={{ width: "100%"}}>
                                    <Flex vertical={false} align={"center"} justify="flex-end">
                                        <Space>
                                            <Button type="default"><UserAddOutlined/>Add user</Button>
                                            <Button type="default" disabled><UserDeleteOutlined/>Delete users</Button>
                                            <Input.Search placeholder="Type to search..." style={{width: 200}}/>
                                        </Space>
                                    </Flex>
                                    <Table
                                        size="small"
                                        pagination={false}
                                        columns={columns}
                                        dataSource={[{
                                            key: "1",
                                            firstName: "John",
                                            lastName: "Doe",
                                            lastLogin: "2020-01-01",
                                        }]}
                                    />
                                </Space>
                            </Card>
*/}
                            {/*<Card size="small" title="User: John Doe" style={{width: "100%", minWidth: "500px", maxWidth: "800px"}} bodyStyle={{padding: "5px 10px"}} extra={<CloseIcon />} actions={[<Button type="primary" htmlType="submit">Save</Button>]}>
                                <Space direction="vertical" style={{ width: "100%", overflowY: "auto", maxHeight: "100%"}}>
                                    <Flex vertical={false} align={"center"} justify="flex-end">
                                        <Space>
                                        </Space>
                                    </Flex>

                                    <Form
                                        layout="vertical"
                                        name="register"
                                        style={{ maxWidth: 600 }}
                                        scrollToFirstError
                                    >
                                        <Form.Item
                                            name="email"
                                            label="E-mail"
                                            rules={[
                                                {
                                                    type: 'email',
                                                    message: 'The input is not valid E-mail!',
                                                },
                                                {
                                                    required: true,
                                                    message: 'Please input your E-mail!',
                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            name="nickname"
                                            label="Nickname"
                                            tooltip="What do you want others to call you?"
                                            rules={[{ required: true, message: 'Please input your nickname!', whitespace: true }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            name="residence"
                                            label="Habitual Residence"
                                            rules={[
                                                { type: 'array', required: true, message: 'Please select your habitual residence!' },
                                            ]}
                                        >
                                            <Cascader options={residences} />
                                        </Form.Item>

                                        <Form.Item
                                            name="phone"
                                            label="Phone Number"
                                            rules={[{ required: true, message: 'Please input your phone number!' }]}
                                        >
                                            <Input style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            name="donation"
                                            label="Donation"
                                            rules={[{ required: true, message: 'Please input donation amount!' }]}
                                        >
                                            <InputNumber style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            name="website"
                                            label="Website"
                                            rules={[{ required: true, message: 'Please input website!' }]}
                                        >
                                            <AutoComplete placeholder="website">
                                                <Input />
                                            </AutoComplete>
                                        </Form.Item>

                                        <Form.Item
                                            name="intro"
                                            label="Intro"
                                            rules={[{ required: true, message: 'Please input Intro' }]}
                                        >
                                            <Input.TextArea showCount maxLength={100} />
                                        </Form.Item>

                                        <Form.Item
                                            name="gender"
                                            label="Gender"
                                            rules={[{ required: true, message: 'Please select gender!' }]}
                                        >
                                            <Select placeholder="select your gender">
                                                <Option value="male">Male</Option>
                                                <Option value="female">Female</Option>
                                                <Option value="other">Other</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="agreement"
                                            valuePropName="checked"
                                            rules={[
                                                {
                                                    validator: (_, value) =>
                                                        value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
                                                },
                                            ]}
                                        >
                                            <Checkbox>
                                                I have read the <a href="">agreement</a>
                                            </Checkbox>
                                        </Form.Item>
                                    </Form>
                                </Space>
                            </Card>*/}
                        </Content>
                        <Footer style={{flexGrow: 0, height: 40, padding: 5}}>Elo melo</Footer>
                    </Layout>
                </Layout>
            </Layout>
        </>
    );
});
