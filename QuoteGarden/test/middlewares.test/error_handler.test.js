const { GeneralError, BadRequest, NotFound } = require('../../src/utils/errors');
const errorHandler = require('../../src/api/middlewares/error-handler');

// Simple response mock
const createRes = () => {
  const res = {};
  res.statusCode = null;
  res.payload = null;
  res.status = jest.fn(function (code) { res.statusCode = code; return res; });
  res.json = jest.fn(function (payload) { res.payload = payload; return res; });
  return res;
};

describe('Middleware: errorHandler', () => {
  test('handles GeneralError subclasses with custom codes', () => {
    const err = new BadRequest('bad');
    const req = {};
    const res = createRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.payload).toEqual({ status: 'error', message: 'bad' });
  });

  test('handles generic Error with 500', () => {
    const err = new Error('boom');
    const req = {};
    const res = createRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.payload).toEqual({ status: 'error', message: 'boom' });
  });
});
