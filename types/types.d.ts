type Constructors = {
  Just:
    & (<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
    & (new<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
  Nothing:
    & (() => Nothing)
    & (new() => Nothing)
  Failure:
    & ((error?: Error | string, ...notes: any) => Failure)
    & (new(error?: Error | string, ...notes: any) => Failure)
}

interface ADT<T = unknown> {
  isa<U extends ADT>(constructor: (value?: any) => U): this is U
  map<U>(fn: (value: T) => U): ADT<U>
  unwrap(): T
}

interface Just<T = unknown> extends ADT<T> {
  value: NonNullable<T>
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
