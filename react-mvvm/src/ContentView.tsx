import React from 'react';
import { observer } from 'mobx-react';
import { ReactElement, ReactNode } from 'react';
import { ConstructorOf } from './ConstructorOf';

const viewFactories = new Map();

function renderChildren(children: React.ReactNode | (() => React.ReactNode) | undefined) {
  return (typeof children === 'function' ? children() : children) ?? null;
}

export const ContentView = observer((props: { content: object | null | undefined | (() => object); children?: ReactNode | (() => ReactNode) }) => {
  if (!props.content) return renderChildren(props.children);

  const content = typeof props.content === 'function' ? props.content() : props.content;
  if (!content) return renderChildren(props.children);

  let viewFactory = viewFactories.get(content.constructor);

  if (content && viewFactory) return viewFactory(content);
  else return <div>Please regiter view for {content.constructor.toString()}</div>;
});

export function registerContentView<T>(contentConstructor: ConstructorOf<T>, viewFactory: (content: T) => ReactElement<any>) {
  viewFactories.set(contentConstructor, viewFactory);
}

export const contentViewFor = (content: object) => <ContentView content={content} />;
