type Constructors = {
  Nebulous: <T>(value: T) => Nebulous<NonNullable<T>>
  Maybe: <T>(value?: T) => Maybe<NonNullable<T>>
  Result: <T>(value?: T, on_null?: string | Error) => Result<NonNullable<T>>
  Some: <T>(value: NonNullable<T>) => Some<NonNullable<T>>
  None: () => None
  Fail: (error?: string | Error, cause?: unknown) => Fail
}

interface Nebulous<T = unknown> {
  name: "Some" | "None" | "Fail"
  is<U>(constructor: (arg?: any) => U): this is U extends Some ? Some<T>
    : U extends None ? None
    : U extends Fail ? Fail
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Nebulous<T> // :3
  unwrap(): T
  map<U>(fn: (value: T) => NonNullable<U>): Nebulous<NonNullable<U>>
  match<JOut, NOut, FOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | NOut | FOut>
}

interface Maybe<T = unknown> extends Nebulous<T> {
  name: "Some" | "None"
  map<U>(fn: (value: T) => NonNullable<U>): Maybe<NonNullable<U>>
  match<JOut, NOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
  }): Consolidate<JOut | NOut>
}

interface Result<T = unknown> extends Nebulous<T> {
  name: "Some" | "Fail"
  map<U>(fn: (value: T) => NonNullable<U>): Result<NonNullable<U>>
  match<JOut, FOut>(matcher: {
    Some: (value: T) => JOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | FOut>
}

interface Some<T = unknown> extends Nebulous<T> {
  name: "Some"
  value: NonNullable<T>
  map<U>(fn: (value: T) => NonNullable<U>): Some<NonNullable<U>>
  match<JOut>(matcher: {
    Some: (value: T) => JOut
  }): Consolidate<JOut>
}

interface None extends Nebulous<never> {
  name: "None"
  map<U>(fn: (value: never) => U): this
  match<NOut>(matcher: {
    None: () => NOut
  }): Consolidate<NOut>
}

interface Fail extends Nebulous<never>, Error {
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
  : [Union] extends [Some<infer T> | None | Fail] ? Nebulous<T>
  : Union // not never, to allow other types through
