import { Component } from "./Component";
import { ComponentStore } from "./ComponentStore";
export type ComponentType<C extends Component = Component> = {
  new(...args: any): C;
  prototype: C;
  readonly store: ComponentStore<C>;
  readonly components: readonly C[];
};
