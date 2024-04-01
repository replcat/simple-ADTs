type Constructors = {
  Outcome:
    & (<O extends Outcome>(value: O) => Outcome<O>)
    & (<T>(value?: T | Error) => Outcome<T extends Error ? never : NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Outcome<T>
      ap: <T, U>(fn: Outcome<(value: T) => U>) => (outcome: Outcome<T>) => Outcome<U>
      chain: <T, F extends Outcome<any>>(fn: (value: InnermostWrappedTypeOf<T>) => F) => (outcome: Outcome<T>) => F
      flatten: () => <O extends Outcome>(outcome: O) => Flatten<O>
      join: () => <O extends Outcome>(outcome: O) => Join<O>
      map: <T, U>(fn: (value: T) => U) => (outcome: Outcome<T>) => Outcome<U>
      traverse: <T, F extends Outcome<any>>(fn: (value: T) => F) => (outcome: Outcome<T>) => Outcome<F>
      fold: <T, U, E>(on_value: (value?: T) => U, on_error?: (error: Error) => E) => (outcome: Outcome<T>) => U | E
      match: <T, J, N, F>(matcher: {
        Just: (value: T) => J
        Nothing: () => N
        Failure: (error: Error) => F
      }) => (outcome: Outcome<T>) => Consolidate<J | N | F>
    }

  Maybe:
    & (<O extends Outcome>(value: O) => Maybe<O>)
    & (<T>(value?: T) => Maybe<NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Maybe<T>
      ap: <T, U>(fn: Maybe<(value: T) => U>) => (maybe: Maybe<T>) => Maybe<U>
      chain: <T, F extends Maybe<any>>(fn: (value: InnermostWrappedTypeOf<T>) => F) => (maybe: Maybe<T>) => F
      flatten: () => <O extends Maybe>(maybe: O) => Flatten<O>
      join: () => <O extends Maybe>(maybe: O) => Join<O>
      map: <T, U>(fn: (value: T) => U) => (maybe: Maybe<T>) => Maybe<U>
      traverse: <T, F extends Maybe<any>>(fn: (value: T) => F) => (maybe: Maybe<T>) => Maybe<F>
      fold: <T, U, E>(on_value: (value?: T) => U, on_nothing?: () => E) => (maybe: Maybe<T>) => U | E
      match: <T, J, N>(matcher: {
        Just: (value: T) => J
        Nothing: () => N
      }) => (maybe: Maybe<T>) => Consolidate<J | N>
    }

  Result:
    & (<O extends Outcome>(value: O) => Result<O>)
    & (<T>(value?: T | Error) => Result<T extends Error ? unknown : NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Result<T>
      ap: <T, U>(fn: Result<(value: T) => U>) => (result: Result<T>) => Result<U>
      chain: <T, F extends Result<any>>(fn: (value: InnermostWrappedTypeOf<T>) => F) => (result: Result<T>) => F
      flatten: () => <O extends Result>(result: O) => Flatten<O>
      join: () => <O extends Result>(result: O) => Join<O>
      map: <T, U>(fn: (value: T) => U) => (result: Result<T>) => Result<U>
      traverse: <T, F extends Result<any>>(fn: (value: T) => F) => (result: Result<T>) => Result<F>
      fold: <T, U, E>(on_value: (value: T) => U, on_error?: (error: Error) => E) => (result: Result<T>) => U | E
      match: <T, J, F>(matcher: {
        Just: (value: T) => J
        Failure: (error: Error) => F
      }) => (result: Result<T>) => Consolidate<J | F>
    }

  Just:
    & (<O extends Outcome>(value: O) => Just<O>)
    & (<T>(value: NonNullable<T>) => Just<T>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Just<T>
      ap: <T, U>(fn: Just<(value: T) => U>) => (Just: Just<T>) => Just<U>
      chain: <T, F extends Just<any>>(fn: (value: InnermostWrappedTypeOf<T>) => F) => (Just: Just<T>) => F
      flatten: () => <O extends Just>(just: O) => Flatten<O>
      join: () => <O extends Just>(just: O) => Join<O>
      map: <T, U>(fn: (value: T) => U) => (Just: Just<T>) => Just<U>
      traverse: <T, F extends Just<any>>(fn: (value: T) => F) => (Just: Just<T>) => Just<F>
      fold: <T, U>(fn: (value: T) => U) => (Just: Just<T>) => U
    }

  Nothing:
    & (() => Nothing)
    & {
      isa: () => (instance: Outcome<any>) => instance is Nothing
      fold: <E>(_: any, on_nothing: () => E) => (nothing: Nothing) => E
    }

  Failure:
    & ((error?: string | Error, cause?: unknown) => Failure)
    & {
      isa: () => (instance: Outcome<any>) => instance is Nothing
      fold: <E>(_: any, on_failure: (error: Error) => E) => (failure: Failure) => E
    }

  Subject: {
    <O extends Nothing>(): Subject<Nothing>
    <O extends Outcome>(init: O): Subject<O>
  }
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Outcome<T = unknown> {
  name: "Just" | "Nothing" | "Failure"

  isa<U>(constructor: (arg?: any) => U): this is U extends Just ? Just<T>
    : U extends Nothing ? Nothing
    : U extends Failure ? Failure
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Outcome<T>

  join<U>(this: U): Join<U>
  flatten<U>(this: U): Flatten<U>

  unwrap(): T
  unwrap_or<U>(value: U): T | U
  unwrap_or_else<U>(fn: () => U): T | U

  unwrap_error(): Error
  unwrap_error_or<U>(value: U): Error | U
  unwrap_error_or_else<U>(fn: () => U): Error | U

  chain<U, F extends Outcome<U>>(fn: (value: InnermostWrappedTypeOf<T>) => F): F
  fold<U, E>(on_value: (value?: T) => U, otherwise?: (error: Error) => E): U | E

  map<U>(fn: (value: T) => U): this extends Just<T> ? Just<U>
    : this extends Nothing ? Nothing
    : this extends Failure ? Failure
    : this extends Maybe<T> ? Maybe<U>
    : this extends Result<T> ? Result<U>
    : this extends Outcome<T> ? Outcome<U>
    : never

  ap<V extends Outcome<(value: T) => any>>(this: Outcome<T>, fn: V): V extends Just<(value: T) => any> ? Just<WrappedReturn<V>>
    : V extends Nothing ? Nothing
    : V extends Failure ? Failure
    : V extends Maybe<(value: T) => any> ? Maybe<WrappedReturn<V>>
    : V extends Result<(value: T) => any> ? Result<WrappedReturn<V>>
    : Outcome<WrappedReturn<V>>

  traverse<U, F extends Outcome<U>>(fn: (value: InnermostWrappedTypeOf<T>) => F): this extends Just<T> ? Just<F>
    : this extends Nothing ? Nothing
    : this extends Failure ? Failure
    : this extends Maybe<T> ? Maybe<F>
    : this extends Result<T> ? Result<F>
    : Outcome<F>

  match<Sout = never, NOut = never, FOut = never>(matcher: Matcher<this, T, Sout, NOut, FOut>): Consolidate<Sout | NOut | FOut>
}

/**
 * Union of Just and Nothing.
 * No runtime representation.
 */
type Maybe<T = unknown> = Just<T> | Nothing<T>

/**
 * Union of Just and Failure.
 * No runtime representation.
 */
type Result<T = unknown> = Just<T> | Failure<T>

/**
 * A value that isn't merely hypothetical — it's right there, look.
 * Corresponds to the `Just` type at runtime.
 */
interface Just<T = unknown> extends Outcome<T> {
  name: "Just"
  value: T
  fold<U>(fn: (value: T) => U): U
}

/**
 * An absent value that was optional anyway, so no big deal.
 * Corresponds to the `Nothing` type at runtime.
 */
interface Nothing<T = never> extends Outcome<T> {
  name: "Nothing"
  fold<E>(_: any, on_nothing: () => E): E
}

/**
 * An absent value that *possibly* should have existed (but it depends).
 * Corresponds to the `Failure` type at runtime.
 */
interface Failure<T = never> extends Outcome<T> {
  name: "Failure"
  error: Error
  get message(): string
  fold<E>(_: any, on_failure: (error: Error) => E): E
}

type Matcher<Self extends Outcome<T>, T, Sout, NOut, FOut> = {
  [K in Self["name"]]: K extends "Just" ? (value: T) => Sout
    : K extends "Nothing" ? () => NOut
    : K extends "Failure" ? (error: Error) => FOut
    : never
}

type Consolidate<Union> = (
  [Union] extends [Just<infer T>] ? Just<T>
    : [Union] extends [Nothing<infer T>] ? Nothing<T>
    : [Union] extends [Failure<infer T>] ? Failure<T>
    : [Union] extends [Just<infer T> | Nothing<infer T>] ? Maybe<T>
    : [Union] extends [Just<infer T> | Failure<infer T>] ? Result<T>
    : [Union] extends [Just<infer T> | Nothing<infer T> | Failure<infer T>] ? Outcome<T>
    : Union // not never, to allow other types through
)

type WrappedReturn<T> = T extends Outcome<(arg: any) => infer U> ? U : never

type InnermostWrappedTypeOf<T> = T extends Outcome<infer U> ? InnermostWrappedTypeOf<U> : T
type WrappedTypeOf<T> = T extends Outcome<infer U> ? U : T

type EnclosingContextOf<O, T> = O extends Just<any> ? Just<T>
  : O extends Maybe<any> ? Maybe<T>
  : O extends Result<any> ? Result<T>
  : O extends Outcome<any> ? Outcome<T>
  : T

type Join<O> =
  // if the outer type is Nothing or Failure, return it directly
  [O] extends [Nothing] ? O : [O] extends [Failure] ? O
    // otherwise, if the outer type is an Outcome...
  : [O] extends [Outcome<infer T>] ? (
      // and its wrapping an Outcome...
      [T] extends [Outcome] ? (
          // then if the outer type is a Just, return the wrapped type
          [O] extends [Just] ? T
            // otherwise, join the inner and outer contexts around the wrapped type
            : Consolidate<EnclosingContextOf<O | T, WrappedTypeOf<T>>>
        )
        : O // (the wrapped type is not an Outcome)
    )
  : O // (the outer type is not an Outcome)

type Flatten<T> = [T] extends [Join<T>] ? T : Flatten<Join<T>>

type Subscriber<O> =
  | { next: (next: O) => void; complete?: () => void }
  | { next?: (next: O) => void; complete: () => void }

type Subject<O extends Outcome = Outcome> = O & {
  /**
   * This would be a footgun, since Subjects could emit new values of their
   * previous type. It's still available on the `inner` property, though.
   */
  isa: never

  inner: O

  is_completed: boolean
  complete(): void

  subscribers: Array<Subscriber<O>>
  subscribe: (subscriber: Subscriber<O>) => void

  next<Self extends Subject<Nothing>>(this: Self, next?: Nothing): void
  next<U extends O>(next: InnermostWrappedTypeOf<U> extends never ? O : U): void

  filter<U extends O>(predicate: (element: O) => element is U): Subject<U>
  filter(predicate: (value: O) => boolean): Subject<O>

  merge<U extends Outcome>(other: Subject<U>): Subject<Consolidate<O | U>>
  merge<U1 extends Outcome, U2 extends Outcome>(other1: Subject<U1>, other2: Subject<U2>): Subject<Consolidate<O | U1 | U2>>
  merge<U1 extends Outcome, U2 extends Outcome, U3 extends Outcome>(other1: Subject<U1>, other2: Subject<U2>, other3: Subject<U3>): Subject<Consolidate<O | U1 | U2 | U3>>

  derive<U extends Outcome>(fn: (next: O) => U): Subject<U>
}

type Pipe = {
  <A, B>(ab: (a: A) => B): (a: A) => B
  <A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C
  <A, B, C, D>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): (a: A) => D
  <A, B, C, D, E>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E): (a: A) => E
  <A, B, C, D, E, F>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F): (a: A) => F
  <A, B, C, D, E, F, G>(ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D, de: (d: D) => E, ef: (e: E) => F, fg: (f: F) => G): (a: A) => G
}

type Curry<A = any, B = any, C = any, D = any, E = any, F = any, G = any> = {
  <A, B>(ab: (a: A) => B): ((a: A) => B) & (() => (a: A) => B)
  <A, B, C>(abc: (a: A, b: B) => C): ((a: A, b: B) => C) & ((a: A) => (b: B) => C)
  <A, B, C, D>(abcd: (a: A, b: B, c: C) => D): ((a: A, b: B, c: C) => D) & ((a: A) => Curry<B, C, D>)
  <A, B, C, D, E>(abcde: (a: A, b: B, c: C, d: D) => E): ((a: A, b: B, c: C, d: D) => E) & ((a: A) => Curry<B, C, D, E>)
  <A, B, C, D, E, F>(abcdef: (a: A, b: B, c: C, d: D, e: E) => F): ((a: A, b: B, c: C, d: D, e: E) => F) & ((a: A) => Curry<B, C, D, E, F>)
  <A, B, C, D, E, F, G>(abcdefg: (a: A, b: B, c: C, d: D, e: E, f: F) => G): ((a: A, b: B, c: C, d: D, e: E, f: F) => G) & ((a: A) => Curry<B, C, D, E, F, G>)
}
