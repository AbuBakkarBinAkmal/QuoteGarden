const { response, isDefVar, isDefObject } = require("../../src/utils/utils");

test("isDefVar returns false for falsy values", () => {
  expect(isDefVar(0)).toBeFalsy();
  expect(isDefVar('')).toBeFalsy();
  expect(isDefVar(null)).toBeFalsy();
  expect(isDefVar(undefined)).toBeFalsy();
});

test("isDefObject returns false for empty object and true for non-empty", () => {
  expect(isDefObject({})).toBeFalsy();
  expect(isDefObject({ a: 1 })).toBeTruthy();
});

test("response handles missing pagination keys gracefully (undefined fields)", () => {
  const res = response(200, "msg", { currentPage: undefined, nextPage: undefined, totalPages: undefined }, 0, null);
  expect(res).toHaveProperty('statusCode', 200);
  expect(res).toHaveProperty('message', 'msg');
  expect(res).toHaveProperty('pagination');
  expect(res.pagination).toEqual({ currentPage: undefined, nextPage: undefined, totalPages: undefined });
  expect(res).toHaveProperty('totalQuotes', 0);
  expect(res).toHaveProperty('data', null);
});
