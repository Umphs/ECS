import { Component } from "./Component";
import { ComponentType } from "./ComponentType";
import { ComponentStore } from "./ComponentStore";
import { debounce } from "./utils";

export declare class Entity { private constructor(); }

export namespace Entity {

  Component.createAccessor = (type) => {
    return { get() { return requireComponent(this.entity, type); } };
  };

  let guid = 0; const cache: Entity[] = [];

  export function create() {
    return cache.length > 0 ? cache.pop()! : guid++ as unknown as Entity;
  }

  const disposedEntities = new Set<Entity>();
  const disposeEntities = debounce(() => {
    for (const e of disposedEntities) {
      disposeNow(e);
    }
    disposedEntities.clear();
  });

  function disposeNow(e: Entity) {
    for (const store of Component.stores)
      store.detachComponent(e, false);
    cache.push(e);
  }

  export function dispose(e: Entity): void;
  export function dispose(e: Entity, immediate: boolean): void;

  export function dispose(e: Entity, now = false) {
    if (now) {
      disposeNow(e);
    } else {
      disposeEntities();
      disposedEntities.add(e);
    }
  }

  export const Invalid = -1 as unknown as Entity;

  export function addComponent<C extends Component<A>, A extends any[]>(entity: Entity, component: C, ...args: A): C;
  export function addComponent<C extends Component<A>, A extends any[], T extends ComponentType<C>>(entity: Entity, type: T, ...args: A): C;

  export function addComponent(e: Entity, x: any, ...args: any) {
    if (arguments.length === 3 && arguments[2] === null) args = null;
    if (typeof x === "function")
      return addComponentT(e, x, args);
    return addComponentC(e, x, args);
  }

  function addComponentT(e: Entity, t: any, args: any) {
    return ComponentStore.get(t).attachComponent(e, args);
  }

  function addComponentC(e: Entity, c: any, args: any) {
    return ComponentStore.get(c).addComponent(e, c, args);
  }

  export function removeComponent<C extends Component>(entity: Entity, component: C): void;
  export function removeComponent<C extends Component>(entity: Entity, component: C, immediate: boolean): void;
  export function removeComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T): void;
  export function removeComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T, immediate: boolean): void;

  export function removeComponent(entity: Entity, x: any, now = false) {
    if (typeof x === "function")
      return removeComponentT(entity, x, now);
    return removeComponentC(entity, x, now);
  }

  function removeComponentT(entity: Entity, type: any, now: boolean) {
    return ComponentStore.get(type).detachComponent(entity, now);
  }

  function removeComponentC(entity: Entity, component: any, now: boolean) {
    return ComponentStore.get(component).removeComponent(entity, component, now);
  }

  export function getComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T) {
    return ComponentStore.get(type).getComponent(entity);
  }

  export function hasComponent<C extends Component<A>, A extends any[], T extends ComponentType<C>>(entity: Entity, type: T) {
    return ComponentStore.get(type).hasComponent(entity);
  }

  export function requireComponent<C extends Component<A>, A extends any[], T extends ComponentType<C>>(entity: Entity, type: T, ...args: any) {
    return ComponentStore.get(type).requireComponent(entity, args);
  }

}