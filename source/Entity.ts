import { Component, ComponentType } from "./Component";
import { ComponentStore } from "./ComponentStore";

export class Entity {

  constructor() { return Entity.create(); }

  getComponent<C extends Component, T extends ComponentType<C>>(type: T) {
    return ComponentStore.get(type.hash).getComponentFor(this)!;
  }

  addComponent<C extends Component, T extends ComponentType<C>>(type: T) {
    return ComponentStore.get(type.hash).addTo(this);
  }

  removeComponent<C extends Component, T extends ComponentType<C>>(type: T) {
    return ComponentStore.get(type.hash).removeFrom(this);
  }

}

export namespace Entity {

  const src = Entity.prototype;
  const dst = Number.prototype as unknown as Entity;

  Object.assign(dst, src);

  let guid = 0; const reusables: number[] = [];

  export function create() {
    return make();
  }

  export function dispose(entity: Entity) {
    ComponentStore.removeAllFrom(entity)
    reuse(entity);
  }

  // @ts-ignore
  function make(): Entity;
  function make() {
    return (
      reusables.length > 0 ?
        reusables.pop()! :
        guid++
    );
  }

  // @ts-ignore
  function reuse(entity: Entity): void;
  function reuse(uuid: number) {
    if (guid === uuid + 1) {
      guid = uuid;
    } else {
      reusables.push(uuid);
    }
  }

}