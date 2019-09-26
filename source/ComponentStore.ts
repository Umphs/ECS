import { Component, ComponentType } from "./Component";
import { Entity } from "./Entity";

const stores: ComponentStore[] = [];

export class ComponentStore<C extends Component = Component, T extends ComponentType<C> = ComponentType<C>> {

  static register<C extends Component, T extends ComponentType<C>>(type: T) {
    stores[type.hash] = new ComponentStore(type);
  }

  static get<C extends Component, S extends ComponentStore<C>>(hash: number) {
    const store = stores[hash] as S;
    if (!store) throw `No Component with hash ${hash.toString(16)} was registred.`;
    return store;
  }

  readonly type: T;

  private constructor(type: T) {
    const hash = type.hash;
    if (!hash) throw `A component store expects a hash on the component type.`;
    if (stores[type.hash]) throw `There can only be one component store`;
    this.type = type;
  }

  private cache: C[] = [];
  private indices: Record<number, number> = Object.create(null);
  private components: C[] = [];

  getComponentFor(entity: Entity) {
    const index = this.indices[+entity];
    if (index == undefined) return undefined;
    return this.components[index];
  }

  addTo(entity: Entity) {
    const index = this.indices[+entity];
    if (index) return this.components[index];
    const component = this.rentFor(entity)!;
    component.enable();
    return component;
  }

  private rentFor(entity: Entity): C {
    const components = this.components;
    const indices = this.indices;
    let index = indices[+entity];
    let component: C;
    const cache = this.cache;
    if (cache.length > 0) {
      component = cache.pop()!;
      component.entity = entity;
    } else {
      component = new this.type(entity);
    }
    index = components.length;
    components.push(component);
    indices[+entity] = index;
    return component;
  }

  removeFrom(entity: Entity) {
    if (this.indices[+entity]) {
      const component = this.getComponentFor(entity)!;
      component.disable();
      this.return(component);
    }
  }

  private return(component: C) {
    const indices = this.indices;
    const entity = +component.entity;
    const index = indices[entity];
    if (index == undefined) return;
    const cache = this.cache;
    const components = this.components;
    const last = components.pop()!;
    if (last !== component) {
      components[index] = last;
      indices[+last.entity] = index;
    }
    delete indices[entity];
    cache.push(component);
  }

  static removeAllFrom(entity: Entity) {
    for (const store of stores) {
      entity.removeComponent(store.type);
    }
  }

}