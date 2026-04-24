import { describe, it, expect } from 'vitest'
import { classNames } from './classNames'

describe('classNames', () => {
  it('should handle string arguments', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar')
  })

  it('should handle object arguments', () => {
    expect(classNames({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle array arguments', () => {
    expect(classNames(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle mixed arguments', () => {
    expect(classNames('foo', { bar: true }, ['baz'])).toBe('foo bar baz')
  })

  it('should handle empty arguments', () => {
    expect(classNames()).toBe('')
  })

  it('should handle null and undefined', () => {
    expect(classNames('foo', null, undefined, 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(classNames('btn', { active: isActive, disabled: isDisabled })).toBe('btn active')
  })
})
