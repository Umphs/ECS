# ECS

## Introduction

> **Entity Component System**
>
> (ECS) is an architectural pattern that is mostly used in game development. ECS follows the composition over inheritance principle that allows greater flexibility in defining entities where every object in a game's scene is an entity (e.g. enemies, bullets, vehicles, etc.). Every entity consists of one or more components which add behavior or functionality. Therefore, the behavior of an entity can be changed at runtime by adding or removing components. This eliminates the ambiguity problems of deep and wide inheritance hierarchies that are difficult to understand, maintain and extend. Common ECS approaches are highly compatible and often combined with data-oriented design techniques.
>
> &mdash; [Wikipedia](https://en.wikipedia.org/wiki/Entity_component_system)

## Usage

### Declaring a component

```ts
@Component.register()
class Position extends Component {

  initialize(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  x = 0;
  y = 0;
  z = 0;

}

// or

const Position = Component.register(class Position extends Component {
  // ...
})
```

### Component dependancies

```ts
@Component.register({
  position: Position,
  rotation: Rotation
})
class Transform extends Component {

  // getters are added to the prototype for you

  readonly position!: Position;
  readonly rotation!: Rotation;

  initialize(x: number, y: number, z: number, pitch: number, yaw: number) {
    this.position.initialize(x, y, z);
    this.rotation.initialize(pitch, yaw);
  }

}
```

### Entities

```ts
const e = Entity.create();
Entity.addComponent(Transform);
```

### Prefabs

```ts
const GameObject = Prefab.create([ Transform ], ([ transform ], x: number, y: number, z: number) => {
  transform.initialize(x, y, z, 0, 0);
});
```

### Systems

```ts
@System.register(0 /* order */, { simulate: RigidBody })
class RegidBodySystem {
  // system wide fields go here
  simulate(bodies: RigidBody, dt: number) {
    // `this` is the single instance of RigidBodySystem
    for (const body of bodies) {
      // ...
    }
  }
}

// later

System.initialize(); // this instanciates the rigid body system

// in game loop

System.invoke("simulate", dt);
```

## Pillars

- [x] Ease of use with typescript.
- [x] Not game engine specific.
- [x] Mimimize runtime overhead.

## Roadmap

- [ ] ~Adding tags and querying by tag~ *(**CANCELED**: you can use a collection or similar)*
- [x] Component class and decorator.
- [x] Entity namespace and opaque class.
- [x] Prefab class to facilitate entity composition.
- [x] System registration and invokation.
- [ ] Serialization (saving and loading)

