declare namespace ADT {
  type Just<T> = globalThis.Just<T>
  type Nothing = globalThis.Nothing
  type Constructors = {
    Just:
      & (<T>(value: T) => Just<T>)
      & (new<T>(value: T) => Just<T>)
    Nothing:
      & (() => Nothing)
      & (new() => Nothing)
  }
}

interface Mysterious<T> {
  isa<U extends Mysterious<any>>(constructor: (value?: any) => U): this is U

  of(value: T): Mysterious<T>
  map<U>(fn: (value: T) => U): Mysterious<U>
}

interface Atomic<T> extends Mysterious<T> {
  unwrap(): T
}

interface Just<T> extends Atomic<T> {
  value: T
  map<U>(fn: (value: T) => U): Just<U>
}

interface Nothing extends Atomic<never> {
  map(fn: (value: never) => unknown): Nothing
}

type Maybe<T> = Just<T> | Nothing
