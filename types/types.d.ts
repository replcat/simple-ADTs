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
  // TODO add (fake) type constructors for Maybe and Result?
}

type Handler<T, U> = (value: T) => U

interface Base<T = unknown> {
  isa<U extends Base>(constructor: (value?: any) => U): this is U
  map<U>(fn: (value: T) => U): Base<U>
  match<J, N, F>(matcher: { Just: Handler<T, J>; Nothing: Handler<never, N>; Failure: Handler<never, F> }): MatchType<J | N | F>
  unwrap(): T
}

interface Just<T = unknown> extends Base<T> {
  name: "Just"
  value: NonNullable<T>
  map<U>(fn: (value: T) => U): Just<U>
  match<U>(matcher: { Just: Handler<T, U> }): MatchType<U>
}

interface Nothing extends Base<never> {
  name: "Nothing"
  map<U>(fn: (value: never) => U): this
  match<N>(matcher: { Nothing: Handler<never, N> }): MatchType<N>
}

interface Failure extends Base<never>, Error {
  name: "Failure"
  map<U>(fn: (value: never) => U): this
  match<F>(matcher: { Failure: Handler<never, F> }): MatchType<F>
}

interface Maybe<T = unknown> extends Base<T> {
  name: Just["name"] | Nothing["name"]
  map<U>(fn: (value: T) => U): Maybe<U>
  match<J, N>(matcher: { Just: Handler<T, J>; Nothing: Handler<never, N> }): MatchType<J | N>
}

interface Result<T = unknown> extends Base<T> {
  name: Just["name"] | Failure["name"]
  map<U>(fn: (value: T) => U): Result<U>
  match<J, F>(matcher: { Just: Handler<T, J>; Failure: Handler<never, F> }): MatchType<J | F>
}

interface Threeway<T = unknown> extends Base<T> {
  name: Just["name"] | Nothing["name"] | Failure["name"]
  map<U>(fn: (value: T) => U): Threeway<U>
  match<J, N, F>(matcher: { Just: Handler<T, J>; Nothing: Handler<never, N>; Failure: Handler<never, F> }): MatchType<J | N | F>
}

type MatchType<T> = T extends Just<infer U> ? Just<U>
  : T extends Nothing ? Nothing
  : T extends Failure ? Failure
  : T extends Just<infer U> | Nothing ? Maybe<U>
  : T extends Just<infer U> | Failure ? Result<U>
  : T extends Just<infer U> | Nothing | Failure ? Threeway<U>
  : never
