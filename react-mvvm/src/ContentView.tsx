import * as React from 'react';
import { observer } from 'mobx-react';
import { ReactElement, ReactNode } from 'react';
import { ConstructorOf } from "./ConstructorOf";

const viewFactories = new Map();

export const ContentView = observer((props: { content: object | null | undefined, children? : ReactNode }) => {

  if (!props.content) return props.children;

  let viewFactory = viewFactories.get(props.content.constructor);

  if (props.content && viewFactory) return viewFactory(props.content);
  else return <div>Please regiter view for {props.content.constructor.toString()}</div>
})

export function registerContentView<T>(contentConstructor: ConstructorOf<T>, viewFactory: (content: T) => ReactElement<any>) {
  viewFactories.set(contentConstructor, viewFactory);
}

export const contentViewFor = (content: object) => <ContentView content={content} />;