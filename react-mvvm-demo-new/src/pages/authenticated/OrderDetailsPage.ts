import {
    bindableForm, command,
    IAuthenticatedApplicationContext,
    IContent,
    IContentStackEntry,
    IIntent,
    IUITransaction, required,
    swr
} from "my-objects";
import {User} from "../../User";
import {computed, observable} from "mobx";

interface OrderDto {
    id: number;
    name: string;
    price: number;
    quantity: number;
    amount: number;
}

export class OrderDetailsPage implements IContent {
    static getIntent(context: IAuthenticatedApplicationContext<User>, orderId: number) {
        return { type: "order-details", orderId, createContent: (entry: IContentStackEntry) => new OrderDetailsPage(context, entry, orderId) };
    }
    
    readonly title = "Order Details";
    
    @observable private accessor _orderId: number;
    @computed get orderId() { return this._orderId; }
    
    readonly order = swr(
        () => this.orderId, 
        async (orderId) => {
            await delay(1000);
            return {id: orderId, name: "Order " + this.orderId, price: 100, quantity: 1, amount: 100};
        });
    
    readonly orderForm = bindableForm<OrderDto>()
        .addField("name", { validator: required()})
        .addField("price", { validator: required()})
        .addField("quantity", { validator: required()})
        .bindTo(() => this.order.value);
    
    get orderAmount() {
        return this.orderForm.fields.price.value! * this.orderForm.fields.quantity.value!;
    }

    readonly save = command(
        async () => {
            await this.orderForm.tryCommit(async () => {
                await delay(1000);
            });
        },
        ()=>this.orderForm.isDirty);

    constructor(private readonly context: IAuthenticatedApplicationContext<User>, private readonly stackEntry: IContentStackEntry, orderId: number) {
        stackEntry.discarding.addListener((t) => {
            if (this.orderForm.isDirty && !confirm("Discard changes?"))
                t.abort()
        });
        
        this._orderId = orderId;
    }
    
    getIntentHandler<T extends IContent>(intent: IIntent<T>) {
        if ("type" in intent && "orderId" in intent && intent.type === "order-details")
            return async (t : IUITransaction) => this.tryChangeOrderId(intent.orderId as number, t);
    }
    
    private tryChangeOrderId(orderId: number, transaction: IUITransaction) {
        if (this.orderForm.isDirty && !confirm("Discard changes?"))
            transaction.abort()
        transaction.append(() => {
            this._orderId = orderId;
        });
    }
}

async function delay(number: number) {
    return new Promise(resolve => setTimeout(resolve, number));
}
