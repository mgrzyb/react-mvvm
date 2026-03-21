import {registerContentView} from "my-objects";
import {OrderDetailsPage} from "./OrderDetailsPage";
import {observer} from "mobx-react-lite";
import {Skeleton} from "antd";
import {Button, Form, TextInput} from "my-objects-antd";

registerContentView(OrderDetailsPage, p => <OrderDetailsPageView page={p}/>);

const OrderDetailsPageView = observer(({page}: { page: OrderDetailsPage }) => {
    const order = page.order.value;
    if (!order)
        return <Skeleton active />;
    
    return (
        <div>
            <h1>{order.id}</h1>
            <Form form={page.orderForm} disabled={!page.order.isLoaded}>
                {fields => (
                    <>
                        <Form.TextField label="Name" field={fields.name}/>
                        <Form.NumberField label="Price" field={fields.price}/>
                        <Form.NumberField label="Quantity" field={fields.quantity}/>
                        <div>Amount: {page.orderAmount}</div>

                        <Button command={page.save}>Save</Button>

                    </>
                )}
            </Form>
        </div>
    );
});