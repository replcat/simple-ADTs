type Innermost<T> = T extends Base<infer U> ? Innermost<U> : T

type Constructors = {
  Base: <T>(value: T) => Base<NonNullable<T>>

  Maybe:
    & (<T>(value?: T) => Maybe<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Maybe<(value: T) => U>) => (maybe: Maybe<T>) => Maybe<U>
      chain: <T, F extends Maybe<any>>(fn: (value: Innermost<T>) => F) => (maybe: Maybe<T>) => F
      flatten: () => <T>(maybe: Maybe<T>) => Maybe<Innermost<T>>
      join: () => <T>(maybe: Maybe<Maybe<T>>) => Maybe<T>
      map: <T, U>(fn: (value: T) => U) => (maybe: Maybe<T>) => Maybe<U>
      traverse: <T, F extends Maybe<any>>(fn: (value: T) => F) => (maybe: Maybe<T>) => Maybe<F>
      fold: <T, U, E>(on_value: (value?: T) => U, on_none?: () => E) => (maybe: Maybe<T>) => U | E
      match: <T, N>(matcher: {
        Some: (value: T) => N
        None: () => N
      }) => (maybe: Maybe<T>) => N
    }

  Result:
    & (<T>(value?: T, on_null?: string | Error) => Result<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Result<(value: T) => U>) => (result: Result<T>) => Result<U>
      chain: <T, F extends Result<any>>(fn: (value: Innermost<T>) => F) => (result: Result<T>) => F
      flatten: () => <T>(result: Result<T>) => Result<Innermost<T>>
      join: () => <T>(result: Result<Result<T>>) => Result<T>
      map: <T, U>(fn: (value: T) => U) => (result: Result<T>) => Result<U>
      traverse: <T, F extends Result<any>>(fn: (value: T) => F) => (result: Result<T>) => Result<F>
      fold: <T, U, E>(on_value: (value: T) => U, on_error?: (error: Error) => E) => (result: Result<T>) => U | E
      match: <T, F>(matcher: {
        Some: (value: T) => F
        Fail: (error: Error) => F
      }) => (result: Result<T>) => F
    }

  Some:
    & (<T>(value: NonNullable<T>) => Some<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Some<(value: T) => U>) => (Some: Some<T>) => Some<U>
      chain: <T, F extends Some<any>>(fn: (value: Innermost<T>) => F) => (Some: Some<T>) => F
      flatten: () => <T>(Some: Some<T>) => Some<Innermost<T>>
      join: () => <T>(Some: Some<Some<T>>) => Some<T>
      map: <T, U>(fn: (value: T) => U) => (Some: Some<T>) => Some<U>
      traverse: <T, F extends Some<any>>(fn: (value: T) => F) => (Some: Some<T>) => Some<F>
      fold: <T, U>(fn: (value: T) => U) => (Some: Some<T>) => U
    }

  None: () => None

  Fail: (error?: string | Error, cause?: unknown) => Fail

  Subject: <T>(value?: T) => Subject<T>
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Base<T> {
  name: "Some" | "None" | "Fail"
  isa<U>(constructor: (arg?: any) => U): this is U extends Some ? Some<T>
    : U extends None ? None
    : U extends Fail ? Fail
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Base<T> // :3
  unwrap(): T
  unwrap_or<U>(value: U): T | U
  unwrap_or_else<U>(fn: () => U): T | U
  join<U>(this: U): U extends Some<Some<infer V>> ? Some<V> : U
  flatten<U>(this: U): U extends Some<infer V> ? Some<Innermost<V>> : U
  chain<U, F extends Base<NonNullable<U>>>(fn: (value: Innermost<T>) => F): F
  fold<U, E>(on_value: (value?: T) => U, otherwise?: (error: Error) => E): U | E

  map<U>(fn: (value: T) => NonNullable<U>): this extends Some<T> ? Some<NonNullable<U>>
    : this extends None ? None
    : this extends Fail ? Fail
    : this extends Maybe<T> ? Maybe<NonNullable<U>>
    : this extends Result<T> ? Result<NonNullable<U>>
    : Base<NonNullable<U>>

  ap<V extends Base<(value: T) => any>>(this: Base<T>, fn: V): V extends Maybe<(value: T) => any> ? Maybe<WrappedReturn<V>>
    : V extends Result<(value: T) => any> ? Result<WrappedReturn<V>>
    : V extends Some<(value: T) => any> ? Some<WrappedReturn<V>>
    : V extends None ? None
    : V extends Fail ? Fail
    : Base<WrappedReturn<V>>

  traverse<U, F extends Base<NonNullable<U>>>(fn: (value: Innermost<T>) => F): this extends Some<T> ? Some<F>
    : this extends None ? None
    : this extends Fail ? Fail
    : this extends Maybe<T> ? Maybe<F>
    : this extends Result<T> ? Result<F>
    : Base<F>

  match<Sout = never, NOut = never, FOut = never>(matcher: Matcher<this, T, Sout, NOut, FOut>): Consolidate<
    this extends Maybe<T> ? Sout | NOut
      : this extends Result<T> ? Sout | FOut
      : this extends Some<T> ? Sout
      : this extends None ? NOut
      : this extends Fail ? FOut
      : Sout | NOut | FOut
  >
}

type WrappedReturn<T> = T extends Base<(arg: any) => infer U> ? U : never

// require keys for each member of the union on which we're matching
type Matcher<Self extends Base<T>, T, Sout, NOut, FOut> = {
  [K in Self["name"]]: K extends "Some" ? (value: T) => Sout
    : K extends "None" ? () => NOut
    : K extends "Fail" ? (error: Error) => FOut
    : never
}

// hacks! using the tuple to create a fake type for typescript to reason about,
// so that the conditional doesn't get distributed over the union, which would
// result in e.g. `Maybe<number> | Maybe<none>` instead of `Maybe<number>`
type Consolidate<Union> = [Union] extends [Some<infer T>] ? Some<T>
  : [Union] extends [None] ? None
  : [Union] extends [Fail] ? Fail
  : [Union] extends [Some<infer T> | None] ? Maybe<T>
  : [Union] extends [Some<infer T> | Fail] ? Result<T>
  : [Union] extends [Some<infer T> | None | Fail] ? Base<T>
  : Union // not never, to allow other types through

/**
 * Union of Some and None.
 * No runtime representation.
 */
type Maybe<T = unknown> = Some<T> | None<T>

/**
 * Union of Some and Fail.
 * No runtime representation.
 */
type Result<T = unknown> = Some<T> | Fail<T>

/**
 * A value that isn't merely hypothetical — it's right there, look.
 * Corresponds to the `Some` type at runtime.
 */
interface Some<T = unknown> extends Base<T> {
  name: "Some"
  value: NonNullable<T>
  fold<U>(fn: (value: T) => U): U
}

/**
 * An absent value that was optional anyway, so no big deal.
 * Corresponds to the `None` type at runtime.
 */
interface None<T = never> extends Base<T> {
  name: "None"
  fold<E>(_: any, on_none: () => E): E
}

/**
 * An absent value that *possibly* should have existed (but it depends).
 * Corresponds to the `Fail` type at runtime.
 */
interface Fail<T = never> extends Base<T> {
  name: "Fail"
  error: Error
  get message(): string
  fold<E>(_: any, on_fail: (error: Error) => E): E
}

interface Subscriber<T> {
  next: (value: T) => void
  complete: () => void
}

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
