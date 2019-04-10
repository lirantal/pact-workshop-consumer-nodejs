# Workshop Activity

## Prerequisites

* Git
* Node.js (>=8) and npm (>=5.5)
* Internet access for the broker, npm and GitHub access
* Basic understanding of JavaScript and Node.js or ExpressJS


## Intro 

Congratulations!
You have been recruited to the most exciting hollywood startup in the history of entertainment - YouMDB!

YouMDB is a movies database service that makes use of bleeding edge blockchain technology, AR, VR, and IMIU-AR to provide information about movies and enables the latest Web ^2.3.1 interactions (because, semver) such as creating reviews, and real-time movie rating capabilities.

As the lead software engineer, you are tasked with building the backend services in a rich Service Oriented Architecture with many many many microservices. Perhaps too many. We'll leave that for another workshop.

Your mission dear Pacticipant, should you choose to accept it, is to seek out an efficient way of testing your microservices so that they're easy to reason about, easy to maintain, quick to test, and reliable to deploy without breaking in production. As always, should you or any of your team members be caught doing full deployment end-to-end tests (omg no!), Martin Fowler will disavow any knowledge of your actions. This README will self-destruct in five thousands microseconds.

Good luck brave Pacticipant!

## About YouMDB

YouMDB is made up of two primary services which take the following roles:
* The Movies service API - taking the role of a consumer (it consumes services from the Reviews service)
* The Reviews service API - taking the role of a provider

The consumer depends on the Reviews service API because for example, upon getting a request for a list of movies, it should include each movie's reviews statistics. There may be other interactions where the consumer and provider play together.

## Setup (45min)

Goal: Install all required dependencies to begin the workshop.

* Clone the [consumer repository](#) and the [provider repository](#) to their respective directories
* Install npm modules for each project
* Populate the `.env` variable in the root of the project directory with the broker's details:
```
BROKER_BASE_URL=http://localhost:80
BROKER_USERNAME=guest
BROKER_PASSWORD=guest
```

### Project Review

Goal: Familiarize yourself with the project code-base.

The project has been scaffolded using the [express generator](https://expressjs.com/en/starter/generator.html) tool which is used as a quick web application skeleton to start developing with.

The project has a simple example, yet unrelated to the workshop, for an API endpoint from the original scaffold (`routes/users.js`) to help get you started around ExpressJS. Don't hesitate to jump on to the official ExpressJS Guide for some help around the framework: https://expressjs.com/en/guide/routing.html.

The project structure takes the following shape:

```
.
├1─ app.js
├2─ bin
│   └── www
├3─ package.json
├4─ config
│   ├── index.js
├5─ data
│   ├── movies.js
├6─ routes
│   ├── users.js
│   ├── <new-route-file-goes-here>.js
├7─ controllers
│   ├── <new-controller-file-goes-here>.js
├8─ services
│   ├── <new-service-file-goes-here>.js
├9─ repositories
│   ├── movies.js (or reviews.js for the provider)
├10 __tests__
│   ├── <new-test-spec-file-goes-here>.js
├11 pacts
│   ├── <pact-file-will-be-generated-here>.js
├12 .env
├13 logs
│   ├── pact.log
```

1. `app.js` - the entry point for the Node.js web API which instantiates an ExpressJS web app and exports it
2. `bin/www` - uses the exported ExpressJS web app to bind it to a local host
3. `package.json` - the project's manifest with the relevant npm run commands and dependencies 
4. `config/index.js` - used as a config store for configuration used through-out the project
5. `data/movies.json` - the movies storage represented as a JSON file
6. `routes/*` - the routes file for each endpoint
7. `controllers/*` - controllers that handle the request and response
8. `utils/*` - should contain utilities you use, for example the HTTP client library that queries the provider (Reviews service)
9. `repositories/movies.js` - encapsulates the data access and acts as a mocked in-memory persistent store 
10. `__tests__/*`- the consumer contract test(s) you write will go here
11. `pacts/*` - (consumer-only) the generated pact contract will be placed here upon running a successful pact contract test
12. `.env` - the execution of npm commands or the API service might rely on having configuration in environment variables. This is the place to put them. The file is already added to `.gitignore` but nevertheless be careful not to commit and push it.
13. `pact.log` - logs for the pact testing framework

The recommended layout of the project breaks into several abstractions such as controllers, utils and repositories and it will make it easy for you to follow that pattern and jump from one step to another during the workshop. It is definitely not a recommendation for best practices around projects structure but instead it's an attempt here in being concise and simple. With that said, if you're fairly confident with Node.js development you're more than welcome to follow any other project structures you see fit.

## Step 1: Build Consumer and Provider API endpoints (1 hour)

Requirements:
* The Movies service should expose an API endpoint (hopefully RESTful) that lists movies details.
* A movie's details are for you to come up with. Some hints are: title, genre, plot, year and length of the movie.
* A movie's details should include reviews statistics about each movie as part of the movie's details. Specifically, for each movie it should show how many reviews were written for it, and what is the total average of rating the movie received.
* The Reviews service should implement API endpoints per the contract that was decided upon.

The requirements set out above requires an interaction between the Movies and the Reviews services.
As a consumer that drives the contract, come up with your expectations for the API from the Reviews services. Remember that this is not dictatorship-driven contracts, and as such it is expected that both Movies and Reviews teams collaborate respectfully on the API contract.

### Consumer Development Guidelines
* You probably need to add a new route
* The new route probably needs a new controller
* The new controller needs to find movies, right? There's already a repository created for you with the necessary methods to work on the data. However, you're welcome to make changes as you see fit.
* The Movies service needs a service to interact with the Reviews service and query it for the reviews statistics. You can create this service which is essentially an HTTP client, and place it under `utilities` then use it from the controller or another service to query the Reviews service. Hint: the `axios` HTTP client package is already installed for you.
* Once you created the API how do you know it works? We're not yet doing TDD here so feel comfortable to hack away with curl as needed. P.S. don't forget to start the server, right? `npm run start`.

### Provider Development Guidelines
* As a provider you need to build the relevant endpoint per the contract agreed upon with the consumer.
* Follow the guidelines mentioned for the consumer as building blocks for your API.

Notes:
* You do not need to implement filtering the results
* You do not need to implement pagination for the results

### Consumer Step-by-step
<details><summary>Hint 1: Discuss the API contract with your Provider!</summary>
<p>
You need to query the Reviews service in order to fetch statistics about the movie. How would this data look like?

* What is going to be the endpoint you will call on the provider side?
* What do you expect to receive back as data? What structure of fields?
* Are you going to do a GET or a POST?

</p>
</details>

<details><summary>Hint 2: Scaffold out a quick and simple /movies endpoint</summary>
<p>
Let's get our hands dirty with a simple `/movies` endpoint that just returns all the movies in your database, and doesn't interact with anything else. Just to keep things simple and get the code rolling quick!

#### New router
In [app.js](./app.js) add a new router to handle all the requests to `/movies`:
```js
const moviesRouter = require('./routes/moviesRouter')
app.use('/movies', moviesRouter)
```

#### New route
As the router references above, we need a new route.

Create a new file [routes/moviesRouter.js](./routes/moviesRouter.js) and append it with the following:
```js
const express = require('express')
const router = express.Router()

const MoviesController = require('../controllers/MoviesController')

router.get('/', MoviesController.getAll)

module.exports = router
```

Which declares a new `/movies` endpoint that correlates with HTTP `GET` requests and calls a movie controller

#### New controller
Let's get that new movies controller going!

Create a new file at [controllers/MoviesController.js](./controllers/MoviesController.js) and let's drop the following code snippet into it:

```js
const Repository = require('../repositories/movies')

class MoviesController {
  static async getAll(req, res) {
    try {
      const movies = Repository.findAll()
      return res.status(200).json([...movies.values()])
    } catch (err) {
      return res.status(500).end(err)
    }
  }
}

module.exports = MoviesController
```

In the above we defined a simpler controller that requires the repository, which is our data access layer. Then defined a method that upon receiving a request loads all the movies in the database, and sends them back.

</p>
</details>

<details><summary>Hint 3: Did you test out the /movies endpoint?</summary>
<p>
Let's test your newly `/movies` endpoint to make sure you've got everything working well so far.
If you ping it, how does the data look like?

This is an expected response to make sure you're on track:

```json
[
    {
        "id": "1",
        "title": "The Matrix",
        "plot": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        "year": 1999,
        "length": 136,
        "genre": [
            "action",
            "sci-fi"
        ]
    },
    {
        "id": "2",
        "title": "Interstellar",
        "plot": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "year": 2014,
        "length": 169,
        "genre": [
            "adventure",
            "drama",
            "sci-fi"
        ]
    }
]
```

</p>
</details>


<details><summary>Hint 4: Did you finalize that contract?</summary>
<p>
So what's going on with the API Contract?

Did you the two teams Movies and Reviews sit together to finalize their contract? I sure hope so!

If not, this should be a good time to check-up on that and make sure you've got your expectation straight.

</p>
</details>


<details><summary>Hint 5: Let's build a utility to call the Reviews API service</summary>
<p>
It makes sense that we will have our own dedicated util class that handles interactions with the Reviews API. It's a simple HTTP client that will take the responsibility of all of these interactions.

Create this new [utils/ReviewsClient.js](./utils/ReviewsClient.js) file and append the following:
```js
const axios = require('axios')
const config = require('../config/index')

class ReviewsClient {
  static async getAllMoviesStatistics() {
    const reviewsSummaryEndpoint = `${config.reviewsServiceBaseURL}/stats`
    try {
      const response = await axios.get(reviewsSummaryEndpoint, {
        responseType: 'json'
      })

      return response.data
    } catch (err) {
      return []
    }
  }
}

module.exports = ReviewsClient
```

Let's summarize this short snippet:
* We're loading the app's configuration to get the domain, port and HTTP protocol for the Reviews API service
* We're then defining a method to call the remote API service and return the data as is

</p>
</details>

Does it all go according to plan so far?

Yes, we didn't yet make use of this new ReviewsClient library because we'd like to test it first, and what better way to test it than to create the contract for it?

### Provider Step-by-step
<details><summary>Hint 1: Discuss the API contract with your Consumer!</summary>
<p>
The Movies service, and possibly other consumers, are going to need some data from you. Great stuff! It means some teams need you services and what a better way to start the day than an API design discussion?

Your consumers will probably need to know:
* which endpoint and HTTP methods to hit on your API
* How the data you will respond with is going to look like

Remember, while you own the API it is preferable to understand the needs of your consumers and create a discussion, instead of you dictating the terms of the contract.

Also note that you are not designing an API strictly for the Movies services. Maybe another service will need it too?
</p>
</details>

<details><summary>Hint 2: Propose this API contract to your Consumer</summary>
<p>
The API endpoint is: 
```
/stats
```

Example data structure it will return:
```json
[
    {
        "id": "1",
        "totalReviews": 100,
        "averageRating": 7.5
    },
    {
        "id": "2",
        "totalReviews": 32,
        "averageRating": 8.5
    }
]
```

</p>
</details>

<details><summary>Hint 3: Scaffold out a quick and simple /stats endpoint</summary>

<p>

### New router
Let's start by adding a new router for `/stats` to [app.js](./app.js):

```js
app.use('/stats', statsRouter)
```

### New route
Let's create the relevant router entry at [routes/statsRouter.js](./routes/statsRouter.js), and add the following route definition for it:

```js
const express = require('express')
const router = express.Router()

const StatsController = require('../controllers/StatsController')

router.get('/', StatsController.get)

module.exports = router
```

### New controller
Let's create the relevant controller for `StatsController` which is being referenced in the route.

Create a new file at [controllers/StatsController.js](./controllers/StatsController.js), and add the following controller class and methods to it:

```js
const Repository = require('../repositories/stats')

class StatsController {
  static async get(req, res) {
    try {
      const movieIds = req.query.movieId || []
      const statsSummaryDTO = await Repository.getAll(movieIds)

      if (!statsSummaryDTO.length) {
        return res.status(404).end()
      }

      return res.status(200).json(statsSummaryDTO)

    } catch (err) {
      console.error(err)
      return res.status(500).end()
    }
  }
}

module.exports = StatsController
```

The simple controller:
* Imports and uses the Repository's data access layer to access information about its movie statistics and reviews
* Define the method and call the repository to get all stats based on a query parameter that is also supported here to search for specific movie IDs

</p>
</details>

<details><summary>Hint 4: Do you need to test the API quickly?</summary>
<p>

Start the Node.js API service:

```
$ npm run start
```

And run some API calls to it using `curl` or similar.

</p>
</details>

<details><summary>Hint 5: Not seeing any data in the response for the API? Seed your database</summary>
<p>

Checkout the example database file at [data/seed.json](./data/seed.json) which includes an example dataset for the database. 

Here's a snippet of what it should look like:

```json
{
  "stats": [
    {
      "id": "1",
      "totalReviews": 100,
      "averageRating": 7.5
    },
    {
      "id": "2",
      "totalReviews": 32,
      "averageRating": 8.5
    }
  ],
  "reviews": []
}
```

You can test it out easily by overwriting the empty database at `[db.json](./db.json)` like this:

```
$ cp ./data/seed.json ./db.json
```

And now re-run your Node.js API service again and send another request.

</p>
</details>

## Step 2: Test Consumer and Provider API endpoints

Once we have the service APIs for both consumer and provider endpoints, we can now proceed to contract testing for both of them.

### Consumer Testing

Consumer contract testing is about ensuring that the interface outside to the provider is set as expected and is guarded by the contract, as well as makes sure that internally for the consumer, the consumer code doesn't break and adheres to the contract.

Due to the above, we can deduct that consumer contract testing is valuable when it runs fast as unit tests, and that it unit tests our HTTP client utility that interacts with the provider.

Requirements:
* Create/Update the Reviews HTTP client utility for a contract test as agreed between the consumer and provider.

Consumer Development Guidelines:
* Unit tests can be found in the `__tests__/` directory and are managed by the Jest testing framework.
* For contract testing we use the open source Pact framework (`@pact-foundation/pact`)
* At first, you need to setup the pact server to run as a mock for the Reviews service. Look for instantiating a `new Pact()` as the provider object and then setting it up to listen for interactions, i.e: `provider.setup()`.
* Next, continue to writing a unit test for the Reviews client which defines an interaction, triggers a method on the Reviews client utility and asserts the utility method as well as verify that the interaction has been made successfully. More on how to write a contract unit test below.
* Finally, after all the interactions and expectations been simulated it is required to call `provider.finalize()` which validates all interactions and creates the pact contract.
* To execute your contract testing run `npm run test` just as if you'd run unit tests on other projects.

#### Contract Testing as Unit Tests

The heart of the consumer contract testing is the unit test.
The Reviews client utility is by nature code that interacts with another service, and so its essence is to make calls such as API requests to its provider endpoints, massage responses and return them.

The concept is that we trigger real methods on the consumer endpoints or program code which sends real requests, and this is where the Pact framework comes in and spins up a mock server that catches these requests and responds the way it was programmed.

How does the pact mock service know what interactions to expect and what to reply? We need to set it up.

The beginning of a consumer contract test is therefore to setup an interaction with `provider.addInteraction()` which expects a `state` that defines the interaction, a `withRequest` clause that specifies the request details such as the method used (i.e: GET), the path and any query parameters associated with it. Lastly an interaction includes a `willRespondWith` clause which will specify the expected response from the provider including the HTTP status code, any response headers and finally the body of the response.

Once an interaction has been defined and recorded on the Pact framework's mock server, the next step is to trigger the Reviews client utility to make a real call, assert any response data that was returned, and then assert on `provider.verify()` that the interaction has been met as expected.

#### Setting up

We begin by creating a pact mock server that acts as the provider for the unit tests. To access the Pact object import it from the JavaScript SDK (we will need Matchers later on so that is imported too):

```js
const { Pact, Matchers } = require('@pact-foundation/pact')
```

Next, we need to define the contract parties along with some details to tell the mock provider how to spin up:

```js
provider = new Pact({
  // Setting up the contract
  consumer: 'The consumer name',
  provider: 'The provider name',
  port: 'What port the pact mock provider should listen on for incoming requests?',

  // Details for the mock server 
  // Location for log file to help debug tests
  log: process.cwd() + '/logs/pact.log',
  // Directory to create the contract at
  dir: process.cwd() + '/pacts',
  // Debug logs log level
  logLevel: 'INFO',
  // Specification version
  spec: 2
})
```

Finally, spin it up:

```js
provider.setup()
```

**Note**: all the methods on the provider instance are asynchronous and return a promise.

#### Testing an API Contract

In our use-case we are testing HTTP APIs, so a contract can be enforced on the expected request sent to the provider, and the expected response that the provider sends back. We call this set an interaction.

Interactions take place in a specific state the provider is in. For example, if an API is supposed to return `404 Not Found` then it means it should go into a state of 'no data'. More on that in the provider testing section. For the consumer testing, it is only required to define these states in each interaction.

An interaction there-fore, can be composed of the following:
* `state` - the provider's state for this interaction
* `uponReceiving` - a description of the request
* `withRequest` - an object that defines the contract for the expected request received by the provider 
* `willRespondWith` - an object that defines the contract for the expected response sent by the provider

An example is as follows:

```js
await provider.addInteraction({
  state: 'Has a few dogs',
  uponReceiving: 'a for a list of dogs filtered by dog type',
  withRequest: {
    method: 'GET',
    path: `/dogs`,
    query: {
      'dogType': 'beagle' 
    }
  },
  willRespondWith: {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: [
      {
        'id': '1',
        'name': 'leo'
      }
    ]
  }
})
```

To assert that indeed the interaction was successful the following `verify()` promise call should resolve successfully, otherwise there was an error:

```js
provider.verify()
```

If the client library under test that makes the HTTP API call returns a result, you might also want to assert on that.

**Note**: You probably want to consult the Contract Testing Guidelines and Best Practices for how to properly write contract tests.


#### Creating The Contract

Assuming that all tests passed successfully, we can instruct the pact library to create the pact contract from all the interactions and specifications:

```js
provider.finalize()
```

This happens at the end of all the tests and you can expect to see the generated pact contract in the directory you specified when instantiating and setting up Pact (it should be in `/pacts/` if you haven't changed the suggested configuration). 


### Consumer Step-by-step

Remember that we have our `ReviewsClient` utility? it's working so let's test it!

<details><summary>Hint 6: Let's get started with a bare-bones ReviewsClient.test.js, shall we?</summary>
<p>

Create the contract unit test file at [__tests__/ReviewsClient.test.js](__tests__/ReviewsClient.test.js) and start pouring some basic code into it:

```js
const ReviewsClient = require('../utils/ReviewsClient')
const { Pact, Matchers } = require('@pact-foundation/pact')
```

We're starting out with importing our ReviewsClient which we will test, and we're importing the `Pact` and `Matchers` objects, which:
* Pact - handles instantiating the pact mock service and interacting with it, providing the test harness altogether around the Pact framework and the contract
* Matchers - a helpful utility to help us match response API data structures

</p>
</details>

<details><summary>Hint 7: Declare the contract participants</summary>
<p>

The test is essentially defining the contract when it runs (successfully), and for that we need to define the two-sides of the contract.

When starting to declare the contract, you need to ask yourself:
* What is the name of the consumer service?
* What is the name of the provider service?
* Which port am I accessing the provider service at? I need to know this so I will be able to listen to requests on this port and shoot requests to it.

Add the following to the test:

```js
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
})
```

In this test suite, we are instantiating a new `Pact` service and calling `provider.setup()` which spins up an actual HTTP service on the port we provided that awaits your client requests to be made to it.

We add a catch-all function (`afterAll`) to make sure that once all of the contract assertions has been   successfully verified we also create the actual Pact contract file (in `/pacts` directory as noted in the `beforeAll` initialization)

</p>
</details>

<details><summary>Hint 8: In a new sub test suite what does the interaction look like?</summary>
<p>

Now you want to nest a `describe()` test suite block and start some assertions. One of which is that the reviews client util needs to receive statistics data.

Looking at this test skeleton, ask yourself what does an interaction look like?
* What is the request being sent by the ReviewsClient util? what HTTP method, and endpoint am I hitting on the remote service?
* What does the response being sent by the Reviews API service? What HTTP status code is being received back? what headers should I expect this response to be received with? What does the body of the HTTP message look like?

The two above questions create the contract.

Also to consider:
* Think about what type of matchers can help you to describe the response being sent back.
* What is the name of this request being made? and what state is the reviews service found in this interaction?

```js
describe('Reviews client tests', () => {
    test('should receive movie statistics when requesting all of them', async () => {
      await provider.addInteraction({
        // ... interaction goes here
      })

      // and don't forget you need to assert that it actually worked as expected:
      await expect(provider.verify()).resolves.toBeTruthy()
    })
})
```
</p>
</details>

<details><summary>Hint 9: Solution for above new sub test suite </summary>
<p>

This is how that test should look like:

```js
  describe("Reviews client tests", () => {
    test("should receive movie statistics for specified movies", async () => {
      await provider.addInteraction({
        state: "Has reviews statistics for movie",
        uponReceiving: "a request for all movies stats summary",
        withRequest: {
          method: "GET",
          path: `/stats`
        },
        willRespondWith: {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: Matchers.eachLike({
            id: Matchers.like("1"),
            totalReviews: Matchers.like(100),
            averageRating: Matchers.like(7.5)
          })
        }
      });

      const result = await ReviewsClient.getAllMoviesStatistics()
      expect(result.length).toEqual(1)
      await expect(provider.verify()).resolves.toBeTruthy()
    })
  })
```

</p>
</details>

<details><summary>Hint 10: Run the unit test </summary>
<p>

Go ahead and run the unit tests.

It's easy. Just like any other Jest unit tests you might have written before:
```js
$ npm run test
```

I really hope they passed! $-)

</p>
</details>

<details><summary>Hint 11: Check the contract! </summary>
<p>

Did the unit tests pass? If so this is amazing! You wrote your first API contract.

Take a look at [pacts/](./pacts) directory and see which file exists there now. How does the API contract look like?

</p>
</details>

<details><summary>Hint 12: Are you really only testing positive scenarios? </summary>
<p>

Even though the Reviews API service was built by top-notch engineers, you know that at some point it's going to fail you, right? It might reply with a 500 server error or perhaps a 404 because no stats data exist. If that happens, you should know to expect it. Does a 404 return something in the body? I don't know, but surely you'd want to test that your ReviewsClient utility knows how to handle it and that this is enforced as part of the contract, right?

</p>
</details>

<details><summary>Hint 13: Testing for negative API responses too </summary>
<p>

Add the following test to the reviews test suite:

```js
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
```

</p>
</details>


### Provider Testing

Contract testing for the provider means that the provider needs to ensure that the API it provides adheres to the contract that was previously set.

To test that, the Pact framework in this case is used as a runner that replays the request to a running instance of the provider API, and asserts that the provider API correctly responded with the response that is in the contract.

These requests that the Pact runner sends are the interactions that were defined in the contract, which is a result of consumer contract testing. Interactions also have other metadata on them such as what state they are in. For example, if the provider's API need to respond with a `404 Not Found` when there isn't any data in the database, then in essence it needs to be set in such state where no data exists in the database.

A general flow of how provider testing would take place:
* Contracts already exist
* The provider API service spins up, waiting to handle requests
* A state management API service spins up, waiting to handle requests that tell it how to transition the provider's API service state from one to another - the purpose of this API is to manage interaction states and this is the major part of provider testing
* Pact framework downloads contracts
* Pact framework spins up a runner that replays the request as specified in each interaction, and asserts on the responses it received from the provider
* Pact framework, before replaying each request, makes a call to the state management API to set the required state

Note: providers would be blocked on consumers creating a contract file before they can go on with contract testing on their side.


### Provider Step-by-step

<details><summary>Hint 6: Initializing a Pact verifier for contracts</summary>
<p>

We're setting up Pact. Instantiate a pact verifier instance as below in [__tests__/ReviewsContracts.test.js](./__tests__/ReviewsContracts.test.js):

```js
const { Verifier } = require('@pact-foundation/pact')
const pactVerifier = new Verifier()
```

</p>
</details>

<details><summary>Hint 7: Replaying Contract Testing for the Provider</summary>
<p>

All that the Pact test harness does for the Provider is to download the contracts from the broker for the correct Consumer-Provider pair, and re-play them on a running Provider service.

All this configuration is provided to the Pact test framework which takes care of it.

Add the below snippet to the provider contract tet file [__tests__/ReviewsContracts.test.js](./__tests__/ReviewsContracts.test.js):

```js
const options = {
  provider: 'The provider name',
  providerBaseUrl: 'The base url to hit the provider, for example: http://localhost:8080',
  providerStatesSetupUrl: 'The URL for the states management API that pact verified will hit with each interaction state',
  pactBrokerUrl: 'The URL for the broker from which the pact verifier will pull the contracts',
  // Specific tags to fetch
  tags: ['develop'],
  // Authentication details for the pact broker
  pactBrokerUsername: config.pactBrokerUsername,
  pactBrokerPassword: config.pactBrokerPassword,
  // Send verification results
  publishVerificationResult: true,
  // Set the provider version for the results that
  // will be published to the broker after provider testing
  providerVersion: pkg.version,
}

pactVerifier.verifyProvider(options)
```

Note: calling the `verifyProvider()` method may take some time to complete because it is instantiating the pact runner as well as changing states, and interacting with the provider API all during this method call. As such, to ensure it can complete for the test case, enough time needs to be allotted for the test to run.

Per the note above, you may need to also update the contract test file with the following that informs jest to have a hard timeout of 30 seconds before the test file fails.

```js
// this is required due to the time it takes to spin up the verification process
// such as: d/l the pacts from the broker and running the tests
jest.setTimeout(30000);
```

</p>
</details>

<details><summary>Hint 8: Updating configuration for Pact Broker integration</summary>
<p>

But wait, there's more to it.

Where does all of this configuration come from? What's the reference for the `config` variable specified in the `options` variable in the previous hint?

Add to the top of [__tests__/ReviewsContracts.test.js](./__tests__/ReviewsContracts.test.js) the following modules and files that we need to import to access our configuration and package details.

```js
const path = require('path')
const pkg = require(path.resolve('./package.json'))
const config = require(path.resolve('./config'))
```

</p>
</details>

<details><summary>Hint 9: Configuration library is cool, but where does configuration come from?</summary>
<p>

That's the correct question to ask!

Let's make sure we update the Node.js API service that we built with the relevant configuration values. Update [config/index.js](./config/index.js) with the following:

```js
require('dotenv').config()

const config = {
  provider: 'Reviews',
  providerBaseUrl: 'http://localhost:3002',
  providerStatesSetupUrl: 'http://localhost:4011/setup',
  pactBrokerUrl: process.env.BROKER_BASE_URL || 'http://localhost',
  pactBrokerUsername: process.env.BROKER_USERNAME,
  pactBrokerPassword: process.env.BROKER_PASSWORD,
  pactConsumersTag: process.env.CONSUMERS_CONTRACT_TAG || 'develop'
}

module.exports = config
```

Note: check with the workshop trainer for the actual values of `providerBaseUrl`, `providerStatesSetupUrl` and possibly the rest of the pact broker details such as the username, password, and so on.

</p>
</details>

<details><summary>Hint 10: Setting up Provider States</summary>
<p>

So far we've just worked on creating a Pact-based test harness that downloads contracts and re-plays them against the Node.js API service. However, how does the application knows which data to return for each interaction in the contract? That's where states management comes in.

Note: State management is not something you required to add to your Node.js API service logic. It's a Pact-related state logic and is not expected to be part of your application for a production running service.

The states management service would expose an API endpoint that the pact runner can call and tell it to transition into a specific state.

State is usually managed in web applications using a persistency store like a database, so it makes sense that the states management service can re-use a repository from the provider's API, but there are of course other ways to do it.

In the following, is an example of a small ExpressJS web application that sets up a POST endpoint at `/setup` to handle the pact runner requests to change states.

Let's set this small API that will handle the state in [tests/providerStates.js](./tests/providerStates.js). Note that we chose to put it in the `tests/` folder because it's not an actual test spec file that the test framework (jest in our case) will run. Think of it as a test utility that helps us test. Maybe I should've called it `tests-utils/` ? What can I say, naming things is hard!

So let's scaffold out a quick express skeleton:

```js
const express = require('express')
const logger = require('morgan')
const seed = require('./seed')

const STATES_API_PORT = 4011

const app = express()
const statesRouter = express.Router()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', statesRouter)
```

We've got the statesRouter for state management, let's make use of it with a decent controller:

```js
// Setup endpoint
statesRouter.post('/setup', statesController)

// Setup the controller for the endpoint
async function statesController(req, res) {
  try {
    const state = req.body.state
  
    console.log('Transition to state: ', state)

    switch (state) {
      case 'Has no statistics':
        await seed.deleteAllStats()
        break
      case 'Has reviews statistics for movie':
        await seed.deleteAllStats()
        await seed.populateStats()
        break
    }

    return res.status(200).end()
  } catch (err) {
    console.log(err)
    return res.status(500).end()
  }
}
```

What's the `seed` thing doing?
Well it's just another test util that helps us seed data to the database, depending on the state that the interaction needs to transition into.

Take a look at [tests/seed.js](./tests/seed.js) to see that it's a simple database CRUD interface for us to change database records. It even uses the same database abstraction layer (DAL) that we use in the Node.js API service for our business logic. In other words, The `seed` dependency used here is merely a small wrapper around database commands to clean the database, or insert some records.

Even though `seed.js` is just a test util, do go through it to understand what and why it does so you get this part nailed.

Lastly, add to our state management file the following code to make sure we actually reset the database state to begin with, and then begin listening for HTTP requests:

```js
// Perform any database table migrations if required (this is mostly required for the workshop, and not for real-life use cases). We do database migration first, then listen
seed.tableMigrate()
app.listen(STATES_API_PORT)
```

</p>
</details>

<details><summary>Hint 11: Let's run a provider contract test, shall we?</summary>
<p>

Let's put it all together.

To tie up the whole process together for running provider contract testing:
1. Execute the API service: `npm start`
2. Execute the state management API service: `npm run provider:states`
3. Run provider contract tests: `npm run test`

I advise that you open 3 terminal tabs in the same terminal window to run all the above commands so you can easily see how the pizza fits in. Oh wait, I meant how the puzzle fits in. Apologies, it's my cravings for pizzas!

Important! Only once (1) and (2) are up and ready to process requests should (3) provider contract tests start executing.

</p>
</details>

<details><summary>Hint 12: Something is wrong with the provider tests?</summary>
<p>

If your provider contract tests are failing don't worry, we'll fix it.

Why are they failing?

If they are failing because the Pact framework can't find any contracts to download then that's expected. Did the consumer remember to publish their contracts? Talk to them. Communication is key!

</p>
</details>

## Step 3: Consumer-part to Integrate with the Reviews API service

<details><summary>Hint 14: Let's start integrating a new endpoint for fetching statistics data from the reviews API!</summary>
<p>

Now that we've got something fairly simple going on and we know our way around the data, the routes and the controller let's prepare a new route to list movies with their reviews statistics as well.

Let's call this new route `/movies/stats`, and add it to our [routes/moviesRouter.js](./routes/moviesRouter.js):

```js
router.get('/stats', MoviesController.getWithAllStatsWithFilter)
```

This route makes use of a new static method on the controller named `getWithAllStatsWithFilter` which we also need to add in [controllers/MoviesController.js](./controllers/MoviesController.js):

```js
  static async getWithAllStatsWithFilter(req, res) {
    try {
      const title = req.query.title || ''
      const moviesCollection = Repository.findBy('title', title)

      if (moviesCollection.size <= 0) {
        return res.status(404).end()
      }

      const statsSummary = await ReviewsClient.getAllMoviesStatistics()

      statsSummary.forEach(movieStats => {
        const movie = moviesCollection.get(movieStats.id)
        if (movie) {
          moviesCollection.set(movie.id,
            { ...movie, totalReviews: movieStats.totalReviews, averageRating: movieStats.averageRating })
        }
      })

      return res.status(200).json([...moviesCollection.values()])

    } catch (err) {
      return res.status(500).end()
    }
  }
```

There's quite a bit of logic here, let's explain:
* The controller expects to get a `title` query parameter to filter results based on text search
* For all the results that were matched in the DB we're collecting their movie IDs
* And then using our ReviewsClient utility that calls the Reviews service API and returns the data
* We loop through the returned data and match it to each movie
* Return the result as JSON to the API caller

</p>
</details>

## Step 4: Consumer should publish Contracts to Broker

Once the consumer has contract tests implemented and passing, we can publish them to the broker.

To do so, we make use of the following tools:

* Pact Manifest Generation - by running `npm run pact:generate` in a project that has an existing contract, it will create a manifest file that lists all the contracts and their tags.
* Publish Contracts based on Manifest - by running `npm run pact:publish:dev` the manifest is investigated to figure out which contracts to publish and how to tag them. You should prefix this npm run command with environment variables information to be able to access the broker. The full command should be: `BROKER_BASE_URL=http://localhost BROKER_USERNAME=XYZ BROKER_PASSWORD=XYZ npm run pact:can-i-deploy` replacing XYZ for user and password, as well as the broker base URL based on the details provided by the workshop trainer.

## Step 5: Consumer Deploys to Production

Can the consumer deploy to production? What should you check before doing that? What can break if you deploy?

You can actually test if you're able to deploy to production:

```bash
BROKER_BASE_URL=http://localhost BROKER_USERNAME=XYZ BROKER_PASSWORD=XYZ npm run pact:can-i-deploy
```

So can you deploy?
Explore the broker

## Step 6: Integrate a CI/CD Pipeline

TBD

## References: Suggested APIs

GET /reviews
 - All reviews available such as:
  [
    {
      "id": "1",
      "movieId": "1",
      "headline": "this is a good movie",
      "message": "because it features keanu reeves"
    }
  ]

GET /stats
 - Reviews statistics for all movies
GET /stats?movieIds[]=1&movieIds[]=2
 - Reviews statistics available for bulk movies specified, such as:
  [
   {
     "id": "1",
     "movieId": "1",
     "totalReviews: 100,
     "averageRating": 3.5
   }
 ]


## Movies and Reviews service data points

Example Movies consumer service API endpoint and response prior to integration with the Reviews service: `/movies?title=the%20matrix`
```json
{
  "id": 1,
  "title": "The Matrix",
  "plot": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
  "year": 1999,
  "length": 136,
  "genre": [
    "action",
    "sci-fi"
  ]
}
```

The Reviews service API is a provider for the Movies service and supports the following API endpoint and response to query for movie review statistics information: `/stats?movieId[]=1&movieId[]=2`
```json
[
  {
    "id": "1",
    "totalReviews": 100,
    "averageRating": 7.5
  },
  {
    "id": "2",
    "totalReviews": 32,
    "averageRating": 9
  },
]
```

# Operating the Consumer & Provider

The following sections will describe how to run the consumer and provider API services, how to run their contract tests, publish and verify contracts and how to debug the APIs.

## Consumer

### Run Consumer API

Running the consumer API is as familiar with many other Node.js project, run:

```bash
npm start
```

To enable debugging, and/or database seeding which populates the database with some test data, run:

```bash
DEBUG=1 DB_SEED=1 npm start
```

* The data for the seed is available to inspect and change at `data/movies.json`

To query the API once it's up you can use one of the following examples:

```bash
curl 'http://localhost:3000/movies?title=The%20Matrix'
curl 'http://localhost:3000/movies?title=the%20matrix'
curl 'http://localhost:3000/movies?title=Room404'
```

### Run Consumer Tests

The tests are driven by the Jest JavaScript testing framework and are located in `__tests__`.
Running the consumer tests:

```bash
npm test
```

* The consumer tests are running just like any other unit test file by Jest
* A successful test run will result in a pact contract file generated at the `pacts/` directory.
* In either case of success or failure, the pact framework will keep logs at `logs/pact.log` that can be investigated for further details.

### Can-I-Deploy

At this point you developed a service that integrates with a downstream API provider and you've published a contract with this provider but are you able to deploy? Not necessarily. If the provider doesn't have the API ready in production for you to use if you will release your service will break due to the integration not being available in production or even pre-production environments.

Run the `can-i-deploy` command to check if all relevant contracts have been verified by your provider to ensure your deployment won't fail due to broken contracts:


```bash
BROKER_BASE_URL=http://localhost BROKER_USERNAME=guest BROKER_PASSWORD=guest npm run pact:can-i-deploy
```

### Publish Consumer Contracts


To publish the the contracts to the broker use the following command, and specify the correct broker URL, username, and password as environment variables:

```bash
BROKER_BASE_URL=http://localhost BROKER_USERNAME=guest BROKER_PASSWORD=guest npm run pact:publish:dev
```

Notice that this only publishes contracts that are found to have the `dev` tag in the manifest file (`pact-manifest.json`).


## Provider

Steps to setup provider testing phase:
1. Make available a `/setup` endpoint that will be able to transition the provider to specific steps
2. Make available the provider API service (hint, use `wait-on` package to wait for the API service to be ready for incoming requests)
3. Initiate the contract testing


### Run Provider Tests

```bash
npm run pact:provider:test
```

### Clean-up stale sessions

```bash
npm run pact:provider:cleanup
```

### Seed Data

Seed reviews data

```json
  {
    "id": 1,
    "totalReviews": 100,
    "averageRating": 7.5
  },
```

In the seed data, the `id` is used as a foreign key reference to the movie id.

```bash
DEBUG=1 DB_SEED=1 npm start
```

```bash
curl 'http://localhost:3002/stats?movieId\[\]=4&movieId\[\]=3'
```


# Pact.js Matching Rules Cheatsheet

The following matching options are exposed by Pact's Matchers object:

```js
const { Matchers } = require("@pact-foundation/pact")
const { eachLike, like, term, iso8601DateTimeWithMillis } = Matchers
```

To further explain them:
* `eachLike` is used to specify an array of items to match, where the items can be anything from a primitive type like a boolean, string or number, to more complex objects like other arrays or objects.
* `like` is used to match a single data type (primitive or complex)
* `term` is used as a regex to match string data types
* `iso8601DateTimeWithMillis` is helpful to match ISO date types, such as: 2018-01-01T00:00:00.000Z

## Request Matching (query)

* Request matching will fail if the request were made with query params, or body payloads (i.e: POST or PUT requests) that don't exist in the interaction.
* Request matching will not fail if a header is missing from the request to allow easy interop with servers and proxies without brittle specification of each header property


## Response Matching (body)

* Response matching will not fail if the server responded with more data keys than was set in the expectation. This follows Postel's law for loosely integrated services.

The body payload matching depends on the content type:
* JSON matching happens when the content type is properly set to JSON content type. In JSON matching, the order of keys in the payload matters.
* String matching happens when JSON is not specified.
* Form matching happens when the content type is set to `application/x-www-form-urlencoded`, upon which the expectation can be specified as either a string of key/value pairs or an object. The order of keys in the object doesn't matter for asserting the correctness of a match.


## Matching fixed values

- Use case:

In the `withRequest` clause, specify query parameters that filter for a title and a genre.
```
http://localhost/movies?title="the%20matrix"&genre="action"&genre="sci-fi"
```

- Matcher Example:

```js
query: { 
  "title": "The Matrix",
  "genre": [
    "action",
    "sci-fi"
  ]
}
```

Note: when matching an array with a fixed expected value like the above example the order of values matters for the genre query parameter.

## Multiple array bracket items

- Use-case:

Match URL query params that specify multi-value fields with a bracket annotation:
```
http://localhost/reviews?itemId[]=1&itemId[]=2
```

- Matcher Example:

Matcher used in the `withRequest` clause:
```js
query: {
  'movieId[]': Matchers.eachLike('1')
}
```

The `eachLike` matcher has another parameter that can be set to express that a minimum number of items is expected to match, such as:

```js
query: {
  'movieId[]': Matchers.eachLike('1', {min: 100})
}
```

## Match opaque types

- Use-case:

Matching expected type of the payload with a generated static value for the mocked provider:
```js
body: [
  {
    'id': '1231',
    'totalReviews': 100,
    'averageRating': 7.5
  }
]
```

- Matcher Example:

Matcher used in the `willRespondWith` clause:
```js
body: [
  {
    'id': Matchers.like('1'),
    'totalReviews': Matchers.like(100),
    'averageRating': Matchers.like(7.5)
  }
]
```


## Match string types based on regular expressions

- Use-case:

Matching expected type of the payload with a generated static value for the mocked provider:
```js
body: [
  {
    'id': '1231',
    'totalReviews': 100,
    'averageRating': 7.5
  }
]
```

- Matcher Example:

Matcher used in the `willRespondWith` clause:
```js
body: [
  {
    'id': Matchers.like('1'),
    'totalReviews': Matchers.like(100),
    'averageRating': Matchers.like(7.5)
  }
]
```


# Contract Testing Guidelines and Best Practices

TBD
