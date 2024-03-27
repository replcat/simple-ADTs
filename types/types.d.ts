type Innermost<T> = T extends Outcome<infer U> ? Innermost<U> : T

type Constructors = {
  Outcome:
    & (<T>(value?: T | Error) => Outcome<T extends Error ? never : NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Outcome<T>
      ap: <T, U>(fn: Outcome<(value: T) => U>) => (outcome: Outcome<T>) => Outcome<U>
      chain: <T, F extends Outcome<any>>(fn: (value: Innermost<T>) => F) => (outcome: Outcome<T>) => F
      flatten: () => <T>(outcome: Outcome<T>) => Outcome<Innermost<T>>
      join: () => <T>(outcome: Outcome<Outcome<T>>) => Outcome<T>
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
    & (<T>(value?: T) => Maybe<NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Maybe<T>
      ap: <T, U>(fn: Maybe<(value: T) => U>) => (maybe: Maybe<T>) => Maybe<U>
      chain: <T, F extends Maybe<any>>(fn: (value: Innermost<T>) => F) => (maybe: Maybe<T>) => F
      flatten: () => <T>(maybe: Maybe<T>) => Maybe<Innermost<T>>
      join: () => <T>(maybe: Maybe<Maybe<T>>) => Maybe<T>
      map: <T, U>(fn: (value: T) => U) => (maybe: Maybe<T>) => Maybe<U>
      traverse: <T, F extends Maybe<any>>(fn: (value: T) => F) => (maybe: Maybe<T>) => Maybe<F>
      fold: <T, U, E>(on_value: (value?: T) => U, on_nothing?: () => E) => (maybe: Maybe<T>) => U | E
      match: <T, J, N>(matcher: {
        Just: (value: T) => J
        Nothing: () => N
      }) => (maybe: Maybe<T>) => Consolidate<J | N>
    }

  Result:
    & (<T>(value?: T | Error) => Result<T extends Error ? never : NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Result<T>
      ap: <T, U>(fn: Result<(value: T) => U>) => (result: Result<T>) => Result<U>
      chain: <T, F extends Result<any>>(fn: (value: Innermost<T>) => F) => (result: Result<T>) => F
      flatten: () => <T>(result: Result<T>) => Result<Innermost<T>>
      join: () => <T>(result: Result<Result<T>>) => Result<T>
      map: <T, U>(fn: (value: T) => U) => (result: Result<T>) => Result<U>
      traverse: <T, F extends Result<any>>(fn: (value: T) => F) => (result: Result<T>) => Result<F>
      fold: <T, U, E>(on_value: (value: T) => U, on_error?: (error: Error) => E) => (result: Result<T>) => U | E
      match: <T, J, F>(matcher: {
        Just: (value: T) => J
        Failure: (error: Error) => F
      }) => (result: Result<T>) => Consolidate<J | F>
    }

  Just:
    & (<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
    & {
      isa: () => <T>(instance: Outcome<T>) => instance is Just<T>
      ap: <T, U>(fn: Just<(value: T) => U>) => (Just: Just<T>) => Just<U>
      chain: <T, F extends Just<any>>(fn: (value: Innermost<T>) => F) => (Just: Just<T>) => F
      flatten: () => <T>(Just: Just<T>) => Just<Innermost<T>>
      join: () => <T>(Just: Just<Just<T>>) => Just<T>
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

  Subject: <T>(value?: T) => Subject<T>
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Outcome<T> {
  name: "Just" | "Nothing" | "Failure"
  isa<U>(constructor: (arg?: any) => U): this is U extends Just ? Just<T>
    : U extends Nothing ? Nothing
    : U extends Failure ? Failure
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Outcome<T>
  unwrap(): T
  unwrap_or<U>(value: U): T | U
  unwrap_or_else<U>(fn: () => U): T | U
  join<U>(this: U): U extends Just<Just<infer V>> ? Just<V> : U
  flatten<U>(this: U): U extends Just<infer V> ? Just<Innermost<V>> : U
  chain<U, F extends Outcome<NonNullable<U>>>(fn: (value: Innermost<T>) => F): F
  fold<U, E>(on_value: (value?: T) => U, otherwise?: (error: Error) => E): U | E

  map<U>(fn: (value: T) => NonNullable<U>): this extends Just<T> ? Just<NonNullable<U>>
    : this extends Nothing ? Nothing
    : this extends Failure ? Failure
    : this extends Maybe<T> ? Maybe<NonNullable<U>>
    : this extends Result<T> ? Result<NonNullable<U>>
    : Outcome<NonNullable<U>>

  ap<V extends Outcome<(value: T) => any>>(this: Outcome<T>, fn: V): V extends Just<(value: T) => any> ? Just<WrappedReturn<V>>
    : V extends Nothing ? Nothing
    : V extends Failure ? Failure
    : V extends Maybe<(value: T) => any> ? Maybe<WrappedReturn<V>>
    : V extends Result<(value: T) => any> ? Result<WrappedReturn<V>>
    : Outcome<WrappedReturn<V>>

  traverse<U, F extends Outcome<NonNullable<U>>>(fn: (value: Innermost<T>) => F): this extends Just<T> ? Just<F>
    : this extends Nothing ? Nothing
    : this extends Failure ? Failure
    : this extends Maybe<T> ? Maybe<F>
    : this extends Result<T> ? Result<F>
    : Outcome<F>

  match<Sout = never, NOut = never, FOut = never>(matcher: Matcher<this, T, Sout, NOut, FOut>): Consolidate<
    this extends Maybe<T> ? Sout | NOut
      : this extends Result<T> ? Sout | FOut
      : this extends Just<T> ? Sout
      : this extends Nothing ? NOut
      : this extends Failure ? FOut
      : Sout | NOut | FOut
  >
}

type WrappedReturn<T> = T extends Outcome<(arg: any) => infer U> ? U : never

// require keys for each member of the union on which we're matching
type Matcher<Self extends Outcome<T>, T, Sout, NOut, FOut> = {
  [K in Self["name"]]: K extends "Just" ? (value: T) => Sout
    : K extends "Nothing" ? () => NOut
    : K extends "Failure" ? (error: Error) => FOut
    : never
}

// hacks! using the tuple to create a fake type for typescript to reason about,
// so that the conditional doesn't get distributed over the union, which would
// result in e.g. `Maybe<number> | Maybe<nothing>` instead of `Maybe<number>`
type Consolidate<Union> = [Union] extends [Just<infer T>] ? Just<T>
  : [Union] extends [Nothing] ? Nothing
  : [Union] extends [Failure] ? Failure
  : [Union] extends [Just<infer T> | Nothing] ? Maybe<T>
  : [Union] extends [Just<infer T> | Failure] ? Result<T>
  : [Union] extends [Just<infer T> | Nothing | Failure] ? Outcome<T>
  : Union // not never, to allow other types through

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
  value: NonNullable<T>
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

type Subscriber<T> =
  | { next: (value: T) => void; complete?: () => void }
  | { next?: (value: T) => void; complete: () => void }

interface Subject<T = unknown> {
  name: "Subject"
  subscribers: Subscriber<T>[]
  value?: T
  is_completed: boolean

  subscribe: (subscriber: Subscriber<T>) => void
  next: (value: T) => void
  complete: () => void

  // overload to support narrowing if the predicate is a type guard
  filter<U extends T>(predicate: (value: T) => value is U): Subject<U>
  filter(predicate: (value: T) => boolean): Subject<T>

  map: <U>(fn: (value: T) => U) => Subject<U>
  merge: <U>(other: Subject<U>) => Subject<T | U>
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
