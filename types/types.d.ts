type Innermost<T> = T extends Base<infer U> ? Innermost<U> : T

type Constructors = {
  Base: <T>(value: T) => Base<NonNullable<T>>
  Maybe: <T>(value?: T) => Maybe<NonNullable<T>>
  Result: <T>(value?: T, on_null?: string | Error) => Result<NonNullable<T>>
  Some: <T>(value: NonNullable<T>) => Some<NonNullable<T>>
  None: () => None
  Fail: (error?: string | Error, cause?: unknown) => Fail
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Base<T = unknown> {
  name: "Some" | "None" | "Fail"
  isa<U>(constructor: (arg?: any) => U): this is U extends Some ? Some<T>
    : U extends None ? None
    : U extends Fail ? Fail
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Base<T> // :3
  unwrap(): T
  join<U>(this: U): U extends Some<Some<infer V>> ? Some<V> : U
  flatten<U>(this: U): U extends Some<infer V> ? Some<Innermost<V>> : U
  map<U>(fn: (value: T) => NonNullable<U>): Base<NonNullable<U>>
  chain<U, F extends Base<NonNullable<U>>>(fn: (value: Innermost<T>) => F): F
  match<JOut, NOut, FOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | NOut | FOut>
}

/**
 * Union of Some and None.
 * No runtime representation.
 */
interface Maybe<T = unknown> extends Base<T> {
  name: "Some" | "None"
  map<U>(fn: (value: T) => NonNullable<U>): Maybe<NonNullable<U>>
  ap<U>(fn: Maybe<(value: T) => U>): Maybe<U>
  traverse<U, F extends Maybe<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Maybe<F>
  match<JOut, NOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
  }): Consolidate<JOut | NOut>
}

/**
 * Union of Some and Fail.
 * No runtime representation.
 */
interface Result<T = unknown> extends Base<T> {
  name: "Some" | "Fail"
  map<U>(fn: (value: T) => NonNullable<U>): Result<NonNullable<U>>
  ap<U>(fn: Result<(value: T) => U>): Result<U>
  traverse<U, F extends Result<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Result<F>
  match<JOut, FOut>(matcher: {
    Some: (value: T) => JOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | FOut>
}

/**
 * A value that isn't merely hypothetical — it's right there, look.
 * Corresponds to the `Some` type at runtime.
 */
interface Some<T = unknown> extends Base<T> {
  name: "Some"
  value: NonNullable<T>
  map<U>(fn: (value: T) => NonNullable<U>): Some<NonNullable<U>>
  ap<U>(fn: Some<(value: T) => U>): Some<U>
  traverse<U, F extends Some<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Some<F>
  match<JOut>(matcher: {
    Some: (value: T) => JOut
  }): Consolidate<JOut>
}

/**
 * An absent value that was optional anyway, so no big deal.
 * Corresponds to the `None` type at runtime.
 */
interface None extends Base<never> {
  name: "None"
  map<U>(fn: (value: never) => U): this
  match<NOut>(matcher: {
    None: () => NOut
  }): Consolidate<NOut>
}

/**
 * An absent value that *possibly* should have existed (but it depends).
 * Corresponds to the `Fail` type at runtime.
 */
interface Fail extends Base<never>, Error {
  name: "Fail"
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
  match<FOut>(matcher: {
    Fail: (error: Error) => FOut
  }): Consolidate<FOut>
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
