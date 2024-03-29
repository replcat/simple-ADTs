import { describe, expect, it } from "vitest"

import { constructors, inspect_type } from "../lib.js"
const { Just, Nothing, Failure } = constructors

describe("inspect_type", () => {
  it("returns a string representation of various native types", () => {
    expect(inspect_type(null)).toBe("null")
    expect(inspect_type(undefined)).toBe("undefined")
    expect(inspect_type(0)).toBe("number")
    expect(inspect_type("")).toBe("string")
    expect(inspect_type(Symbol())).toBe("symbol")
    expect(inspect_type(true)).toBe("boolean")
    expect(inspect_type(Object.create(null))).toBe("object")
    expect(inspect_type({})).toBe("Object")
    expect(inspect_type([])).toBe("Array")
    expect(inspect_type(() => {})).toBe("Function")
    expect(inspect_type(new Date())).toBe("Date")
    expect(inspect_type(new Error())).toBe("Error")
    expect(inspect_type(/./)).toBe("RegExp")
  })

  it("returns the name of custom types", () => {
    expect(inspect_type(Just(0))).toBe("Just")
    expect(inspect_type(Nothing())).toBe("Nothing")
    expect(inspect_type(Failure())).toBe("Failure")
  })
})
