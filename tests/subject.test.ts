import { describe, expect, expectTypeOf, it, test } from "vitest"

import { constructors } from "../lib.js"
const { Subject, Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("the type constructor", () => {
  describe("constructing an initially valueless Subject", () => {
    it("initialises with a Nothing", () => {
      const subject = Subject() as Subject
      expect(subject.previous).toBeInstanceOf(Nothing)
    })

    it("defaults to an Outcome of unknown", () => {
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

    it("cannot be annotated to form other types", () => {
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
    it("initialises with a Nothing", () => {
      const subject = Subject() as Subject
      expect(subject.previous).toBeInstanceOf(Nothing)
    })

    it("defaults to an Outcome of unknown", () => {
      const subject = Subject(Nothing())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<unknown>>>()
    })

    it("can be annotated to an Outcome of an explicit inner type", () => {
      const subject: Subject<Outcome<string>> = Subject(Nothing())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
    })

    it("can be annotated to a Maybe", () => {
      const subject: Subject<Maybe<string>> = Subject(Nothing())
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<string>>>()
    })

    it("can be annotated to a Nothing", () => {
      const subject: Subject<Nothing> = Subject(Nothing())
      expectTypeOf(subject).toEqualTypeOf<Subject<Nothing>>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_result: Subject<Result<string>> = Subject(Nothing())
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject(Nothing())
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject(Nothing())
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(Nothing())
    })
  })

  describe("constructing a Subject from an initial Error", () => {
    it("initialises with a Failure", () => {
      const subject = Subject(new Error("blep")) as Subject
      expect(subject.previous).toBeInstanceOf(Failure)
    })

    it("defaults to an Outcome of unknown", () => {
      const subject = Subject(new Error())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<unknown>>>()
    })

    it("can be annotated to an Outcome of an explicit inner type", () => {
      const subject: Subject<Outcome<string>> = Subject(new Error())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
    })

    it("can be annotated to a Result", () => {
      const subject: Subject<Result<string>> = Subject(new Error())
      expectTypeOf(subject).toEqualTypeOf<Subject<Result<string>>>()
    })

    it("can be annotated to a Failure", () => {
      const subject: Subject<Failure> = Subject(new Error())
      expectTypeOf(subject).toEqualTypeOf<Subject<Failure>>()
      expectTypeOf(subject.error).toEqualTypeOf<Error>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_maybe: Subject<Maybe<string>> = Subject(new Error())
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject(new Error())
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject(new Error())
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(new Error())
    })
  })

  describe("constructing a Subject from an initial Failure", () => {
    it("initialises with a Failure", () => {
      const subject = Subject(new Error("blep")) as Subject
      expect(subject.previous).toBeInstanceOf(Failure)
    })

    it("defaults to an Outcome of unknown", () => {
      const subject = Subject(Failure())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<unknown>>>()
    })

    it("can be annotated to an Outcome of an explicit inner type", () => {
      const subject: Subject<Outcome<string>> = Subject(Failure())
      expectTypeOf(subject).toEqualTypeOf<Subject<Outcome<string>>>()
    })

    it("can be annotated to a Result", () => {
      const subject: Subject<Result<string>> = Subject(Failure())
      expectTypeOf(subject).toEqualTypeOf<Subject<Result<string>>>()
    })

    it("can be annotated to a Failure", () => {
      const subject: Subject<Failure> = Subject(Failure())
      expectTypeOf(subject).toEqualTypeOf<Subject<Failure>>()
      expectTypeOf(subject.error).toEqualTypeOf<Error>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_maybe: Subject<Maybe<string>> = Subject(Failure())
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject(Failure())
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject(Failure())
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(Failure())
    })
  })

  describe("constructing a Subject from an initial Maybe", () => {
    it("initialises with an apppropriate Maybe variant", () => {
      const of_just = Subject(Maybe("boop")) as Subject
      expect(of_just.previous).toBeInstanceOf(Just)

      const of_nothing = Subject(Maybe()) as Subject
      expect(of_nothing.previous).toBeInstanceOf(Nothing)
    })

    it("defaults to an Maybe of the same type", () => {
      const maybe = Maybe("boop")
      const subject = Subject(maybe)
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<string>>>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_outcome: Subject<Outcome<string>> = Subject(Maybe("boop"))
      // @ts-expect-error
      const of_result: Subject<Result<string>> = Subject(Maybe("boop"))
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject(Maybe("boop"))
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject(Maybe("boop"))
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject(Maybe("boop"))
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(Maybe("boop"))
    })
  })

  describe("constructing a Subject from an initial Result", () => {
    it("initialises with an apppropriate Maybe variant", () => {
      const of_just = Subject(Result("boop")) as Subject
      expect(of_just.previous).toBeInstanceOf(Just)

      const of_failure = Subject(Result(new Error())) as Subject
      expect(of_failure.previous).toBeInstanceOf(Failure)
    })

    it("defaults to a Result of the same type", () => {
      const result = Result("boop")
      const subject = Subject(result)
      expectTypeOf(subject).toEqualTypeOf<Subject<Result<string>>>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_outcome: Subject<Outcome<string>> = Subject(Result("boop"))
      // @ts-expect-error
      const of_maybe: Subject<Maybe<string>> = Subject(Result("boop"))
      // @ts-expect-error
      const of_just: Subject<Just<string>> = Subject(Result("boop"))
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject(Result("boop"))
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject(Result("boop"))
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(Result("boop"))
    })
  })

  describe("constructing a Subject from an initial Just", () => {
    it("initialises with a Just", () => {
      const subject = Subject(Just("boop")) as Subject
      expect(subject.previous).toBeInstanceOf(Just)
    })

    it("defaults to a Just of the same type", () => {
      // annotated to prevent a string literal type
      const just: Just<string> = Just("boop")
      const subject = Subject(just)
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<string>>>()
      expectTypeOf(subject.value).toEqualTypeOf<string>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_outcome: Subject<Outcome<string>> = Subject(Just("boop"))
      // @ts-expect-error
      const of_maybe: Subject<Maybe<string>> = Subject(Just("boop"))
      // @ts-expect-error
      const of_result: Subject<Result<string>> = Subject(Just("boop"))
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject(Just("boop"))
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject(Just("boop"))
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject(Just("boop"))
    })
  })

  describe("constructing a Subject from any other value type", () => {
    it("creates a Subject of Just that type", () => {
      const subject = Subject("boop")
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<string>>>()
      expectTypeOf(subject.value).toEqualTypeOf<string>()
    })

    it("cannot be annotated to form other types", () => {
      // @ts-expect-error
      const of_outcome: Subject<Outcome<string>> = Subject("boop")
      // @ts-expect-error
      const of_maybe: Subject<Maybe<string>> = Subject("boop")
      // @ts-expect-error
      const of_result: Subject<Result<string>> = Subject("boop")
      // @ts-expect-error
      const of_failure: Subject<Failure> = Subject("boop")
      // @ts-expect-error
      const of_nothing: Subject<Nothing> = Subject("boop")
      // @ts-expect-error
      const of_unknown: Subject<unknown> = Subject("boop")
    })
  })

  describe("constructing a Subject from an initial Outcome", () => {
    it("initialises with an apppropriate Outcome variant", () => {
      const of_just = Subject(Outcome("boop")) as Subject
      expect(of_just.previous).toBeInstanceOf(Just)

      const of_nothing = Subject(Outcome()) as Subject
      expect(of_nothing.previous).toBeInstanceOf(Nothing)

      const of_failure = Subject(Outcome(new Error())) as Subject
      expect(of_failure.previous).toBeInstanceOf(Failure)
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
