import { Component } from "./Component";
import { ComponentType } from "./ComponentType";
import { Entity } from "./Entity";
import { createRecord, debounce } from "./utils";

const disposedComponents = new Set<Component>();

export function disposeLater(component: Component) {
  disposeComponents();
  disposedComponents.add(component);
}

const disposeComponents = debounce(() => {
  for (const component of disposedComponents) {
    component.dispose();
  }
  disposedComponents.clear();
});

export class ComponentStore<C extends Component<T> = Component<any>, T extends any[] = any> {

  private pool: C[] = [];
  private indices = createRecord<number, number>();
  private use: typeof Component.prototype.initialize;
  private unuse: typeof Component.prototype.dispose;
  readonly components: C[];

  constructor(private type: ComponentType<C>) {
    const prototype = type.prototype;
    this.use = prototype.initialize;
    this.unuse = prototype.dispose;
    this.components = [];
  }

  private create(e: Entity, args: any) {
    const pool = this.pool;
    let component: C;
    if (pool.length > 0) {
      component = pool.pop()!;
    } else {
      component = new this.type();
    }
    this.attach(e, component, args);
    return component;
  }

  attach(e: Entity, component: C, args: any) {
    const components = this.components;
    const index = components.length;
    this.indices.set(+e, index);
    components.push(component);
    // @ts-ignore
    component.entity = e;
    if (args) this.use.apply(component, args);
  }

  dispose(component: C) {
    this.unuse.apply(component);
    const e = +component.entity;
    const indices = this.indices;
    indices.delete(e);
    // @ts-ignore
    component.entity = -1 as unknown as Entity;
    const components = this.components;
    const index = indices.get(e);
    const last = components.pop()!;
    if (index !== components.length) {
      indices.set(+last.entity, index);
      components[index] = last;
    }
    this.pool.push(component);
  }

  hasComponent(e: Entity) {
    return this.indices.has(+e);
  }

  compareComponent(e: Entity, component: C) {
    return this.getComponent(e) === component;
  }

  getComponent(e: Entity) {
    const i = this.indices.get(+e);
    if (i === undefined) return undefined;
    return this.components[i];
  }

  attachComponent(e: Entity, args: any) {
    const i = this.indices.get(+e);
    if (i !== undefined) return undefined;
    return this.create(e, args);
  }

  requireComponent(e: Entity, args: any) {
    const i = this.indices.get(+e);
    if (i === undefined)
      return this.create(e, args);
    else {
      return this.components[i];
    }
  }

  addComponent(e: Entity, component: C, args: any) {
    let i: number;
    if (
      (component.entity !== -1) ||
      ((i = this.indices.get(+e)) === undefined)
    ) return false;
    this.attach(e, component, args);
    return true;
  }

  detachComponent(e: Entity, now: boolean) {
    const i = this.indices.get(+e);
    if (i === undefined) return false;
    const component = this.components[i];
    if (now) this.dispose(component);
    else disposeLater(component);
    return true;
  }

  removeComponent(e: Entity, component: C, immediate: boolean) {

    let i: number;

    if (
      (component.entity !== e) ||
      ((i = this.indices.get(+e)) === undefined) ||
      (this.components[i] !== component)
    ) return false;

    if (immediate)
      this.dispose(component);
    else
      disposeLater(component);

    return true;

  }

  static get<C extends Component<T>, T extends any[]>(type: ComponentType<C>): ComponentStore<C>;
  static get<C extends Component<T>, T extends any[]>(component: C): ComponentStore<C>;

  static get(x: any) {
    return typeof x === "function" ? x.store : x.constructor.store;
  }

}