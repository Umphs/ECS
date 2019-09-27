import { ComponentType } from "./ComponentType";
import { Component } from "./Component";

export namespace System {

  type SystemType<K extends string, C extends Component> = {
    new(): Record<K, {
      <T extends any[]>(...args: T): void;
      <T extends any[]>(components: readonly C[], ...args: T): void;
    }>;
  };

  const channels: Record<string, Function[]> = Object.create(null);
  let systems = new WeakSet<SystemType<string, Component>>();
  let registry: {
    order: number;
    system: SystemType<string, Component>;
    types: Record<string, ComponentType | null>;
  }[] = [];
  let initialized = false;

  export function register<
    K extends string,
    T extends ComponentType<C>,
    C extends Component
  >(order: number, types: Record<K, T | null>): <S extends SystemType<K, C>>(system: S) => S {
    return (system: any) => {
      if (initialized || systems.has(system)) return system;
      registry.push({ order, system, types });
      systems.add(system);
      return system;
    };
  }

  export function initialize() {
    if (initialized) return;
    initialized = true;
    registry.sort((a, b) => Math.sign(a.order - b.order))
    for (const { system, types } of registry) {
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
    registry.length = 0;
    registry = null!;
    systems = null!;
  }

  export function invoke<T extends any[]>(name: string, ...args: T): void;
  export function invoke(name: string) {
    if (!initialized) return;
    const channel = channels[name];
    if (channel) {
      for (const callback of channel) {
        callback.apply(null, arguments);
      }
    }
  }

}