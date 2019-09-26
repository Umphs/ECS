import { Component } from "./Component";
import { ComponentType } from "./ComponentType";
import { ComponentStore } from "./ComponentStore";
import { Cleaner } from "./Cleaner";

export declare class Entity { private constructor(); }

export namespace Entity {

  let guid = 0; const cache: Entity[] = [];

  export function create() {
    return cache.length > 0 ? cache.pop()! : guid++ as unknown as Entity;
  }

  export function dispose(e: Entity): void;
  export function dispose(e: Entity, immediate: boolean): void;

  export function dispose(e: Entity, immediate = false) {
    if (immediate) {
      for (const store of Component.stores)
        store.detachComponent(e, false);
      cache.push(e);
    } else {
      Cleaner.queueEntity(e);
    }
  }

  export const Invalid = -1 as unknown as Entity;

  export function addComponent<C extends Component>(entity: Entity, component: C, ...args: any): C;
  export function addComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T, ...args: any): C;

  export function addComponent(e: Entity, x: any, ...args: any) {
    if (typeof x === "function")
      return addComponentT(e, x, args);
    return addComponentC(e, x, args);
  }

  function addComponentT<C extends Component, T extends ComponentType<C>>(e: Entity, t: T, args: any) {
    return ComponentStore.get(t).attachComponent(e, args);
  }

  function addComponentC<C extends Component>(e: Entity, c: C, args: any) {
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

  function removeComponentT<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T, now: boolean) {
    return ComponentStore.get(type).detachComponent(entity, now);
  }

  function removeComponentC<C extends Component>(entity: Entity, component: C, now: boolean) {
    return ComponentStore.get(component).removeComponent(entity, component, now);
  }

  export function getComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T) {
    return ComponentStore.get(type).getComponent(entity);
  }

  export function hasComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T) {
    return ComponentStore.get(type).hasComponent(entity);
  }

  export function requireComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T, ...args: any) {
    return ComponentStore.get(type).requireComponent(entity, args);
  }

}