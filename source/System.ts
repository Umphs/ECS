import { ComponentType } from "./ComponentType";
import { Component } from "./Component";

export namespace System {

  type SystemType<K extends string | number | symbol, C extends Component> = {
    new(): Record<K, <T extends any[]>(components: readonly C[], ...args: T) => void>;
  };

  const channels: Record<string | symbol, Function[]> = Object.create(null);

  export function register<
    K extends string | symbol,
    T extends ComponentType<C>,
    C extends Component
  >(types: Record<K, T>) {
    return (system: SystemType<K, C>) => {
      const instance = new system();
      for (const name in types) {
        if (!types.hasOwnProperty || types.hasOwnProperty(name)) {
          const type = types[name] as unknown as typeof Component;
          const components = type.store.components as C[];
          const channel = channels[name] = channels[name] || [];
          channel.push(instance[name].bind(instance, components));
        }
      }
    };
  }

  export function invoke<T extends any[]>(name: string | symbol, ...args: T): void;
  export function invoke(name: any) {
    for (const system of channels[name]) {
      system.apply(null, arguments);
    }
  }

}