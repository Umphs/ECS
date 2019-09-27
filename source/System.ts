import { ComponentType } from "./ComponentType";
import { Component } from "./Component";

export namespace System {

  type SystemType<K extends string, C extends Component> = {
    new(): Record<K, {
      <T extends any[]>(...args: T): void;
      <T extends any[]>(components: readonly C[], ...args: T): void;
    }>;
  };

  const systems: {
    order: number;
    system: SystemType<string, Component>;
    types: Record<string, ComponentType | null>;
  }[] = [];

  const channels: Record<string, Function[]> = Object.create(null);

  export function register<
    K extends string,
    T extends ComponentType<C>,
    C extends Component
  >(order: number, types: Record<K, T | null>) {
    return <S extends SystemType<K, C>>(system: S) => {
      // @ts-ignore
      systems.push({ order, system, types });
    };
  }

  export function initialize() {
    systems.sort((a, b) => Math.sign(a.order - b.order))
    for (const { system, types } of systems) {
      const instance = new system();
      for (const name in types) {
        if (!types.hasOwnProperty || types.hasOwnProperty(name)) {
          const channel = channels[name] = channels[name] || [];
          const type = types[name] as unknown as typeof Component;
          let callback: Function;
          if (type) {
            callback = instance[name].bind(instance, type.store.components);
          } else {
            callback = instance[name].bind(instance);
          }
          channel.push(callback);
        }
      }
    }
  }

  export function invoke<T extends any[]>(name: string, ...args: T): void;
  export function invoke(name: string) {
    for (const callback of channels[name]) {
      callback.apply(null, arguments);
    }
  }

}