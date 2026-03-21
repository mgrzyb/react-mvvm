
export type Anchor = AnchorWithUrl | (() => void);
export class AnchorWithUrl {
    constructor(public url: string, public readonly follow: () => void) {
    }
}