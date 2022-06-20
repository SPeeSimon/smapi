# REST API for the scenemodels database

<img src="./FlightGear_logo.svg" alt="FlightGear logo" height="22"></img>
![V2.0](https://img.shields.io/static/v1?label=Scenemodel+API&message=V2.0&color=blue&logo=OpenAPI+Initiative)


## Description

This app contains REST endpoints to the FlightGear scenemodels database.


## Development

Create a `.env` file from `.env.template` and fill in the properties.


## Installation

```bash
$ npm install
```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

When the app is running, you can view a list of endpoints at http://localhost:3000/api/

The OpenAPI model is available in JSON format at http://localhost:3000/api-json


## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Build with

- [Class-validator](https://github.com/typestack/class-validator) | Library for validation
- [Eta](https://eta.js.org/) | Embedded template engine
- [Nestjs](https://nestjs.com/) | Framework for Node.js server-side applications
- [Passport](http://www.passportjs.org/) | Authentication library
- [PostgreSQL](https://www.postgresql.org/) | Database server
- [TypeORM](https://typeorm.io/) | ORM library for Node.js
- [Typescript](https://www.typescriptlang.org/) | The Programming language used for this application
