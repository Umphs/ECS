import { Entity } from "./Entity";
import { ComponentType } from "./ComponentType";
import { ComponentStore } from "./ComponentStore";

export abstract class Component {

  readonly entity = Entity.Invalid;

  initialize(): void;
  initialize(...params: any): void;
  initialize() { }

  dispose() { }

  static readonly store: ComponentStore;
  static readonly component: Component[];

}

export namespace Component {

  // TODO: allow attaching multiples component instances to the entity
  // (hint: add ComponentListStore strategy and IComponentStore interface)

  /**
   * Register component class using a decorator.
   */
  export function register(): <C extends Component, T extends ComponentType<C>>(type: T) => T;

  /**
   * Register component class directly.
   */
  export function register<C extends Component, T extends ComponentType<C>>(type: T): T;

  /**
   * Register component class, and decorate it with accessors for other components.
   */
  export function register(dependancies: Record<string, ComponentType>): <C extends Component, T extends ComponentType<C>>(type: T) => T;

  /**
   * Register component class directly, and decorate it with accessors for other components.
   */
  export function register<C extends Component, T extends ComponentType<C>>(type: T, dependancies: Record<string, ComponentType>): T;

  export function register() {
    switch (arguments.length) {
      case 0:
        return (x: ComponentType) => registerComponent(x, {});
      case 1: {
        const u = arguments[0];
        if (typeof u === "function")
          return registerComponent(u, {});
        else
          return (x: ComponentType) => registerComponent(x, u);
      }
      case 2: return registerComponent(arguments[0], arguments[1]);
    }
  }

  export const stores: ComponentStore[] = [];

  function registerComponent<C extends Component, T extends ComponentType<C>>(type: T, deps: Record<string, ComponentType>): T {

    stores.push(new ComponentStore(type));

    const acc = Object.create(null);
    for (const name of Object.keys(deps)) {
      const dep = deps[name];
      acc[name] = { get() { return Entity.requireComponent(this.entity, dep); } };
    }
    Object.defineProperties(type.prototype, acc);

    return type;

  }

}