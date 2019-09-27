# ECS

## Introduction

> **Entity Component System**
>
> (ECS) is an architectural pattern that is mostly used in game development. ECS follows the composition over inheritance principle that allows greater flexibility in defining entities where every object in a game's scene is an entity (e.g. enemies, bullets, vehicles, etc.). Every entity consists of one or more components which add behavior or functionality. Therefore, the behavior of an entity can be changed at runtime by adding or removing components. This eliminates the ambiguity problems of deep and wide inheritance hierarchies that are difficult to understand, maintain and extend. Common ECS approaches are highly compatible and often combined with data-oriented design techniques.
>
> &mdash; [Wikipedia](https://en.wikipedia.org/wiki/Entity_component_system)

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

