import { CancelableAction, ICancelableAction } from "src/CancelableAction";
import {Deferred, IDeferredValue, isLoaded, liveValue } from "src/deferred";
import { bindableForm } from "src/forms";
import {SWR, Loaded, swr } from "src/swr";

interface IPage {
    
}

interface IHost<T = any>
{
    onClosing(handler: (closing: ICancelableAction) => Promise<any>) : void;
    
    openModal<K>(factory: (close: (result: K) => void)=>T) : Promise<K>;
    tryOpen<T>(factory: (slot: IHost) => T) : Promise<(() => T | undefined) | undefined>;
    tryOpenChild<T>(factory: (slot: IHost) => T) : Promise<(() => T | undefined) | undefined>;
}

class ProductListPage implements IPage, Disposable {
    private _selectedProduct: ProductListItemDto | undefined;
    get selectedProduct() { return this._selectedProduct; }
    
    private detailsPage?: () => ProductDetailsPage | undefined;
    
    constructor(private host : IHost, private readonly api : IProductApi) {
    }

    async onTrySelectProduct(product : ProductListItemDto) {
        const productDetailsPage = this.detailsPage?.();
        if (productDetailsPage) {
            if (await productDetailsPage.tryChangeProduct(product.id))
                this._selectedProduct = product;
        }
        else {
            this.detailsPage = await this.host.tryOpenChild(s => new ProductDetailsPage(s, this.api, product.id))
        }
    }

    [Symbol.dispose](): void {
        throw new Error("Method not implemented.");
    }
}

function wrapSwr<TValue, TWrapper>(swr : SWR<TValue>, wrap: (loaded : Loaded<TValue>) => TWrapper) {
    switch(swr.state) {
        case 'pending':
        case 'failed-to-load':
            return swr.state
        case 'loaded':
            return wrap(swr)
    }
}

function isLoaded<T extends object>(o : 'pending' | 'failed-to-load' | T) : o is T {
    return o !== 'pending' && o !== 'failed-to-load'
}

class ProductDetailsPage {
    
    private _productId : string

    private readonly _product : SWR<ProductDto>
    get product() { return wrapSwr(this._product, p => new Product(p)) }
    
    constructor(private readonly host : IHost, private readonly api : IProductApi, productId : string) {
        this._productId = productId;
        this._product = swr(() => this.api.loadProduct(this._productId))

        host.onClosing(async closing => {
            if (isLoaded(this.product) && this.product.isDirty && !await this.host.openModal(c => new ConfirmCloseDialog(c))){
                closing.cancel();
            }
        });
    }

    async tryChangeProduct(productId: string): Promise<boolean> {
        if (!isLoaded(this.product)) {
            this._productId = productId;
            return true;
        }
            
        if (this.product.isDirty && await this.host.openModal(c => new ConfirmCloseDialog(c)) == false)
            return false;
        
        this._productId = productId;
        return true;
    }
}

class Product {

    get fields() { return this.form.fields }
    get isDirty() { return !this.isLoading && this.form.isDirty }
    get isLoading() { return this.product.isLoading }
    
    private readonly form = bindableForm<ProductDto>()
        .addField('name')
        .addAllFieldsExcept('name')
        .bindTo(() => this.product.value);
    
    constructor(private readonly product : Loaded<ProductDto>) {
    }
}

interface IProductApi { loadProduct: (id : string) => Promise<ProductDto> }

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