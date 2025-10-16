const Calculator = require('../../sample_calculator');

describe('Calculator (comprehensive)', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  test('add: returns correct sum and records history', () => {
    expect(calc.add(4, 5)).toBe(9);
    const h = calc.getHistory();
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ operation: 'add', a: 4, b: 5, result: 9 });
  });

  test('subtract: returns correct difference and records history', () => {
    expect(calc.subtract(10, 6)).toBe(4);
    const h = calc.getHistory();
    expect(h[0]).toMatchObject({ operation: 'subtract', a: 10, b: 6, result: 4 });
  });

  test('multiply: returns product and records history', () => {
    expect(calc.multiply(3, 7)).toBe(21);
    const h = calc.getHistory();
    expect(h[0]).toMatchObject({ operation: 'multiply', a: 3, b: 7, result: 21 });
  });

  test('divide: returns quotient and records history', () => {
    expect(calc.divide(20, 4)).toBe(5);
    const h = calc.getHistory();
    expect(h[0]).toMatchObject({ operation: 'divide', a: 20, b: 4, result: 5 });
  });

  test('add/subtract/multiply/divide throw when inputs are not numbers', () => {
    expect(() => calc.add('1', 2)).toThrow('Both arguments must be numbers');
    expect(() => calc.add(1, undefined)).toThrow('Both arguments must be numbers');

    expect(() => calc.subtract([], 2)).toThrow('Both arguments must be numbers');
    expect(() => calc.multiply({}, 2)).toThrow('Both arguments must be numbers');
    expect(() => calc.divide('10', 2)).toThrow('Both arguments must be numbers');
  });

  test('divide throws when dividing by zero', () => {
    expect(() => calc.divide(5, 0)).toThrow('Cannot divide by zero');
  });

  test('history preserves order of operations and is a copy when retrieved', () => {
    calc.add(1, 1); // 2
    calc.multiply(2, 3); // 6
    calc.subtract(10, 4); // 6

    const h = calc.getHistory();
    expect(h).toHaveLength(3);
    expect(h[0].operation).toBe('add');
    expect(h[1].operation).toBe('multiply');
    expect(h[2].operation).toBe('subtract');

    // Mutating returned history should not affect internal history
    const external = calc.getHistory();
    external.push({ operation: 'hacked' });
    const fresh = calc.getHistory();
    expect(fresh).toHaveLength(3);
    expect(fresh.some(entry => entry.operation === 'hacked')).toBe(false);
  });

  test('clearHistory empties the history array', () => {
    calc.add(2, 3);
    expect(calc.getHistory()).toHaveLength(1);
    calc.clearHistory();
    expect(calc.getHistory()).toHaveLength(0);
  });

  test('isValidNumber works for various inputs', () => {
    expect(calc.isValidNumber(0)).toBe(true);
    expect(calc.isValidNumber(3.14)).toBe(true);
    expect(calc.isValidNumber(NaN)).toBe(false);
    expect(calc.isValidNumber(Infinity)).toBe(false);
    expect(calc.isValidNumber('5')).toBe(false);
    expect(calc.isValidNumber(null)).toBe(false);
  });
});
