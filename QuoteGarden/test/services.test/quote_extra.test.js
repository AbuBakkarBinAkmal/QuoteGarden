jest.mock("../../src/models/Quote", () => ({
  estimatedDocumentCount: jest.fn().mockResolvedValue(5),
  paginate: jest.fn().mockResolvedValue({ docs: [{ _id: "1", quoteText: "a" }], totalDocs: 1 }),
  distinct: jest.fn().mockResolvedValue(["Inspiration", "Life"]),
  aggregate: jest.fn().mockReturnValue({ sample: jest.fn().mockReturnValue("AGG_QUERY") }),
  aggregatePaginate: jest.fn().mockResolvedValue({ docs: [{ _id: "r1" }], totalDocs: 1 }),
  find: jest.fn().mockReturnValue({}),
}));

const QuoteService = require("../../src/services/quote");
const Quote = require("../../src/models/Quote");
const { GeneralError } = require("../../src/utils/errors");

test("getDocumentCount uses provided document and returns count", async () => {
  const value = await QuoteService.getDocumentCount(Quote);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(Quote.estimatedDocumentCount).toHaveBeenCalled();
});

test("getAllGenres returns distinct genres", async () => {
  const genres = await QuoteService.getAllGenres({ page: 1, limit: 10 });
  expect(genres).toEqual(["Inspiration", "Life"]);
  expect(Quote.distinct).toHaveBeenCalledWith("quoteGenre");
});

test("getAllAuthors returns distinct authors", async () => {
  const authors = await QuoteService.getAllAuthors({ page: 1, limit: 10 });
  expect(authors).toEqual(["Inspiration", "Life"]);
  expect(Quote.distinct).toHaveBeenCalledWith("quoteAuthor");
});

test("getAllQuotes calls paginate and returns paginated result", async () => {
  const result = await QuoteService.getAllQuotes("", "", "", { page: 1, limit: 10 });
  expect(result).toHaveProperty("docs");
  expect(Quote.paginate).toHaveBeenCalled();
});

test("getRandom returns aggregatePaginate result", async () => {
  const result = await QuoteService.getRandom("", "", "", 1, { page: 1, limit: 10 });
  expect(result).toHaveProperty("docs");
  expect(Quote.aggregate).toHaveBeenCalled();
  expect(Quote.aggregatePaginate).toHaveBeenCalled();
});

test("getRandom wraps errors in GeneralError", async () => {
  // make aggregatePaginate throw
  Quote.aggregate.mockReturnValue({ sample: jest.fn().mockReturnValue("AGG") });
  Quote.aggregatePaginate.mockRejectedValueOnce(new Error("fail"));

  await expect(QuoteService.getRandom("", "", "", 1, { page: 1, limit: 1 })).rejects.toBeInstanceOf(GeneralError);
});

// Tests to cover error branches in QuoteService
test("getAllQuotes wraps errors in GeneralError", async () => {
  Quote.paginate.mockRejectedValueOnce(new Error("paginate fail"));
  await expect(
    QuoteService.getAllQuotes("", "", "", { page: 1, limit: 10 })
  ).rejects.toBeInstanceOf(GeneralError);
});

test("getAllGenres wraps errors in GeneralError", async () => {
  Quote.distinct.mockRejectedValueOnce(new Error("distinct fail"));
  await expect(QuoteService.getAllGenres({ page: 1, limit: 10 })).rejects.toBeInstanceOf(
    GeneralError
  );
});

test("getAllAuthors wraps errors in GeneralError", async () => {
  Quote.distinct.mockRejectedValueOnce(new Error("distinct fail 2"));
  await expect(QuoteService.getAllAuthors({ page: 1, limit: 10 })).rejects.toBeInstanceOf(
    GeneralError
  );
});
