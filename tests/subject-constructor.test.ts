import { describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Subject, Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("calling the constructor with no argument (exceptional case)", () => {
  it("creates a Subject of Nothing", () => {
    const of_no_args = Subject()
    expectTypeOf(of_no_args).toEqualTypeOf<Subject<Nothing>>()

    const of_nothing = Subject(Nothing())
    expectTypeOf(of_nothing).toEqualTypeOf<Subject<Nothing>>()
  })

  it("initialises to an inner type of Nothing", () => {
    const of_no_args = Subject()
    expect(of_no_args.inner).toBeInstanceOf(Nothing)

    const of_nothing = Subject(Nothing())
    expect(of_nothing.inner).toBeInstanceOf(Nothing)
  })

  it("can be coerced to a Maybe or Outcome", () => {
    Subject() as Subject<Maybe>
    Subject() as Subject<Outcome>
  })

  it("cannot be coerced to an incompatible type", () => {
    // @ts-expect-error
    Subject() as Subject<Failure>
    // @ts-expect-error
    Subject() as Subject<Just>
    // @ts-expect-error
    Subject() as Subject<Result>
    // @ts-expect-error
    Subject() as Subject<unknown>
  })

  it("accepts Nothing or no arguments to its next function", () => {
    const subject = Subject(Nothing())

    subject.next(Nothing())
    subject.next()

    // @ts-expect-error
    subject.next(Maybe())
    // @ts-expect-error
    subject.next(Outcome())
  })
})

describe("calling the constructor with a Failure", () => {
  it("creates a Subject of Failure", () => {
    const subject = Subject(Failure())
    expectTypeOf(subject).toEqualTypeOf<Subject<Failure>>()
  })

  it("initialises with an inner type of Failure", () => {
    const subject = Subject(Failure("test"))
    expect(subject.inner).toBeInstanceOf(Failure)
    expect(subject.unwrap_error().message).toBe("test")
  })

  it("can be coerced to a Result or Outcome", () => {
    Subject(Failure()) as Subject<Result>
    Subject(Failure()) as Subject<Outcome>
  })

  it("cannot be coerced to an incompatible type", () => {
    // @ts-expect-error
    Subject(Failure()) as Subject<Nothing>
    // @ts-expect-error
    Subject(Failure()) as Subject<Just<string>>
    // @ts-expect-error
    Subject(Failure()) as Subject<Maybe<string>>
    // @ts-expect-error
    Subject(Failure()) as Subject<unknown>
  })

  it("accepts Failure arguments to its next function", () => {
    const subject = Subject(Failure())

    subject.next(Failure())

    // @ts-expect-error
    subject.next()
    // @ts-expect-error
    subject.next(Maybe())
    // @ts-expect-error
    subject.next(Outcome(new Error()))
  })
})

describe("calling the constructor a Just", () => {
  const init: Just<string> = Just("test")

  it("creates a Subject of Just", () => {
    const subject = Subject(init)
    expectTypeOf(subject).toEqualTypeOf<Subject<Just<string>>>()
  })

  it("initialises with an inner type of Just", () => {
    const subject = Subject(init)
    expect(subject.inner).toBeInstanceOf(Just)
    expect(subject.unwrap()).toBe(init.value)
  })

  it("can be coerced to a Maybe, Result or Outcome", () => {
    Subject(init) as Subject<Maybe>
    Subject(init) as Subject<Result>
    Subject(init) as Subject<Outcome>
  })

  it("cannot be coerced to an incompatible type", () => {
    // @ts-expect-error
    Subject(Just("test")) as Subject<Failure>
    // @ts-expect-error
    Subject(Just("test")) as Subject<Nothing>
    // @ts-expect-error
    Subject(Just("test")) as Subject<Just<number>>
    // @ts-expect-error
    Subject(Just("test")) as Subject<Maybe<number>>
    // @ts-expect-error
    Subject(Just("test")) as Subject<Result<number>>
    // @ts-expect-error
    Subject(Just("test")) as Subject<unknown>
  })

  it("accepts Just arguments to its next function", () => {
    const subject = Subject(init)
    expect(subject.unwrap()).toBe(init.value)

    subject.next(Just("again"))
    expect(subject.unwrap()).toBe("again")

    // @ts-expect-error
    subject.next()
    // @ts-expect-error
    subject.next(Nothing())
    // @ts-expect-error
    subject.next(Maybe("test"))
    // @ts-expect-error
    subject.next(Result("test"))
    // @ts-expect-error
    subject.next(Outcome("test"))
  })
})

describe("calling the constructor with a Maybe", () => {
  it("creates a Subject of Maybe", () => {
    const of_just = Subject(Maybe("test"))
    expectTypeOf(of_just).toEqualTypeOf<Subject<Maybe<string>>>()

    const of_nothing: Subject<Maybe<string>> = Subject(Maybe())
    expectTypeOf(of_nothing).toEqualTypeOf<Subject<Maybe<string>>>()
  })

  it("can be coerced to an Outcome", () => {
    Subject(Maybe("test")) as Subject<Outcome<string>>
  })

  it("accepts Maybe, Just and Nothing arguments to its next function", () => {
    const subject = Subject(Maybe(1))
    expect(subject.unwrap()).toBe(1)

    subject.next(Maybe(2))
    expect(subject.unwrap()).toBe(2)

    subject.next(Just(3))
    expect(subject.unwrap()).toBe(3)

    subject.next(Maybe())
    expect(subject.inner).toBeInstanceOf(Nothing)

    subject.next(Nothing())
    expect(subject.inner).toBeInstanceOf(Nothing)

    // @ts-expect-error
    subject.next()
    // @ts-expect-error
    subject.next(Result("test"))
    // @ts-expect-error
    subject.next(Outcome("test"))
    // @ts-expect-error
    subject.next(Outcome())
  })
})

describe("calling the constructor with a Result", () => {
  it("creates a Subject of Result", () => {
    const of_just = Subject(Result("test"))
    expectTypeOf(of_just).toEqualTypeOf<Subject<Result<string>>>()

    const of_failure: Subject<Result<string>> = Subject(Result())
    expectTypeOf(of_failure).toEqualTypeOf<Subject<Result<string>>>()
  })

  it("can be coerced to an Outcome", () => {
    Subject(Result("test")) as Subject<Outcome<string>>
  })

  it("accepts Result, Just and Failure arguments to its next function", () => {
    const subject = Subject(Result(1))
    expect(subject.unwrap()).toBe(1)

    subject.next(Result(2))
    expect(subject.unwrap()).toBe(2)

    subject.next(Just(3))
    expect(subject.unwrap()).toBe(3)

    subject.next(Failure())
    expect(subject.inner).toBeInstanceOf(Failure)

    // @ts-expect-error
    subject.next()
    // @ts-expect-error
    subject.next(Maybe("test"))
    // @ts-expect-error
    subject.next(Outcome("test"))
    // @ts-expect-error
    subject.next(Outcome())
  })
})

describe("calling the constructor with an Outcome", () => {
  it("creates a Subject of Outcome", () => {
    const subject = Subject(Outcome("test"))
    expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
  })

  it("accepts any wrapped arguments to its next function", () => {
    const subject = Subject(Outcome(1))
    expect(subject.unwrap()).toBe(1)

    subject.next(Outcome(2))
    expect(subject.unwrap()).toBe(2)

    subject.next(Just(3))
    expect(subject.unwrap()).toBe(3)

    subject.next(Nothing())
    expect(subject.inner).toBeInstanceOf(Nothing)

    subject.next(Failure(new Error()))
    expect(subject.inner).toBeInstanceOf(Failure)

    subject.next(Maybe(4))
    expect(subject.unwrap()).toBe(4)

    subject.next(Maybe())
    expect(subject.inner).toBeInstanceOf(Nothing)

    subject.next(Result(5))
    expect(subject.unwrap()).toBe(5)

    subject.next(Result())
    expect(subject.inner).toBeInstanceOf(Failure)
  })
})
