import { Anchor } from "my-objects"

export const Link = ({anchor, children} : {anchor: Anchor, children: React.ReactNode}) => <a href={typeof anchor === "function" ? "#" : anchor.url} onClick={typeof anchor === "function" ? anchor : anchor.follow}>{children}</a>