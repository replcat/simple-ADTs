import { fc, it } from "@fast-check/vitest"
import { describe, expect, expectTypeOf } from "vitest"
import { nonnullable_values } from "./helpers/arbitraries.js"

import { constructors } from "../lib.js"
const { Outcome, Maybe, Result, Just, Nothing, Failure } = constructors

describe("unwrap", () => {
  describe("on Just", () => {
    it.prop([nonnullable_values])("returns wrapped values", (value: any) => {
      expect(Just(value).unwrap()).toBe(value)
    })

    it("types wrapped values", () => {
      let just = Just("test" as string)
      let unwrapped = just.unwrap()
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe("on Nothing", () => {
    it("throws a generic error", () => {
      expect(() => Nothing().unwrap()).toThrowError(
        new TypeError(`Unwrapped an empty Nothing`),
      )
    })
  })

  describe("on Failure", () => {
    it("throws the wrapped error", () => {
      expect(() => Failure("cool error").unwrap()).toThrowError("cool error")
    })
  })
})

describe("unwrap_or", () => {
  describe("on Just", () => {
    it("returns wrapped values", () => {
      expect(Just("test").unwrap_or("fallback")).toBe("test")
    })

    it("types wrapped values", () => {
      let just = Just("test" as string)
      let unwrapped = just.unwrap_or("fallback")
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe("on Nothing", () => {
    it("returns the fallback value", () => {
      expect(Nothing().unwrap_or("fallback")).toBe("fallback")
    })

    it("types the fallback value", () => {
      let nothing = Nothing()
      let unwrapped = nothing.unwrap_or("fallback" as string)
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("fallback")
    })
  })

  describe("on Failure", () => {
    it("returns the fallback value", () => {
      expect(Failure("cool error").unwrap_or("fallback")).toBe("fallback")
    })
  })
})

describe("unwrap_or_else", () => {
  describe("on Just", () => {
    it("returns wrapped values", () => {
      expect(Just("test").unwrap_or_else(() => "fallback")).toBe("test")
    })

    it("types wrapped values", () => {
      let just = Just("test" as string)
      let unwrapped = just.unwrap_or_else(() => "fallback")
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("test")
    })
  })

  describe("on Nothing", () => {
    it("returns the fallback value", () => {
      expect(Nothing().unwrap_or_else(() => "fallback")).toBe("fallback")
    })

    it("types the fallback value", () => {
      let nothing = Nothing()
      let unwrapped = nothing.unwrap_or_else(() => "fallback" as string)
      expectTypeOf(unwrapped).toEqualTypeOf<string>()
      expect(unwrapped).toBe("fallback")
    })
  })

  describe("on Failure", () => {
    it("returns the fallback value", () => {
      expect(Failure("cool error").unwrap_or_else(() => "fallback")).toBe("fallback")
    })
  })
})
