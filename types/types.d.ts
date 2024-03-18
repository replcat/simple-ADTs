declare namespace Discriminants {
  type Just = "Just"
  type Nothing = "Nothing"
}

type Constructors = {
  Just:
    & (<T>(value: T) => Just<T>)
    & (new<T>(value: T) => Just<T>)
  Nothing:
    & (() => Nothing)
    & (new() => Nothing)
}

interface Mysterious<T> {
  of(value: T): Mysterious<T>
  map<U>(fn: (value: T) => U): Mysterious<U>
  isa<U extends Mysterious<any>>(constructor: (value?: any) => U): this is U
}

interface Atomic<T> extends Mysterious<T> {
  of(value: T): Atomic<T>
  map<U>(fn: (value: T) => U): Mysterious<U>

  unwrap(): T
}

interface Just<T> extends Atomic<T> {
  of: Constructors["Just"]
  value: T
  map<U>(fn: (value: T) => U): Just<U>
}

interface Nothing extends Atomic<never> {
  of: Constructors["Nothing"]
  map(fn: (value: never) => unknown): Nothing
}

type Maybe<T> = Just<T> | Nothing
