const quoteService = require('../src/services/quote');
const Quote = require('../src/models/Quote');
const { GeneralError, BadRequest, NotFound } = require('../src/utils/errors');
const { response, isDefVar, isDefObject } = require('../src/utils/utils');

describe('Utils: response and helpers', () => {
  test('response builds expected object', () => {
    const res = response(200, 'OK', { currentPage: 1, nextPage: 2, totalPages: 5 }, 100, [{ id: 1 }]);
    expect(res).toEqual({
      statusCode: 200,
      message: 'OK',
      pagination: { currentPage: 1, nextPage: 2, totalPages: 5 },
      totalQuotes: 100,
      data: [{ id: 1 }],
    });
  });

  test('isDefVar truthy and falsy values', () => {
    // Note: isDefVar uses (variable ? true : false) so 0 and '' are falsy
    expect(isDefVar(0)).toBe(false);
    expect(isDefVar(null)).toBe(false);
    expect(isDefVar('')).toBe(false);
    expect(isDefVar('a')).toBe(true);
  });

  test('isDefObject returns false for empty and true for non-empty', () => {
    expect(isDefObject({})).toBe(false);
    expect(isDefObject({ a: 1 })).toBe(true);
  });
});

describe('Errors: GeneralError subclasses and getCode', () => {
  test('BadRequest getCode returns 400', () => {
    const e = new BadRequest('bad');
    expect(e.getCode()).toBe(400);
  });

  test('NotFound getCode returns 404', () => {
    const e = new NotFound('missing');
    expect(e.getCode()).toBe(404);
  });

  test('GeneralError default getCode returns 500', () => {
    const e = new GeneralError('oops');
    expect(e.getCode()).toBe(500);
  });
});

// Tests for QuoteService - using the real service instance but mocking model methods
describe('QuoteService (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getDocumentCount uses default document when none provided', async () => {
    const spy = jest.spyOn(Quote, 'estimatedDocumentCount').mockResolvedValue(123);
    const count = await quoteService.getDocumentCount();
    expect(spy).toHaveBeenCalled();
    expect(count).toBe(123);
  });

  test('getDocumentCount uses provided document when passed', async () => {
    const mockDoc = { estimatedDocumentCount: jest.fn().mockResolvedValue(7) };
    const count = await quoteService.getDocumentCount(mockDoc);
    expect(count).toBe(7);
  });

  test('getRandom returns aggregated quotes and calls aggregatePaginate with options', async () => {
    // Mock aggregate to return an object with sample method
    const aggregateObj = { sample: jest.fn().mockReturnValue('AGG_QUERY') };
    jest.spyOn(Quote, 'aggregate').mockReturnValue(aggregateObj);
    const paginateSpy = jest.spyOn(Quote, 'aggregatePaginate').mockResolvedValue({ docs: [{ quoteText: 'x' }] });

    const result = await quoteService.getRandom('Auth', 'Gen', 'text', 2, { page: 1, limit: 5 });
    expect(aggregateObj.sample).toHaveBeenCalledWith(2);
    expect(paginateSpy).toHaveBeenCalledWith('AGG_QUERY', { page: 1, limit: 5 });
    expect(result).toEqual({ docs: [{ quoteText: 'x' }] });
  });

  test('getRandom throws GeneralError when aggregatePaginate fails', async () => {
    jest.spyOn(Quote, 'aggregate').mockReturnValue({ sample: jest.fn().mockReturnValue('Q') });
    jest.spyOn(Quote, 'aggregatePaginate').mockRejectedValue(new Error('db fail'));

    // Pass options to avoid destructuring TypeError in function signature
    await expect(quoteService.getRandom('', '', '', 1, { page: 1, limit: 1 })).rejects.toBeInstanceOf(GeneralError);
  });

  test('getAllQuotes calls paginate with constructed query', async () => {
    const mockPaginate = jest.spyOn(Quote, 'paginate').mockResolvedValue({ docs: ['a'] });
    jest.spyOn(Quote, 'find').mockReturnValue('FIND_QUERY');

    const res = await quoteService.getAllQuotes('A', 'G', 'q', { page: 2, limit: 10 });
    expect(mockPaginate).toHaveBeenCalledWith('FIND_QUERY', { page: 2, limit: 10 });
    expect(res).toEqual({ docs: ['a'] });
  });

  test('getAllQuotes throws GeneralError on failure', async () => {
    jest.spyOn(Quote, 'find').mockImplementation(() => { throw new Error('fail'); });
    // Provide options so the function destructuring doesn't throw before try/catch
    await expect(quoteService.getAllQuotes('', '', '', { page: 1, limit: 1 })).rejects.toBeInstanceOf(GeneralError);
  });

  test('getAllGenres returns distinct genres', async () => {
    jest.spyOn(Quote, 'distinct').mockResolvedValue(['g1', 'g2']);
    const res = await quoteService.getAllGenres({ page: 1, limit: 10 });
    expect(res).toEqual(['g1', 'g2']);
  });

  test('getAllAuthors returns distinct authors', async () => {
    jest.spyOn(Quote, 'distinct').mockResolvedValue(['a1']);
    const res = await quoteService.getAllAuthors({ page: 1, limit: 10 });
    expect(res).toEqual(['a1']);
  });
});
