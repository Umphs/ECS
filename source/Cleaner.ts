import { Entity } from "./Entity";
import { Component } from "./Component";
import { ComponentStore } from "./ComponentStore";

export namespace Cleaner {

  const entities: Entity[] = [];
  const components = new Set<Component>();
  const stores = new Map<Component, ComponentStore>();

  export function queueComponent(store: ComponentStore, component: Component) {
    cleanupComponents();
    components.add(component);
    stores.set(component, store);
  }

  const cleanupComponents = debounce(() => {
    for (const component of components) {
      stores.get(component)!.dispose(component);
    }
    components.clear();
    stores.clear();
  });

  export function queueEntity(e: Entity) {
    cleanupEntities();
    entities.push(e);
  }

  const cleanupEntities = debounce(() => {
    for (const e of entities) {
      Entity.dispose(e, true);
    }
    entities.length = 0;
  });

  function debounce(fn: () => void) {
    let skip = false;
    const cb = () => { fn(); skip = true; };
    return () => {
      if (skip) return; skip = true;
      setTimeout(cb, 0);
    };
  }

}