type Constructors = {
  Just: <T>(value: NonNullable<T>) => Just<NonNullable<T>>
  Nothing: () => Nothing
  Failure: (message_or_error?: string | Error, cause?: unknown) => Failure
}

type AtomName = "Just" | "Nothing" | "Failure"

type Maybe<T> = (Just<T> | Nothing) & {
  match: <JOut, NOut>(matcher: Matcher<T, JOut, NOut, never, "Just" | "Nothing">) => JOut | NOut
  map: <U>(fn: (value: T) => U) => Maybe<U>
}

type Result<T> = (Just<T> | Failure) & {
  match: <JOut, FOut>(matcher: Matcher<T, JOut, never, FOut, "Just" | "Failure">) => JOut | FOut
  map: <U>(fn: (value: T) => U) => Result<U>
}

type Matcher<T, JOut, NOut, FOut, IncludeKeys extends AtomName = AtomName> =
  & { [key in Exclude<AtomName, IncludeKeys>]?: never } // prevent unexpected keys
  & {
    Just?: (value: T) => JOut
    Nothing?: () => NOut
    Failure?: (error: Error) => FOut
  }

interface Atom<T> {
  name: AtomName
  isa<U>(constructor: (value?: any) => U): this is U
  match<JOut, NOut, FOut>(matcher: Matcher<T, JOut, NOut, FOut>): JOut | NOut | FOut
  map<U>(fn: (value: T) => U): Atom<U>
}

interface Just<T = unknown> extends Atom<T> {
  name: "Just"
  value: NonNullable<T>
  map<U>(fn: (value: T) => U): Just<U>
}

interface Nothing extends Atom<never> {
  name: "Nothing"
  map<U>(fn: (value: never) => U): this
}

interface Failure extends Atom<never> {
  name: "Failure"
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
}
