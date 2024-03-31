import { assert, describe, expect, expectTypeOf, it, test } from "vitest"

import { constructors } from "../lib.js"
const { Subject, Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("the type constructor", () => {
  describe("constructing a Subject with no initial value", () => {
    it("initialises with a Nothing", () => {
      const subject = Subject() as Subject
      expect(subject.inner).toBeInstanceOf(Nothing)
    })

    it("defaults to an Outcome (of unknown)", () => {
      const subject = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<unknown>>>()
    })

    it("can be annotated to an Outcome of an explicit inner type", () => {
      const subject: Subject<Outcome<string>> = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
    })

    it("can be annotated to a Maybe", () => {
      const subject: Subject<Maybe<string>> = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<string>>>()
    })

    it("can be annotated to a Nothing", () => {
      const subject: Subject<Nothing> = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Nothing>>()
    })

    it("cannot be annotated to form incompatible types", () => {
      // @ts-expect-error
      const of_result: Subject<Result<string>> = Subject()
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject()
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject()
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject()
    })
  })

  describe("constructing a Subject from an initial Nothing", () => {
    it("creates a Subject of Nothing", () => {
      const subject = Subject(Nothing())
      expectTypeOf(subject).toEqualTypeOf<Subject<Nothing>>()
      expect(subject.inner).toBeInstanceOf(Nothing)
    })
  })

  describe("constructing a Subject from an Error or Failure", () => {
    it("creates a Subject of Failure", () => {
      const from_error = Subject(new Error("blep"))
      expectTypeOf(from_error).toEqualTypeOf<Subject<Failure>>()
      expect(from_error.inner).toBeInstanceOf(Failure)

      const from_failure = Subject(Failure("blep"))
      expectTypeOf(from_failure).toEqualTypeOf<Subject<Failure>>()
      expect(from_failure.inner).toBeInstanceOf(Failure)
    })
  })

  describe("constructing a Subject from an initial Maybe", () => {
    it("creates a Subject of Maybe", () => {
      const subject = Subject(Maybe("boop"))
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<string>>>()
    })

    it("initialises with an apppropriate Maybe variant", () => {
      const of_just = Subject(Maybe("boop"))
      expectTypeOf(of_just).toEqualTypeOf<Subject<Maybe<string>>>()
      expect(of_just.inner).toBeInstanceOf(Just)

      const of_nothing = Subject(Maybe())
      expectTypeOf(of_nothing).toEqualTypeOf<Subject<Maybe<unknown>>>()
      expect(of_nothing.inner).toBeInstanceOf(Nothing)
    })
  })

  describe("constructing a Subject from an initial Result", () => {
    it("initialises with an apppropriate Result variant", () => {
      const of_just = Subject(Result("boop"))
      expectTypeOf(of_just).toEqualTypeOf<Subject<Result<string>>>()
      expect(of_just.inner).toBeInstanceOf(Just)

      const of_failure = Subject(Result(new Error()))
      expectTypeOf(of_failure).toEqualTypeOf<Subject<Result<unknown>>>()
      expect(of_failure.inner).toBeInstanceOf(Failure)

      const of_default = Subject(Result())
      expectTypeOf(of_default).toEqualTypeOf<Subject<Result<unknown>>>()
      expect(of_default.inner).toBeInstanceOf(Failure)
    })

    it("defaults to a Result of the same type", () => {
      const subject = Subject(Result("boop"))
      expectTypeOf(subject).toEqualTypeOf<Subject<Result<string>>>()
    })
  })

  describe("constructing a Subject from an initial Just", () => {
    it("initialises with a Just", () => {
      const subject = Subject(Just("boop"))
      expect(subject.inner).toBeInstanceOf(Just)
    })

    it("defaults to a Just of the same type", () => {
      const subject = Subject(Just("boop") as Just<string>)
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<string>>>()
      expectTypeOf(subject.unwrap()).toEqualTypeOf<string>()
    })
  })

  describe("constructing a Subject from any other value type", () => {
    it("creates a Subject of Just that type", () => {
      const subject = Subject("boop")
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<string>>>()
      expectTypeOf(subject.unwrap()).toEqualTypeOf<string>()
    })
  })

  describe("constructing a Subject from an initial Outcome", () => {
    it("initialises with an apppropriate Outcome variant", () => {
      const of_just = Subject(Outcome("boop"))
      expect(of_just.inner).toBeInstanceOf(Just)

      const of_nothing = Subject(Outcome())
      expect(of_nothing.inner).toBeInstanceOf(Nothing)

      const of_failure = Subject(Outcome(new Error()))
      expect(of_failure.inner).toBeInstanceOf(Failure)
    })

    it("defaults to an Outcome of the same type", () => {
      const subject = Subject(Outcome("boop"))
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
      expect(subject.inner).toBeInstanceOf(Just)
      expect(subject.unwrap()).not.toHaveProperty("value")
    })
  })

  describe("the conditional type of the next function", () => {
    it("requires an argument for a Subject of Maybe (etc.)", () => {
      const subject: Subject<Maybe<string>> = Subject()

      subject.next(Maybe("boop"))
      subject.next(Just("boop"))
      subject.next(Nothing())

      // @ts-expect-error
      subject.next()
    })

    it("requires no argument for a Subject of Nothing", () => {
      const subject: Subject<Nothing> = Subject()

      // @ts-expect-error
      subject.next(Maybe("boop"))
      // @ts-expect-error
      subject.next(Just("boop"))

      subject.next(Nothing())
      subject.next()
    })
  })
})

describe("basic usage", () => {
  it("exposes and updates wrapped values", () => {
    const subject = Subject(1)
    expect(subject.inner.value).toBe(1)

    subject.next(2)
    expect(subject.inner.value).toBe(2)
  })

  describe("variants which include errors", () => {
    it("exposes and updates wrapped errors (directly)", () => {
      const subject = Subject(new Error("one"))
      expect(subject.inner.error).toBeInstanceOf(Error)
      expect(subject.inner.error.message).toBe("one")

      subject.next(new Error("two"))
      expect(subject.inner.error).toBeInstanceOf(Error)
      expect(subject.inner.error.message).toBe("two")
    })

    it("exposes and updates wrapped errors (via Failure types)", () => {
      const subject = Subject(Failure("one")) as Subject<Failure>
      expect(subject.unwrap_error()).toBeInstanceOf(Error)
      expect(subject.unwrap_error().message).toBe("one")

      subject.next(Failure("two"))
      expect(subject.unwrap_error()).toBeInstanceOf(Error)
      expect(subject.unwrap_error().message).toBe("two")
    })

    it("can update with values and Failure types", () => {
      const subject = Subject(Result(1))
      expect(subject.unwrap()).toBe(1)

      subject.next

      subject.next(Failure("boop"))

      const error = subject.unwrap_error()
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe("boop")

      subject.next(Result(2))
      expect(subject.unwrap()).toBe(2)
    })
  })

  describe("variants which include Nothing", () => {
    it("exposes a wrapped Nothing type", () => {
      const subject = Subject(Nothing()) as Subject<Nothing>
      expect(subject.inner.isa(Nothing)).toBe(true)
    })

    it("can update with values and Nothing types", () => {
      const subject = Subject(Maybe(1))
      expect(subject.unwrap()).toBe(1)

      subject.next(Nothing())
      expect(subject.inner.isa(Nothing)).toBe(true)

      subject.next(Just(2))
      expect(subject.unwrap()).toBe(2)
    })
  })
})

describe("Subject.derive", () => {
  it("returns a new computed Subject", () => {
    const subject = Subject(Maybe(1))

    const derived = subject.derive(Maybe.match({
      Just: value => Just(value * 2),
      Nothing: () => Just(0),
    }))

    expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<number>>>()
    expect(subject.unwrap()).toBe(1)

    expectTypeOf(derived).toEqualTypeOf<Subject<Just<number>>>()
    expect(derived.unwrap()).toBe(2)

    subject.next(2)

    expect(subject.unwrap()).toBe(2)
    expect(derived.unwrap()).toBe(4)

    subject.next(Nothing())

    expect(subject.inner).toBeInstanceOf(Nothing)
    expect(derived.inner).toBeInstanceOf(Just)
    expect(derived.unwrap()).toBe(0)
  })
})

describe("Subject.merge", () => {
  it("merges multiple Subjects", () => {
    const one = Subject(1)
    const two = Subject(2)
    const merge_two = one.merge(two)
    expectTypeOf(merge_two).toEqualTypeOf<Subject<Just<number>>>()

    const three = Subject("three")
    const merge_three = one.merge(two, three)
    expectTypeOf(merge_three).toEqualTypeOf<Subject<Just<number | string>>>()

    const four = Subject(Nothing())
    const merge_four = one.merge(two, three, four)
    expectTypeOf(merge_four).toEqualTypeOf<Subject<Maybe<number | string>>>()

    one.next(999)
    expect(merge_two.unwrap()).toBe(999)
    expect(merge_three.unwrap()).toBe(999)
    expect(merge_four.unwrap()).toBe(999)

    three.next("blep")
    expect(merge_three.unwrap()).toBe("blep")
    expect(merge_four.unwrap()).toBe("blep")

    four.next(Nothing())
    expect(merge_four.inner).toBeInstanceOf(Nothing)

    expect(merge_two.unwrap()).toBe(999) // (unchanged)
  })
})
