const path = require('path')
const ReviewsClient = require(path.resolve('./services/ReviewsClient'))

const { Pact, Matchers } = require('@pact-foundation/pact')

const CONSUMER = 'Movies'
const PROVIDER = 'Reviews'
const MOCK_PROVIDER_PORT = 3002

describe('Reviews contract tests', () => {
  let provider

  beforeAll(async () => {
    provider = new Pact({
      consumer: CONSUMER,
      provider: PROVIDER,
      port: MOCK_PROVIDER_PORT,
      log: path.resolve('./logs/pact.log'),
      dir: path.resolve('pacts'),
      logLevel: 'INFO',
      spec: 2
    })

    await provider.setup()
  })

  afterAll(async () => {
    await provider.finalize()
  })

  describe('Reviews client tests', () => {
    test('should receive movie statistics for specified movies', async () => {
      await provider.addInteraction({
        state: 'Has a few reviews',
        uponReceiving: 'a request for movie reviews summary',
        withRequest: {
          method: 'GET',
          path: `/reviews`,
          query: {
            'movieId[]': Matchers.eachLike('1')
          }
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: [
            {
              'id': Matchers.like('1'),
              'total': Matchers.like(100),
              'averageRating': Matchers.like(7.5)
            }
          ]
        }
      })

      const result = await ReviewsClient.getMovieReviews([1])
      expect(result.length).toEqual(1)
      await expect(provider.verify()).resolves.toBeTruthy()
    })
  })

})