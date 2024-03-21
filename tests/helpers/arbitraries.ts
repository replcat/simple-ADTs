import { fc } from "@fast-check/vitest"

export const nonnullable_values = fc.anything().filter(value => value != null)
export const nonnullable_functions = fc.func(nonnullable_values)
