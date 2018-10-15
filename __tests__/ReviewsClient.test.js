const ReviewsClient = require('../utils/ReviewsClient')
const { Pact, Matchers } = require('@pact-foundation/pact')

// Excercise uncomment:
const CONSUMER = 'Movies' // What is the name of the consumer??
const PROVIDER = 'Reviews' // What is the name of the provider??
const MOCK_PROVIDER_PORT = 3002 // What is the provider's port details??

describe('Reviews contract tests', () => {
  let provider

  beforeAll(async () => {
    provider = new Pact({
      consumer: CONSUMER,
      provider: PROVIDER,
      port: MOCK_PROVIDER_PORT,
      log: process.cwd() + '/logs/pact.log',
      dir: process.cwd() + '/pacts',
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