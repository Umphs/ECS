import { Component } from "./Component";
import { ComponentType } from "./ComponentType";
import { ComponentStore } from "./ComponentStore";

export declare class Entity { private constructor(); }

export namespace Entity {

  export const Invalid = -1 as unknown as Entity;

  export function addComponent<C extends Component>(entity: Entity, component: C): C;
  export function addComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T): C;

  export function addComponent(entity: Entity, x: any, ...args: any) {
    if (typeof x === "function")
      return addComponentT(entity, x, args);
    return addComponentC(entity, x, args);
  }

  function addComponentT<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T, args: any) {
    return ComponentStore.get(type).attachComponent(entity, args);
  }

  function addComponentC<C extends Component>(entity: Entity, component: C, args: any) {
    return ComponentStore.get(component).addComponent(entity, component, args);
  }

  export function removeComponent<C extends Component>(entity: Entity, component: C): void;
  export function removeComponent<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T): void;

  export function removeComponent(entity: Entity, x: any) {
    if (typeof x === "function")
      return removeComponentT(entity, x);
    return removeComponentC(entity, x);
  }

  function removeComponentT<C extends Component, T extends ComponentType<C>>(entity: Entity, type: T) {
    return ComponentStore.get(type).detachComponent(entity);
  }

  function removeComponentC<C extends Component>(entity: Entity, component: C) {
    return ComponentStore.get(component).removeComponent(entity, component);
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