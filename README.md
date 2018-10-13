## Prerequisites

* Git
* Node.js (>=8) and npm (>=5.5)
* Internet access for the broker, npm and GitHub access
* Basic understanding of JavaScript and Node.js/ExpressJS

## Setup

* Clone the [consumer repository](#) and the [provider repository](#) to their respective directories
* Install npm modules
* Populate the `.env` variable in the root of the project directory with the broker's:
```
BROKER_BASE_URL=http://localhost:80
BROKER_USERNAME=guest
BROKER_PASSWORD=guest
```

## Setting the stage

Our consumer is a Movies service API
Our provider is a Reviews service API

The consumer depends on the Reviews service API because upon getting a request for a list of movies, it should include each movie's reviews statistics, in specifically:
* total reviews that were made on the title
* the aggregated average rating of all the reviews made on the title

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
npm run pact:can-i-deploy
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