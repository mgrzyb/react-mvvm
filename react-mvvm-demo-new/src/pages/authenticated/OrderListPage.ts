import {
    IAuthenticatedApplicationContext,
    IContent,
    IContentStackEntry, list, multiSelection,

    paginatedList, runInTransaction, selection,
    SortOrder
} from "my-objects";
import {User} from "../../User";
import {OrderDetailsPage} from "./OrderDetailsPage";

const orders = [{ id: 1, name: "Order 1" }, { id: 2, name: "Order 2" }, { id: 3, name: "Order 3" }, { id: 4, name: "Order 4" }, { id: 5, name: "Order 5" }, { id: 6, name: "Order 6" }, { id: 7, name: "Order 7" }, { id: 8, name: "Order 8" }, { id: 9, name: "Order 9" }, { id: 10, name: "Order 10" }];

type OrderDto = { id: number, name: string };
const loadOrders = async (sortOrder : SortOrder<OrderDto> | null, skip: number, take: number) => {
    await delay(1000);
    sortOrder = sortOrder || { field: "id", direction: "ascend" };
    orders.sort((a, b) => (sortOrder.direction === "ascend" ? 1 : -1) * (a[sortOrder.field] > b[sortOrder.field] ? 1 : -1));
    return orders.slice(skip, skip + take);
};

function fromPaginatedApi<T>(api: (sortOrder: SortOrder<T> | null, skip: number, take: number) => Promise<readonly T[]>, pageSize: number = 10) {
    return async function(sortOrder: SortOrder<T> | null, continuation: { skip: number } | null) {
        if (!continuation) {
            const items = await api(sortOrder, 0, pageSize + 1);
            if (items.length <= pageSize)
                return { items, continuation: null };
            return { items: items.slice(0, pageSize), continuation: { skip: pageSize } };
        }
        
        const items = await api(sortOrder, continuation.skip, pageSize + 1);
        if (items.length <= pageSize)
            return { items, continuation: null };
        return { items: items.slice(0, pageSize), continuation: { skip: continuation.skip + pageSize } };
    }
}
export class OrderListPage implements IContent {
    
    readonly title = "Orders";

    readonly orders = list(async () => {
        await delay(1000);
        return orders;
    });
    
    readonly selectedOrder = selection<OrderDto>()
    constructor(private readonly context: IAuthenticatedApplicationContext<User>, private readonly stackEntry: IContentStackEntry) {
        this.selectedOrder.changing.addListener((order, t) => {
            if (!order) return;
            return this.stackEntry.tryOpenChildFromIntent(OrderDetailsPage.getIntent(this.context, order.id), t)
        })
    }
}

async function delay(number: number) {
    return new Promise(resolve => setTimeout(resolve, number));
}
