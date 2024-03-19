type Constructors = {
  Just:
    & (<T>(value: T) => Just<T>)
    & (new<T>(value: T) => Just<T>)
  Nothing:
    & (() => Nothing)
    & (new() => Nothing)
  Failure:
    & ((arg?: any) => Failure)
    & (new(arg?: any) => Failure)
}

interface ADT<T = unknown> {
  isa<U extends ADT>(constructor: (value?: any) => U): this is U
  map<U>(fn: (value: T) => U): ADT<U>
  unwrap(): T
}

interface Just<T = unknown> extends ADT<T> {
  value: T
  map<U>(fn: (value: T) => U): Just<U>
}

interface Nothing extends ADT<never> {
  map<U>(fn: (value: never) => U): this
}

interface Failure extends ADT<never>, Error {
  map<U>(fn: (value: never) => U): this
}

type Maybe<T> = Just<T> | Nothing
type Result<T> = Just<T> | Failure
