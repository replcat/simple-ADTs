import { assert, describe, expect, expectTypeOf, it, test, vi } from "vitest"
const { fn } = vi

import { constructors } from "../lib.js"
const { Subject, Maybe, Result, Some, None, Fail } = constructors

describe("Subject", () => {
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
