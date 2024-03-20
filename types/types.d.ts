type Constructors = {
  Atom:
    & (<T>(value_or_error?: T) => Atom<T extends Error ? never : T>)
    & (new<T>(value_or_error?: T) => Atom<T extends Error ? never : T>)
  Maybe:
    & (<T>(value?: T) => Maybe<T>)
    & (new<T>(value?: T) => Maybe<T>)
  Result:
    & (<T>(value_or_error?: T) => Result<T extends Error ? never : T>)
    & (new<T>(value_or_error?: T) => Result<T extends Error ? never : T>)
  Just:
    & (<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
    & (new<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
  Nothing:
    & (() => Nothing)
    & (new() => Nothing)
  Failure:
    & ((message_or_error?: string | Error, cause?: unknown) => Failure)
    & (new(message_or_error?: string | Error, cause?: unknown) => Failure)
}

interface Atom<T = unknown> {
  name: "Just" | "Nothing" | "Failure"
  isa<U>(constructor: (value?: any) => U): this is U
  unwrap(): T
  map<U>(fn: (value: T) => U): Atom<U>
  match<JOut, NOut, FOut>(matcher: {
    Just: (value: T) => JOut
    Nothing: () => NOut
    Failure: (error: Error) => FOut
  }): CastReturn<JOut | NOut | FOut>
}

interface Maybe<T = unknown> extends Atom<T> {
  name: "Just" | "Nothing"
  map<U>(fn: (value: T) => U): Maybe<U>
  match<JOut, NOut>(matcher: {
    Just: (value: T) => JOut
    Nothing: () => NOut
  }): CastReturn<JOut | NOut>
}

interface Result<T = unknown> extends Atom<T> {
  name: "Just" | "Failure"
  map<U>(fn: (value: T) => U): Result<U>
  match<JOut, FOut>(matcher: {
    Just: (value: T) => JOut
    Failure: (error: Error) => FOut
  }): CastReturn<JOut | FOut>
}

interface Just<T = unknown> extends Atom<T> {
  name: "Just"
  isJust: true
  value: NonNullable<T>
  map<U>(fn: (value: T) => U): Just<U>
  match<JOut>(matcher: {
    Just: (value: T) => JOut
  }): CastReturn<JOut>
}

interface Nothing extends Atom<never> {
  name: "Nothing"
  isNothing: true
  map<U>(fn: (value: never) => U): this
  match<NOut>(matcher: {
    Nothing: () => NOut
  }): CastReturn<NOut>
}

interface Failure extends Atom<never>, Error {
  name: "Failure"
  isFailure: true
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
  match<FOut>(matcher: {
    Failure: (error: Error) => FOut
  }): CastReturn<FOut>
}

type CastReturn<Type> = Type extends Just<infer T> ? Just<T>
  : Type extends Nothing ? Nothing
  : Type extends Failure ? Failure
  : Type extends Just<infer T> | Nothing ? Maybe<T>
  : Type extends Just<infer T> | Failure ? Result<T>
  : Type extends Just<infer T> | Nothing | Failure ? Atom<T>
  : never
