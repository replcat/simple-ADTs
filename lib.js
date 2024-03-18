/**
 * @template T
 * @param {T} value
 * @returns {ADT<T>}
 */
function ADT(value) {
  return Object.create(ADT.prototype, {
    value: { value, writable: true, enumerable: true },
  })
}

ADT.prototype.of = function(value) {
  return ADT(value)
}

ADT.prototype.map = function(fn) {
  return ADT(fn(this.value))
}

/**
 * @template T
 * @param {T} value
 * @returns {Atom<T>}
 */
function Atom(value) {
  return Object.create(Atom.prototype, {
    value: { value, writable: true, enumerable: true },
  })
}

Atom.prototype = Object.create(ADT.prototype)
Atom.prototype.constructor = Atom

Atom.prototype.unwrap = function() {
  if (this.value !== undefined) {
    return this.value
  } else {
    throw new Error(`Unwrapped an empty Atom`)
  }
}

/**
 * @template T
 * @param {T} value
 * @returns {Some<T>}
 */
function Some(value) {
  return Object.create(Some.prototype, {
    value: { value, writable: true, enumerable: true },
  })
}

Some.prototype = Object.create(Atom.prototype)
Some.prototype.constructor = Some

Some.prototype.map = function(fn) {
  return Some(fn(this.value))
}

/**
 * @returns {None}
 */
function None() {
  return Object.create(None.prototype)
}

None.prototype = Object.create(Atom.prototype)
None.prototype.constructor = None

None.prototype.map = function(fn) {
  return this
}

export { None, Some }
