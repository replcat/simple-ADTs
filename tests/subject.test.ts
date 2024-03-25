import { assert, describe, expect, expectTypeOf, it, test, vi } from "vitest"
const { fn } = vi

import { constructors } from "../lib.js"
const { Subject, Base, Maybe, Result, Some, None, Fail } = constructors

describe("constructor and basic usage", () => {
  describe("subscribe", () => {
    it("calls the subscriber's next function when a value is emitted", () => {
      const subject = Subject()
      const next = fn()
      subject.subscribe({ next, complete: () => {} })

      subject.next("test")

      expect(next).toHaveBeenCalledWith("test")
    })

    it("calls the subscriber's complete function when complete is called", () => {
      const subject = Subject()

      const complete = fn()
      subject.subscribe({ next: () => {}, complete })

      subject.complete()

      expect(complete).toHaveBeenCalled()
    })
  })

  describe("next", () => {
    it("updates the subject's value", () => {
      const subject = Subject()

      subject.next("test")

      expect(subject.value).toBe("test")
    })

    it("does not call the subscriber's next function after complete is called", () => {
      const subject = Subject()

      const next = fn()
      subject.subscribe({ next, complete: () => {} })

      subject.complete()
      subject.next("test")

      expect(next).not.toHaveBeenCalled()
    })
  })

  describe("complete", () => {
    it("sets is_completed to true", () => {
      const subject = Subject()

      subject.complete()

      expect(subject.is_completed).toBe(true)
    })

    it("does not call the subscriber's complete function again after complete is called", () => {
      const subject = Subject()

      const complete = fn()
      subject.subscribe({ next: () => {}, complete })

      subject.complete()
      subject.complete()

      expect(complete).toHaveBeenCalledTimes(1)
    })
  })
})

describe("methods", () => {
  describe("map", () => {
    it("transforms emitted values", () => {
      const subject = Subject()

      const next = fn()
      subject.subscribe({ next, complete: () => {} })

      const mapped = subject.map(String)
      expectTypeOf(mapped).toMatchTypeOf<Subject<string>>()

      const next_mapped = fn()
      mapped.subscribe({ next: next_mapped, complete: () => {} })

      subject.next(1)

      expect(next).toHaveBeenCalledWith(1)
      expect(next_mapped).toHaveBeenCalledWith("1")
    })
  })

  describe("filter", () => {
    it("only emits values which satisfy the predicate", () => {
      const subject = Subject() as Subject<number>

      const next = fn()
      subject.subscribe({ next, complete: () => {} })

      const is_even = (value: number) => value % 2 === 0
      const filtered = subject.filter(is_even)

      const next_filtered = fn()
      filtered.subscribe({ next: next_filtered, complete: () => {} })

      for (let i = 1; i <= 5; i++) {
        subject.next(i)
      }

      expect(next.mock.calls).toEqual([[1], [2], [3], [4], [5]])
      expect(next_filtered.mock.calls).toEqual([[2], [4]])
    })

    it("narrows the type if the predicate is a type guard", () => {
      const subject = Subject() as Subject<number | string>

      const is_string = (value: unknown): value is string => typeof value === "string"
      const filtered = subject.filter(is_string)

      const next = fn()
      filtered.subscribe({ next, complete: () => {} })

      subject.next(1)
      subject.next("hello")

      expect(next).toHaveBeenCalledWith("hello")
      expect(next).not.toHaveBeenCalledWith(1)

      expectTypeOf(filtered).toMatchTypeOf<Subject<string>>()
    })

    it("can be used to narrow Maybe to Some (with Some.isa)", () => {
      const subject = Subject() as Subject<Maybe<number>>
      const filtered = subject.filter(Some.isa)

      const next = fn()
      filtered.subscribe({ next, complete: () => {} })

      subject.next(Maybe())
      subject.next(Maybe(1))

      expect(next).toHaveBeenCalledWith(Maybe(1))
      expect(next).not.toHaveBeenCalledWith(Maybe())

      expectTypeOf(filtered).toMatchTypeOf<Subject<Some<number>>>() // fails
    })

    it("can be used to narrow Maybe to Some (with a custom type guard)", () => {
      const subject = Subject() as Subject<Maybe<number>>

      const is_some = (value: unknown): value is Some<number> => value instanceof Some
      const filtered = subject.filter(is_some)

      const next = fn()
      filtered.subscribe({ next, complete: () => {} })

      subject.next(Maybe())
      subject.next(Maybe(1))

      expect(next).toHaveBeenCalledWith(Maybe(1))
      expect(next).not.toHaveBeenCalledWith(Maybe())

      expectTypeOf(filtered).toMatchTypeOf<Subject<Some<number>>>() // works
    })
  })

  describe("merge", () => {
    it("emits values from both subjects", () => {
      const subject_of_number = Subject() as Subject<number>
      const subject_of_string = Subject() as Subject<string>

      const merged = subject_of_number.merge(subject_of_string)
      expectTypeOf(merged).toMatchTypeOf<Subject<number | string>>()

      const next = fn()
      merged.subscribe({ next, complete: () => {} })

      subject_of_number.next(1)
      expect(next).toHaveBeenCalledWith(1)

      subject_of_string.next("two")
      expect(next).toHaveBeenCalledWith("two")
    })
  })
})

describe("async usage", () => {
  it("supports async subscribers", async () => {
    const subject = Subject()

    let resolve_next
    const next_promise = new Promise(resolve => {
      resolve_next = resolve
    })

    const next = fn().mockImplementation(() => setTimeout(() => resolve_next(), 50))

    subject.subscribe({ next, complete: () => {} })

    subject.next("test")

    // wait for next to be called
    await next_promise

    expect(next).toHaveBeenCalledWith("test")
  })

  it("supports async next calls", async () => {
    const subject = Subject()

    const next = fn()
    subject.subscribe({ next, complete: () => {} })

    await Promise.resolve().then(() => subject.next("boop"))

    expect(next).toHaveBeenCalledWith("boop")
  })

  it("supports async complete calls", async () => {
    const subject = Subject()

    const complete = fn()
    subject.subscribe({ next: () => {}, complete })

    await Promise.resolve().then(() => subject.complete())

    expect(complete).toHaveBeenCalled()
  })
})

describe("with other types", () => {
  it("Maybe", () => {
    const subject = Subject(Maybe(1))

    const next = fn()
    subject.subscribe({ next, complete: () => {} })

    subject.next(Maybe(2))

    expect(next).toHaveBeenCalledWith(Maybe(2))
    expect(subject.value).toEqual(Maybe(2))
  })

  it("Result", () => {
    const subject = Subject(Result(1))

    const next = fn()
    subject.subscribe({ next, complete: () => {} })

    subject.next(Result(null, "boo"))

    expect(next).toHaveBeenCalledWith(Fail("boo"))
    expect(subject.value).toEqual(Fail("boo"))
  })

  it("Maybe (async)", async () => {
    const subject = Subject(Maybe(1))

    const next = fn().mockResolvedValue(undefined)
    subject.subscribe({ next, complete: () => {} })

    subject.next(Maybe(2))

    // wait for promises to resolve
    await new Promise(setImmediate)

    expect(next).toHaveBeenCalledWith(Maybe(2))
  })
})
