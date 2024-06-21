import {IContent, INavigationEntry} from "../navigation";
import {PaginatedList} from "../lists";
import {swr, SWR} from "../swr";
import {bindableForm} from "../forms";

class ProductListPage {
    
    public readonly products : PaginatedList<ProductListItemDto>;
    constructor(private navigationEntry : INavigationEntry, private readonly api : IProductApi) {
        this.products = new PaginatedList(async ({skip, take}) => {
            return this.api.loadProducts({skip, take});
        });
    }

    tryOpenProductDetails(product : ProductListItemDto) {
        return this.navigationEntry.tryOpenChildFromIntent(ProductDetailsPage.getIntent(this.api, product.id));
    }
}

class ProductDetailsPage implements IContent {
    static getIntent(api: IProductApi, productId: string) {
        return {
            name: 'product-details',
            productId,
            contentFactory: (entry: INavigationEntry) => new ProductDetailsPage(entry, api, productId)
        };
    }

    private static IsIntent(intent: object): intent is { productId: string } {
        return (intent as Partial<ReturnType<typeof ProductDetailsPage.getIntent>>).name === 'product-details';
    }

    readonly product : Product
    private _productId : string

    constructor(private readonly navigationEntry : INavigationEntry, private readonly api : IProductApi, productId : string) {
        this._productId = productId;
        this.product = new Product(swr(() => this.api.loadProduct(this._productId)))

        navigationEntry.onClosing(async closing => {
            if (this.product.isDirty && !await this.navigationEntry.openModal(c => new ConfirmCloseDialog(c))){
                closing.cancel();
            }
        });
    }

    async tryHandleIntent(intent: object): Promise<boolean> {
        if (ProductDetailsPage.IsIntent(intent)) {
            return this.tryChangeProduct(intent.productId);
        }
        return false;
    }

    async tryChangeProduct(productId: string): Promise<boolean> {
        if (this.product.isDirty && !await this.navigationEntry.openModal(c => new ConfirmCloseDialog(c)))
            return false;
        this._productId = productId;
        return true;
    }
}

class Product {

    get isDirty() { return this.product.isLoaded && this.form.isDirty }
    get isLoading() { return this.product.isLoading }
    
    readonly form = bindableForm<ProductDto>()
        .addField('name')
        .addAllFieldsExcept('name')
        .bindTo(this.product);
    
    constructor(private readonly product : SWR<ProductDto>) {
    }
}

interface IProductApi {
    loadProducts: (options: { skip : number, take : number}) => Promise<ReadonlyArray<ProductListItemDto>>;
    loadProduct: (id : string) => Promise<ProductDto> 
}

interface ProductDto {
    name : string;
    description : string;
}
interface ProductListItemDto {
    readonly id : string
}

class ConfirmCloseDialog  {
    constructor(close : (result: boolean) => void) {
    }
}