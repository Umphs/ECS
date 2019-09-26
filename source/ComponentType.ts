import { Component } from "./Component";

export type ComponentType<
  C extends Component<T> = Component<any>,
  T extends any[] = any
  > = {
    new(): C;
    prototype: C;
  };
