import {registerContentView} from "my-objects";
import {OrderListPage} from "./OrderListPage";
import {observer} from "mobx-react-lite";
import {Table} from "my-objects-antd/Table";

registerContentView(OrderListPage, p => <OrderListPageView page={p}/>);

const OrderListPageView = observer(({page}: { page: OrderListPage }) => (
    <div>
{/*
        <div style={{height: 30}}>
            {!page.selectedOrders.isEmpty && (<>
                Selected: {page.selectedOrders.items.map(i => i.name).join(", ")} <a href="#"
                                                                                       onClick={() => page.selectedOrders.clear()}>Clear</a>
            </>)}
        </div>
*/}

        <Table list={page.orders} selection={page.selectedOrder} clickTogglesSelection
               columns={[
                   {title: "Id", dataIndex: "id"},
                   {title: "Name", dataIndex: "name", canSort: true},
               ]}/>
    </div>
));