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
        state: 'Has reviews statistics for movie',
        uponReceiving: 'a request for all movies stats summary',
        withRequest: {
          method: 'GET',
          path: `/stats`
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: [
            {
              'id': Matchers.like('1'),
              'totalReviews': Matchers.like(100),
              'averageRating': Matchers.like(7.5)
            }
          ]
        }
      })

      const result = await ReviewsClient.getAllMoviesStatistics()
      expect(result.length).toEqual(1)
      await expect(provider.verify()).resolves.toBeTruthy()
    })

    test.skip('should receive movie statistics for specified movies', async () => {
      await provider.addInteraction({
        state: 'Has reviews statistics for movie',
        uponReceiving: 'a request for movies stats summary',
        withRequest: {
          method: 'GET',
          path: `/stats`,
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
              'totalReviews': Matchers.like(100),
              'averageRating': Matchers.like(7.5)
            }
          ]
        }
      })

      const result = await ReviewsClient.getMoviesStatistics([1])
      expect(result.length).toEqual(1)
      await expect(provider.verify()).resolves.toBeTruthy()
    })

    test('should successfully receive a request for a movies review summary', async () => {
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
          body: Matchers.eachLike(
            {
              'movieId': '1',
              'headline': Matchers.like('a clickbait headline'),
              'message': Matchers.like('hopefully a positive review'),
              'ipAddress': Matchers.ipv4Address(),
              "gender": Matchers.term({
                matcher: 'F|M',
                generate: 'F'
              }),
              'anonymous': Matchers.boolean(),
              'createdAt': Matchers.iso8601DateTimeWithMillis()
            }
          )
        }
      })

      const result = await ReviewsClient.getMoviesReviews([1])
      expect(result.length).toEqual(1)
      await expect(provider.verify()).resolves.toBeTruthy()
    })

    test('should handle a request that responds with no reviews summary', async () => {
      await provider.addInteraction({
        state: 'Has no reviews',
        uponReceiving: 'a request for movies reviews',
        withRequest: {
          method: 'GET',
          path: `/reviews`,
          query: {
            'movieId[]': Matchers.eachLike('1')
          }
        },
        willRespondWith: {
          status: 404
        }
      })

      const result = await ReviewsClient.getMoviesReviews([1])
      expect(result.length).toEqual(0)
      await expect(provider.verify()).resolves.toBeTruthy()
    })

    test('should handle a request that responds with no stats summary', async () => {
      await provider.addInteraction({
        state: 'Has no statistics',
        uponReceiving: 'a request for movies statistics',
        withRequest: {
          method: 'GET',
          path: `/stats`
        },
        willRespondWith: {
          status: 404
        }
      })

      const result = await ReviewsClient.getAllMoviesStatistics()
      expect(result.length).toEqual(0)
      await expect(provider.verify()).resolves.toBeTruthy()
    })
  })

})