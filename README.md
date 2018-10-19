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

Consumer Development Guidelines:
* You probably need to add a new route
* The new route probably needs a new controller
* The new controller needs to find movies, right? There's already a repository created for you with the necessary methods to work on the data. However, you're welcome to make changes as you see fit.
* The Movies service needs a service to interact with the Reviews service and query it for the reviews statistics. You can create this service which is essentially an HTTP client, and place it under `utilities` then use it from the controller or another service to query the Reviews service. Hint: the `axios` HTTP client package is already installed for you.
* Once you created the API how do you know it works? We're not yet doing TDD here so feel comfortable to hack away with curl as needed. P.S. don't forget to start the server, right? `npm run start`.

Provider Development Guidelines:
* As a provider you need to build the relevant endpoint per the contract agreed upon with the consumer.
* Follow the guidelines mentioned for the consumer as building blocks for your API.

Notes:
* You do not need to implement filtering the results
* You do not need to implement pagination for the results

**Bonus points** if you have time to add a filter to the movies API which retrieve only movies with specific title


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

#### Setting up 

Instantiate a pact verifier instance.

```js
const { Verifier } = require('@pact-foundation/pact')
const pactVerifier = new Verifier()
```

#### Setting up Provider States

The states management service would expose an API endpoint that the pact runner can call and tell it to transition into a specific state.

State is usually managed in web applications using a persistency store like a database, so it makes sense that the states management service can re-use a repository from the provider's API, but there are of course other ways to do it.

In the following, is an example of a small ExpressJS web application that sets up a POST endpoint at `/setup` to handle the pact runner requests to change states.

```js
// Setup endpoint
statesRouter.post('/setup', statesController)

// Perform any database table migrations if required (this is mostly required for the workshop, and not for real-life use cases)
await seed.tableMigrate()

// Setup the controller for the endpoint
async function statesController(req, res) {
  try {
    const state = req.body.state
    
    switch (state) {
      case 'Has no dogs':
        // Delete all the dogs entry in the database so that the 
        // API will respond with a 404 Not Found
        await seed.clearAllData()
        break
      case 'Has a few dogs':
        // Delete all dogs and insert just a few entries to the database
        await seed.clearAllData()
        await seed.populateData()
        break
    }

    return res.status(200).end()
  } catch (err) {
    console.log(err)
    return res.status(500).end()
  }
}
```

The `seed` dependency used here is merely a small wrapper around database commands to clean the database, or insert some records.

#### Replaying Contract Testing for the Provider

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

#### Putting it all together

To tie up the whole process together for running provider contract testing:
1. Execute the API service (i.e: `npm start`)
2. Execute the state management API service (i.e: `npm run provider:states`)
3. Run provider contract tests

Only once (1) and (2) are up and ready to process requests should (3) provider contract tests start executing.

## Step 3: Publish/Retrieve Contracts from Broker

TBD


## Step 4: Deploy to Production

TBD

Can you deploy?
Explore the broker

## Step 4: Integrate a CI/CD Pipeline

TBD




## TBD ???

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

The Reviews service API is a provider for the Movies service and supports the following API endpoint and response to query for movie reviews information: `/reviews?movieId[]=1&movieId[]=2`
```json
[
  {
    "id": "1",
    "total": 100,
    "averageRating": 7.5
  },
  {
    "id": "2",
    "total": 32,
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
    "total": 100,
    "averageRating": 7.5
  },
```

In the seed data, the `id` is used as a foreign key reference to the movie id.

```bash
DEBUG=1 DB_SEED=1 npm start
```

```bash
curl 'http://localhost:3001/reviews?movieId\[\]=4&movieId\[\]=3'
```


# Pact.js Matching Rules Cheatsheet

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

## Match opaque types

- Use-case:

Matching expected type of the payload with a generated static value for the mocked provider:
```js
body: [
  {
    'id': '1231',
    'total': 100,
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
    'total': Matchers.like(100),
    'averageRating': Matchers.like(7.5)
  }
]
```

# Contract Testing Guidelines and Best Practices

TBD