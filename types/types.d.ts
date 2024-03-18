declare namespace ADT {
  type Some<T> = globalThis.Some<T>
  type None = globalThis.None
  type List<T> = globalThis.List<T>
}

type Constructor<T> = new(...args: any[]) => T

interface ADT<T> {
  isa<U extends ADT<any>>(constructor: Constructor<U>): this is U
  of(value: T): ADT<T>
  map<U>(fn: (value: T) => U): ADT<U>
}

interface Atom<T> extends ADT<T> {
  unwrap(): T
}

interface Some<T> extends Constructor<Some<T>>, Atom<T> {
  name: "Some"
  <T>(value: T): Some<T>
  value: T
  map<U>(fn: (value: T) => U): Some<U>
}

interface None extends Constructor<None>, Atom<never> {
  name: "None"
  (): None
  map(fn: (value: never) => unknown): None
}

interface Collection<T> extends ADT<T> {}

interface List<T> extends Constructor<List<T>>, Collection<T> {
  name: "List"
  <T>(array: Array<T>): List<T>
  filter<U extends T>(predicate: (value: T) => value is U): List<U>
  toArray(): T[]
}
