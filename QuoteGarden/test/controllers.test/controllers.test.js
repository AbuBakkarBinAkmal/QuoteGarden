jest.mock('../../src/services/quote', () => ({
  getRandom: jest.fn(),
  getAllQuotes: jest.fn(),
  getAllGenres: jest.fn(),
  getAllAuthors: jest.fn(),
}));

const QuoteService = require('../../src/services/quote');
const { getRandomQuotes, getAllQuotes } = require('../../src/api/controllers/quote');
const { getAllGenres } = require('../../src/api/controllers/genre');
const { getAllAuthors } = require('../../src/api/controllers/author');

// Simple mock for Express res object
const createRes = () => {
  const res = {};
  res.statusCode = null;
  res.jsonPayload = null;
  res.status = jest.fn(function (code) {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(function (payload) {
    res.jsonPayload = payload;
    return res;
  });
  return res;
};

describe('Controllers: quote, genre, author', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getRandomQuotes returns 200 with formatted response', async () => {
    const fakeResult = {
      docs: [{ _id: '1', quoteText: 'Hello' }],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
      nextPage: null,
    };
    QuoteService.getRandom.mockResolvedValue(fakeResult);

    const req = { query: { author: 'A', genre: 'G', query: 'Q', count: 2, page: 3, limit: 5 } };
    const res = createRes();

    await getRandomQuotes(req, res, jest.fn());

    expect(QuoteService.getRandom).toHaveBeenCalledWith('A', 'G', 'Q', 2, { page: 3, limit: 5 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    // Shape assertions
    expect(res.jsonPayload).toMatchObject({
      statusCode: 200,
      message: 'Random quotes',
      pagination: { currentPage: 1, nextPage: null, totalPages: 1 },
      totalQuotes: 1,
      data: [{ _id: '1', quoteText: 'Hello' }],
    });
  });

  test('getAllQuotes returns 200 with formatted response', async () => {
    const fakeResult = {
      docs: [{ _id: '2' }],
      totalDocs: 10,
      page: 2,
      totalPages: 5,
      nextPage: 3,
    };
    QuoteService.getAllQuotes.mockResolvedValue(fakeResult);

    const req = { query: { author: '', genre: '', query: 'abc', page: 2, limit: 10 } };
    const res = createRes();

    await getAllQuotes(req, res, jest.fn());

    expect(QuoteService.getAllQuotes).toHaveBeenCalledWith('', '', 'abc', { page: 2, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toMatchObject({
      statusCode: 200,
      message: 'Quotes',
      pagination: { currentPage: 2, nextPage: 3, totalPages: 5 },
      totalQuotes: 10,
      data: [{ _id: '2' }],
    });
  });

  test('getAllGenres returns list with null paginations in wrapper', async () => {
    QuoteService.getAllGenres.mockResolvedValue(['Life', 'Inspiration']);
    const req = { query: {} };
    const res = createRes();

    await getAllGenres(req, res, jest.fn());

    expect(QuoteService.getAllGenres).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toMatchObject({
      statusCode: 200,
      message: 'Genres',
      pagination: { currentPage: null, nextPage: null, totalPages: null },
      totalQuotes: null,
      data: ['Life', 'Inspiration'],
    });
  });

  test('getAllAuthors returns list with null paginations in wrapper', async () => {
    QuoteService.getAllAuthors.mockResolvedValue(['Author 1']);
    const req = { query: {} };
    const res = createRes();

    await getAllAuthors(req, res, jest.fn());

    expect(QuoteService.getAllAuthors).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.jsonPayload).toMatchObject({
      statusCode: 200,
      message: 'Authors',
      pagination: { currentPage: null, nextPage: null, totalPages: null },
      totalQuotes: null,
      data: ['Author 1'],
    });
  });
});
