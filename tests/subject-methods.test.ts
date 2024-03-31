import { assert, describe, expect, expectTypeOf, it, test, vi } from "vitest"
const { fn } = vi

import { constructors } from "../lib.js"
const { Subject, Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("the next function", () => {
  describe("on a Subject of Just", () => {
    it("accepts values of the same type", () => {
      const subject = Subject(Just(1 as number))
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<number>>>()

      subject.next(Just(2))
      expect(subject.unwrap()).toBe(2)
    })

    it("accepts wrapped types", () => {
      const subject = Subject(Just(Just(1 as number)))
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<Just<number>>>>()

      subject.next(Just(Just(2)))
      const inner = subject.unwrap()
      expectTypeOf(inner).toEqualTypeOf<Just<number>>()
      expect(inner.unwrap()).toBe(2)
    })

    it("cannot be called with any other types (type error only)", () => {
      const subject = Subject(Just(1 as number))
      expectTypeOf(subject).toEqualTypeOf<Subject<Just<number>>>()

      // @ts-expect-error
      expect(() => subject.next(2)).toThrow()
      // @ts-expect-error
      subject.next(Nothing())
      // @ts-expect-error
      subject.next(Maybe(2))
      // @ts-expect-error
      subject.next(Result(2))
      // @ts-expect-error
      subject.next(Outcome(2))
    })
  })

  describe("on a Subject of Nothing", () => {
    it("can be called with an (optional) argument of Nothing", () => {
      const subject = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Nothing>>()

      const subscriber = fn()
      subject.subscribe({ next: subscriber })

      subject.next()
      expect(subject.inner).toBeInstanceOf(Nothing)
      expect(subscriber).toHaveBeenCalledWith(Nothing())
      expect(subscriber).toHaveBeenCalledTimes(1)

      subject.next(Nothing())
      expect(subject.inner).toBeInstanceOf(Nothing)
      expect(subscriber).toHaveBeenCalledWith(Nothing())
      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    it("cannot be called with any other types (type error only)", () => {
      const subject = Subject()
      expectTypeOf(subject).toEqualTypeOf<Subject<Nothing>>()

      // @ts-expect-error
      subject.next(Maybe())
      // @ts-expect-error
      subject.next(Outcome())
    })

    describe("on a Subject of Failure", () => {
      it("accepts a Failure type", () => {
        const subject = Subject(Failure("one"))
        expectTypeOf(subject).toEqualTypeOf<Subject<Failure>>()

        const subscriber = fn()
        subject.subscribe({ next: subscriber })

        subject.next(Failure("two"))
        expect(subject.unwrap_error().message).toBe("two")
        expect(subscriber).toHaveBeenCalledWith(Failure("two"))
        expect(subscriber).toHaveBeenCalledTimes(1)
      })

      it("cannot be called with any other types (type error only)", () => {
        const subject = Subject(Failure())
        expectTypeOf(subject).toEqualTypeOf<Subject<Failure>>()

        // @ts-expect-error
        subject.next()
        // @ts-expect-error
        subject.next(Nothing())
        // @ts-expect-error
        subject.next(Result(new Error()))
        // @ts-expect-error
        subject.next(Outcome(new Error()))
      })
    })
  })

  describe("on a Subject of Maybe", () => {
    it("accepts Maybe types", () => {
      const subject = Subject(Maybe(1))
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<number>>>()

      const subscriber = fn()
      subject.subscribe({ next: subscriber })

      subject.next(Maybe(2))
      expect(subject.unwrap()).toBe(2)
      expect(subscriber).toHaveBeenCalledWith(Maybe(2))
      expect(subscriber).toHaveBeenCalledTimes(1)

      subject.next(Maybe(null))
      expect(subject.inner).toBeInstanceOf(Nothing)
      expect(subscriber).toHaveBeenCalledWith(Nothing())
      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    it("accepts Just and Nothing types", () => {
      const subject = Subject(Maybe(1))
      expectTypeOf(subject).toEqualTypeOf<Subject<Maybe<number>>>()

      const subscriber = fn()
      subject.subscribe({ next: subscriber })

      subject.next(Just(2))
      expect(subject.unwrap()).toBe(2)
      expect(subscriber).toHaveBeenCalledWith(Just(2))
      expect(subscriber).toHaveBeenCalledTimes(1)

      subject.next(Nothing())
      expect(subject.inner).toBeInstanceOf(Nothing)
      expect(subscriber).toHaveBeenCalledWith(Nothing())
      expect(subscriber).toHaveBeenCalledTimes(2)
    })

    it("cannot be called with any other types (type error only)", () => {})
  })
})

describe("Subject.complete", () => {
  it("completes (and locks) the Subject", () => {
    const subject = Subject(Just(1 as number))
    expect(subject.is_completed).toBe(false)

    const complete = fn()
    const next = fn()

    subject.subscribe({ next, complete })
    expect(subject.subscribers.length).toBe(1)

    subject.next(Just(2))

    expect(next).toHaveBeenCalledWith(Just(2))
    expect(complete).not.toHaveBeenCalled()

    subject.complete()
    expect(complete).toHaveBeenCalled()

    expect(next).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledTimes(1)

    expect(subject.is_completed).toBe(true)
    expect(subject.subscribers.length).toBe(0)

    subject.subscribe({ next, complete })
    expect(subject.subscribers.length).toBe(0)

    subject.next(Just(3))
    expect(next).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledTimes(1)
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

    subject.next(Just(2))

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
    const one = Subject(Just(1 as number))
    const two = Subject(Just(2 as number))
    const merge_two = one.merge(two)
    expectTypeOf(merge_two).toEqualTypeOf<Subject<Just<number>>>()

    const three = Subject(Just("three" as string))
    const merge_three = one.merge(two, three)
    expectTypeOf(merge_three).toEqualTypeOf<Subject<Just<number | string>>>()

    const four = Subject(Nothing())
    const merge_four = one.merge(two, three, four)
    expectTypeOf(merge_four).toEqualTypeOf<Subject<Maybe<number | string>>>()

    one.next(Just(999))
    expect(merge_two.unwrap()).toBe(999)
    expect(merge_three.unwrap()).toBe(999)
    expect(merge_four.unwrap()).toBe(999)

    three.next(Just("blep"))
    expect(merge_three.unwrap()).toBe("blep")
    expect(merge_four.unwrap()).toBe("blep")

    four.next(Nothing())
    expect(merge_four.inner).toBeInstanceOf(Nothing)

    expect(merge_two.unwrap()).toBe(999) // (unchanged)
  })
})

describe("methods on the wrapped type", () => {
  it("can be called on the Subject", () => {
    const result = Subject(Just(1))
      .map(value => value * 2)
      .chain(value => Just(String(value)))

    expectTypeOf(result).toEqualTypeOf<Just<string>>()
    expect(result.unwrap()).toBe("2")
  })
})
