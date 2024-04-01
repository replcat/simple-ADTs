import { fc, test } from "@fast-check/vitest"
import { assert, describe, expect, expectTypeOf, it } from "vitest"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

const J = Just
const M = Maybe
const R = Result
const O = Outcome

describe("join and flatten", () => {
  describe("Just", () => {
    const just_just_justs = [
      Just(1),
      Just(Just(2)),
      Just(Just(Just(3))),
    ] as Just<Just<Just<number>>>[]

    test("join", () => {
      const joined = just_just_justs.map(J.join())
      expectTypeOf(joined).toMatchTypeOf<Just<Just<number>>[]>()
      expect(joined).toEqual([Just(1), Just(2), Just(Just(3))])
    })

    test("flatten", () => {
      const flattened = just_just_justs.map(J.flatten())
      expectTypeOf(flattened).toMatchTypeOf<Just<number>[]>()
      expect(flattened).toEqual([Just(1), Just(2), Just(3)])
    })
  })

  describe("Maybe", () => {
    const maybe_maybe_maybes = [
      Maybe(),
      Maybe(1),
      Maybe(Maybe(2)),
      Maybe(Maybe(Maybe(3))),
    ] as Maybe<Maybe<Maybe<number>>>[] // not strictly true...

    test("join", () => {
      const joined = maybe_maybe_maybes.map(M.join())
      expectTypeOf(joined).toMatchTypeOf<Maybe<Maybe<number>>[]>()
      expect(joined).toEqual([Nothing(), Just(1), Just(2), Just(Just(3))])
    })

    test("flatten", () => {
      const flattened = maybe_maybe_maybes.map(M.flatten())
      expectTypeOf(flattened).toMatchTypeOf<Maybe<number>[]>()
      expect(flattened).toEqual([Nothing(), Just(1), Just(2), Just(3)])
    })
  })

  describe("Result", () => {
    const result_result_results = [
      Result(),
      Result(1),
      Result(Result(2)),
      Result(Result(Result(3))),
    ] as Result<Result<Result<number>>>[] // not strictly true...

    test("join", () => {
      const joined = result_result_results.map(R.join())
      expectTypeOf(joined).toMatchTypeOf<Result<Result<number>>[]>()
      expect(joined).toEqual([Failure(), Just(1), Just(2), Just(Just(3))])
    })

    test("flatten", () => {
      const flattened = result_result_results.map(R.flatten())
      expectTypeOf(flattened).toMatchTypeOf<Result<number>[]>()
      expect(flattened).toEqual([Failure(), Just(1), Just(2), Just(3)])
    })
  })

  describe("Outcome", () => {
    const outcome_outcome_outcomes = [
      Outcome(),
      Outcome(1),
      Outcome(Outcome(2)),
      Outcome(Outcome(Outcome(3))),
    ] as Outcome<Outcome<Outcome<number>>>[]

    test("join", () => {
      const joined = outcome_outcome_outcomes.map(O.join())
      expectTypeOf(joined).toMatchTypeOf<Outcome<Outcome<number>>[]>()
      expect(joined).toEqual([Nothing(), Just(1), Just(2), Just(Just(3))])
    })

    test("flatten", () => {
      const flattened = outcome_outcome_outcomes.map(O.flatten())
      expectTypeOf(flattened).toMatchTypeOf<Outcome<number>[]>()
      expect(flattened).toEqual([Nothing(), Just(1), Just(2), Just(3)])
    })
  })
})

describe("map", () => {
  test("Just", () => {
    const justs = [Just(1), Just(2)] as Just<number>[]

    const stringify = J.map((n: number) => String(n))
    const result = justs.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Just<string>[]>()
    expect(result).toEqual([Just("1"), Just("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.map((n: number) => String(n))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([Nothing(), Just("1"), Just("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.map((n: number) => String(n))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Failure(), Just("1"), Just("2")])
  })
})

describe("chain", () => {
  test("Just", () => {
    const justs = [Just(1), Just(2)] as Just<number>[]

    const stringify = J.chain((n: number) => J(String(n)))
    const result = justs.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Just<string>[]>()
    expect(result).toEqual([Just("1"), Just("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.chain((n: number) => Maybe(String(n)))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([Nothing(), Just("1"), Just("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.chain((n: number) => Result(String(n)))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Failure(), Just("1"), Just("2")])
  })
})

describe("ap", () => {
  test("Just", () => {
    const justs = [Just(1), Just(2)] as Just<number>[]

    const stringify = J.ap(J((n: number) => String(n)))
    const result = justs.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Just<string>[]>()
    expect(result).toEqual([Just("1"), Just("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const stringify = M.ap(Maybe((n: number) => String(n)))
    const result = maybes.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([Nothing(), Just("1"), Just("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const stringify = R.ap(Result((n: number) => String(n)))
    const result = results.map(stringify)

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Failure(), Just("1"), Just("2")])
  })
})

describe("traverse", () => {
  test("Just", () => {
    const justs = [Just(1), Just(2)] as Just<number>[]

    const result = justs
      .map(J.traverse((n: number) => Just(String(n))))
      .map(J.flatten())

    expectTypeOf(result).toMatchTypeOf<Just<string>[]>()
    expect(result).toEqual([Just("1"), Just("2")])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const result = maybes
      .map(M.traverse((n: number) => Maybe(String(n))))
      .map(M.flatten())

    expectTypeOf(result).toMatchTypeOf<Maybe<string>[]>()
    expect(result).toEqual([Nothing(), Just("1"), Just("2")])
  })

  test("Result", () => {
    const results = [Result(), Result(1), Result(2)] as Result<number>[]

    const result = results
      .map(R.traverse((n: number) => Result(String(n))))
      .map(R.flatten())

    expectTypeOf(result).toMatchTypeOf<Result<string>[]>()
    expect(result).toEqual([Failure(), Just("1"), Just("2")])
  })
})

describe("fold", () => {
  test("Just", () => {
    const justs = [Just(1), Just(2)] as Just<number>[]

    const fold = J.fold(
      value => String(value),
    )

    const result = justs
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("12")
  })

  test("Nothing", () => {
    const nothings = [Nothing(), Nothing()] as Nothing[]

    const fold = Nothing.fold(
      () => "unexpected",
      () => "expected",
    )

    const result = nothings.map(fold)

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["expected", "expected"])
  })

  test("Failure", () => {
    const failures = [Failure("boop"), Failure("doop")] as Failure[]

    const fold = Failure.fold(
      () => "unexpected",
      error => error.message,
    )

    const result = failures.map(fold)

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["boop", "doop"])
  })

  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const fold = M.fold(
      value => String(value),
      () => "boop",
    )

    const result = maybes
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("boop12")
  })

  test("Result", () => {
    const results = [Result("boo"), Result(1), Result(2)] as Result<number>[]

    const fold = R.fold(
      value => String(value),
      error => error.message,
    )

    const result = results
      .map(fold)
      .reduce((a, b) => a + b, "")

    expectTypeOf(result).toMatchTypeOf<string>()
    expect(result).toBe("boo12")
  })
})

describe("match", () => {
  test("Maybe", () => {
    const maybes = [Maybe(), Maybe(1), Maybe(2)] as Maybe<number>[]

    const result = maybes.map(M.match({
      Just: n => String(n),
      Nothing: () => "boop",
    }))

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["boop", "1", "2"])
  })

  test("Result", () => {
    const results = [Result(new Error("oh nooo")), Result(1), Result(2)] as Result<number>[]

    const result = results.map(R.match({
      Just: n => String(n),
      Failure: e => e.message,
    }))

    expectTypeOf(result).toMatchTypeOf<string[]>()
    expect(result).toEqual(["oh nooo", "1", "2"])
  })
})

describe("calling the standalone functions directly", () => {
  test("Just", () => {
    const maybe = Maybe(1)
    expectTypeOf(maybe).toMatchTypeOf<Maybe<number>>()

    const mapped = M.map((n: number) => String(n))(maybe)
    expectTypeOf(mapped).toMatchTypeOf<Maybe<string>>()

    assert(Just.isa()(maybe))
    expectTypeOf(maybe).toMatchTypeOf<Just<number>>()
  })
})
