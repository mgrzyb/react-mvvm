import React from 'react';
import { ReactNode } from 'react';
import {observer} from "mobx-react-lite";

const viewFactories = new Map<string, (c : any) => ReactNode>();

export type ConstructorOf<T> = new (...args : any[]) => T;

function renderChildren(children: React.ReactNode | (() => React.ReactNode) | undefined) {
    return (typeof children === 'function' ? children() : children) ?? null;
}

export const ContentView = observer((props: { content: object | null | undefined | (() => object); children?: ReactNode | (() => ReactNode) }) => {
    if (!props.content) return renderChildren(props.children);

    const content = typeof props.content === 'function' ? props.content() : props.content;
    if (!content) return renderChildren(props.children);

    let viewFactory = viewFactories.get(content.constructor);

    if (content && viewFactory) return viewFactory(content);
    else return <div>Please register view for {content.constructor.name}</div>;
});

export function registerContentView<T>(contentConstructor: ConstructorOf<T>, viewFactory: (content: T) => ReactNode) {
    viewFactories.set(contentConstructor.name, viewFactory);
}

export const contentViewFor = (content: object) => <ContentView content={content} />;