import { describe, it, expect } from 'vitest'
import {
  noop,
  identity,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isNil,
  omit,
  pick,
  debounce,
  throttle,
} from './helpers'

describe('helpers', () => {
  describe('noop', () => {
    it('should return undefined', () => {
      expect(noop()).toBeUndefined()
    })
  })

  describe('identity', () => {
    it('should return the same value', () => {
      expect(identity(1)).toBe(1)
      expect(identity('test')).toBe('test')
      expect(identity(null)).toBe(null)
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => { })).toBe(true)
      expect(isFunction(function () { })).toBe(true)
    })

    it('should return false for non-functions', () => {
      expect(isFunction('test')).toBe(false)
      expect(isFunction(123)).toBe(false)
      expect(isFunction(null)).toBe(false)
    })
  })

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('test')).toBe(true)
      expect(isString('')).toBe(true)
    })

    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(0)).toBe(true)
    })

    it('should return false for non-numbers', () => {
      expect(isNumber('123')).toBe(false)
      expect(isNumber(NaN)).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })

    it('should return false for non-booleans', () => {
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean('true')).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject(123)).toBe(false)
    })
  })

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('should return false for non-arrays', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('test')).toBe(false)
    })
  })

  describe('isNil', () => {
    it('should return true for null and undefined', () => {
      expect(isNil(null)).toBe(true)
      expect(isNil(undefined)).toBe(true)
    })

    it('should return false for other values', () => {
      expect(isNil(0)).toBe(false)
      expect(isNil('')).toBe(false)
      expect(isNil(false)).toBe(false)
    })
  })

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 })
    })

    it('should not modify original object', () => {
      const obj = { a: 1, b: 2 }
      omit(obj, ['a'])
      expect(obj).toEqual({ a: 1, b: 2 })
    })
  })

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
    })

    it('should not modify original object', () => {
      const obj = { a: 1, b: 2 }
      pick(obj, ['a'])
      expect(obj).toEqual({ a: 1, b: 2 })
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let counter = 0
      const increment = debounce(() => counter++, 100)

      increment()
      increment()
      increment()

      expect(counter).toBe(0)

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(counter).toBe(1)
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let counter = 0
      const increment = throttle(() => counter++, 100)

      increment()
      expect(counter).toBe(1)

      increment()
      expect(counter).toBe(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      increment()
      expect(counter).toBe(2)
    })
  })
})
