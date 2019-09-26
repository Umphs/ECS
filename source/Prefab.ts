import { Component } from "./Component";
import { ComponentType } from "./ComponentType";
import { Entity } from "./Entity";

export class Prefab<T extends any[]> {

  static create<A extends Component, B extends Component, C extends Component, D extends Component, T extends any[]>(
    types: [ComponentType<A>, ComponentType<B>, ComponentType<C>, ComponentType<D>],
    inititialize: (components: [A, B, C, D], ...args: T) => void
  ): Prefab<T>;

  static create<A extends Component, B extends Component, C extends Component, T extends any[]>(
    types: [ComponentType<A>, ComponentType<B>, ComponentType<C>],
    inititialize: (components: [A, B, C], ...args: T) => void
  ): Prefab<T>;

  static create<A extends Component, B extends Component, T extends any[]>(
    types: [ComponentType<A>, ComponentType<B>],
    inititialize: (components: [A, B], ...args: T) => void
  ): Prefab<T>;

  static create<A extends Component, T extends any[]>(
    types: [ComponentType<A>],
    inititialize: (components: [A], ...args: T) => void
  ): Prefab<T>;

  static create<T extends any[]>(
    types: ComponentType[],
    inititialize: (components: Component[], ...args: T) => void
  ): Prefab<T>;

  static create(t: any, i: any) {
    return new Prefab(t, i);
  }

  private constructor(
    private types: ComponentType[],
    private inititialize: (components: Component[], ...args: T) => void
  ) { }

  instanciate(...args: T) {
    return this.extend(Entity.create(), ...args);
  }

  extend(e: Entity, ...args: T) {
    const ts = this.types;
    const cs = [];
    for (const t of ts)
      cs.push(Entity.addComponent(e, t, null));
    this.inititialize(cs, ...args);
    return e;
  }

}