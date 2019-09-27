(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.ESC = {}));
}(this, function (exports) { 'use strict';

    function createRecord() {
        const record = Object.create(null);
        return {
            has(k) { return record[k]; },
            get(k) { return record[k]; },
            delete(k) { delete record[k]; },
            set(k, value) { record[k] = value; },
        };
    }
    function debounce(fn) {
        let skip = false;
        const cb = () => { fn(); skip = true; };
        return () => {
            if (skip)
                return;
            skip = true;
            setTimeout(cb, 0);
        };
    }

    const disposedComponents = new Set();
    function disposeLater(component) {
        disposeComponents();
        disposedComponents.add(component);
    }
    const disposeComponents = debounce(() => {
        for (const component of disposedComponents) {
            component.dispose();
        }
        disposedComponents.clear();
    });
    class ComponentStore {
        constructor(type) {
            this.type = type;
            this.pool = [];
            this.indices = createRecord();
            const prototype = type.prototype;
            this.use = prototype.initialize;
            this.unuse = prototype.dispose;
            this.components = [];
        }
        create(e, args) {
            const pool = this.pool;
            let component;
            if (pool.length > 0) {
                component = pool.pop();
            }
            else {
                component = new this.type();
            }
            this.attach(e, component, args);
            return component;
        }
        attach(e, component, args) {
            const components = this.components;
            const index = components.length;
            this.indices.set(+e, index);
            components.push(component);
            component.entity = e;
            if (args)
                this.use.apply(component, args);
        }
        dispose(component) {
            this.unuse.apply(component);
            const e = +component.entity;
            const indices = this.indices;
            indices.delete(e);
            component.entity = -1;
            const components = this.components;
            const index = indices.get(e);
            const last = components.pop();
            if (index !== components.length) {
                indices.set(+last.entity, index);
                components[index] = last;
            }
            this.pool.push(component);
        }
        hasComponent(e) {
            return this.indices.has(+e);
        }
        compareComponent(e, component) {
            return this.getComponent(e) === component;
        }
        getComponent(e) {
            const i = this.indices.get(+e);
            if (i === undefined)
                return undefined;
            return this.components[i];
        }
        attachComponent(e, args) {
            const i = this.indices.get(+e);
            if (i !== undefined)
                return undefined;
            return this.create(e, args);
        }
        requireComponent(e, args) {
            const i = this.indices.get(+e);
            if (i === undefined)
                return this.create(e, args);
            else {
                return this.components[i];
            }
        }
        addComponent(e, component, args) {
            let i;
            if ((component.entity !== -1) ||
                ((i = this.indices.get(+e)) === undefined))
                return false;
            this.attach(e, component, args);
            return true;
        }
        detachComponent(e, now) {
            const i = this.indices.get(+e);
            if (i === undefined)
                return false;
            const component = this.components[i];
            if (now)
                this.dispose(component);
            else
                disposeLater(component);
            return true;
        }
        removeComponent(e, component, immediate) {
            let i;
            if ((component.entity !== e) ||
                ((i = this.indices.get(+e)) === undefined) ||
                (this.components[i] !== component))
                return false;
            if (immediate)
                this.dispose(component);
            else
                disposeLater(component);
            return true;
        }
        static get(x) {
            return typeof x === "function" ? x.store : x.constructor.store;
        }
    }

    class Component {
        constructor() {
            this.entity = -1;
        }
        initialize() { }
        dispose() { }
    }
    (function (Component) {
        function register() {
            switch (arguments.length) {
                case 0:
                    return (x) => registerComponent(x, {});
                case 1: {
                    const u = arguments[0];
                    if (typeof u === "function")
                        return registerComponent(u, {});
                    else
                        return (x) => registerComponent(x, u);
                }
                case 2: return registerComponent(arguments[0], arguments[1]);
            }
        }
        Component.register = register;
        Component.stores = [];
        function registerComponent(type, deps) {
            Component.stores.push(new ComponentStore(type));
            const acc = Object.create(null);
            for (const name of Object.keys(deps)) {
                acc[name] = Component.createAccessor(deps[name]);
            }
            Object.defineProperties(type.prototype, acc);
            return type;
        }
    })(Component || (Component = {}));

    (function (Entity) {
        Component.createAccessor = (type) => {
            return { get() { return requireComponent(this.entity, type); } };
        };
        let guid = 0;
        const cache = [];
        function create() {
            return cache.length > 0 ? cache.pop() : guid++;
        }
        Entity.create = create;
        const disposedEntities = new Set();
        const disposeEntities = debounce(() => {
            for (const e of disposedEntities) {
                disposeNow(e);
            }
            disposedEntities.clear();
        });
        function disposeNow(e) {
            for (const store of Component.stores)
                store.detachComponent(e, false);
            cache.push(e);
        }
        function dispose(e, now = false) {
            if (now) {
                disposeNow(e);
            }
            else {
                disposeEntities();
                disposedEntities.add(e);
            }
        }
        Entity.dispose = dispose;
        Entity.Invalid = -1;
        function addComponent(e, x, ...args) {
            if (arguments.length === 3 && arguments[2] === null)
                args = null;
            if (typeof x === "function")
                return addComponentT(e, x, args);
            return addComponentC(e, x, args);
        }
        Entity.addComponent = addComponent;
        function addComponentT(e, t, args) {
            return ComponentStore.get(t).attachComponent(e, args);
        }
        function addComponentC(e, c, args) {
            return ComponentStore.get(c).addComponent(e, c, args);
        }
        function removeComponent(entity, x, now = false) {
            if (typeof x === "function")
                return removeComponentT(entity, x, now);
            return removeComponentC(entity, x, now);
        }
        Entity.removeComponent = removeComponent;
        function removeComponentT(entity, type, now) {
            return ComponentStore.get(type).detachComponent(entity, now);
        }
        function removeComponentC(entity, component, now) {
            return ComponentStore.get(component).removeComponent(entity, component, now);
        }
        function getComponent(entity, type) {
            return ComponentStore.get(type).getComponent(entity);
        }
        Entity.getComponent = getComponent;
        function hasComponent(entity, type) {
            return ComponentStore.get(type).hasComponent(entity);
        }
        Entity.hasComponent = hasComponent;
        function requireComponent(entity, type, ...args) {
            return ComponentStore.get(type).requireComponent(entity, args);
        }
        Entity.requireComponent = requireComponent;
    })(exports.Entity || (exports.Entity = {}));

    class Prefab {
        constructor(types, inititialize) {
            this.types = types;
            this.inititialize = inititialize;
        }
        static create(t, i) {
            return new Prefab(t, i);
        }
        instanciate(...args) {
            return this.extend(exports.Entity.create(), ...args);
        }
        extend(e, ...args) {
            const ts = this.types;
            const cs = [];
            for (const t of ts)
                cs.push(exports.Entity.addComponent(e, t, null));
            this.inititialize(cs, ...args);
            return e;
        }
    }

    (function (System) {
        const channels = Object.create(null);
        let systems = new WeakSet();
        let registry = [];
        let initialized = false;
        function register(order, types) {
            return (system) => {
                if (initialized || systems.has(system))
                    return system;
                registry.push({ order, system, types });
                systems.add(system);
                return system;
            };
        }
        System.register = register;
        function initialize() {
            if (initialized)
                return;
            initialized = true;
            registry.sort((a, b) => Math.sign(a.order - b.order));
            for (const { system, types } of registry) {
                const instance = new system();
                for (const name in types) {
                    if (!types.hasOwnProperty || types.hasOwnProperty(name)) {
                        const channel = channels[name] = channels[name] || [];
                        const type = types[name];
                        let callback;
                        if (type) {
                            callback = instance[name].bind(instance, type.store.components);
                        }
                        else {
                            callback = instance[name].bind(instance);
                        }
                        channel.push(callback);
                    }
                }
            }
            registry.length = 0;
            registry = null;
            systems = null;
        }
        System.initialize = initialize;
        function invoke(name) {
            if (!initialized)
                return;
            const channel = channels[name];
            if (channel) {
                for (const callback of channel) {
                    callback.apply(null, arguments);
                }
            }
        }
        System.invoke = invoke;
    })(exports.System || (exports.System = {}));

    exports.Component = Component;
    exports.Prefab = Prefab;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
