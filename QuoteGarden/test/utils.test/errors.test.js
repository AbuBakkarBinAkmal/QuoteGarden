const { GeneralError, BadRequest, NotFound } = require("../../src/utils/errors");

test("GeneralError.getCode returns 500 for generic errors", () => {
  const err = new GeneralError("Hello testing");
  expect(err.getCode()).toBe(500);
  expect(err.message).toBe("Hello testing");
});

test("BadRequest.getCode returns 400", () => {
  const err = new BadRequest("Bad request");
  expect(err.getCode()).toBe(400);
  expect(err.message).toBe("Bad request");
});

test("NotFound.getCode returns 404", () => {
  const err = new NotFound("Not found");
  expect(err.getCode()).toBe(404);
  expect(err.message).toBe("Not found");
});
