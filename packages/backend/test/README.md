# Live API Integration Tests

<<<<<<< HEAD
###### tl;dr: read IntegrationTests/Live/read.test.ts
=======
###### tl;dr: read test/api/read.test.ts
>>>>>>> main

### Contents

* Overview
  * Purpose
  * Running The Tests
* Developers
  * Test Authorship Quickstart Guide
* Notes
* DevOps + CI / CD

## Overview

### Purpose

This directory is intended to house tests that test the API... 
> from the user's perspective,     
> against the live-running, deployed API,    
> on Blue Stone. 

So far this has not yet been done completely. To offer an API service in good faith, we need a live status on the state of the API

API integration testing lets us reliably communicate with certainty to users the services we have to offer. 

### Running The Tests

Tests will be run by:
```
cd packages/backend
npm run api_integration_tests
```

ps: tab-to-autocomplete works with npm run, so one can type
```
npm run a
```

And then press tab. 


## Developers

### Integration Test Authorship Quickstart Guide

This file is intended to be a living, breathing, walkthrough example. In it, you'll find extensive commentary that will help get you started. 
```
backend/test/IntegrationTests/Live/read.test.ts
```
For a more comprehensive, less formal thought process walkthrough, take a look at the comments and scaffolding approach in this particular commit:
* https://github.com/gosqasorg/asset-provenance-tracking/blob/b6e9cfcc5d8818b53ef247991e8a80fb0bddc30c/packages/backend/test/api/read.test.ts

Note also that structural placeholders have been set up: we have the core test files we need, and each file has a template with placeholders for the tests we'll create as well as a brief guide on structure. 

### Framework: Orientation

Our test framework is Vitest. A beginner's guide is [here](https://betterstack.com/community/guides/testing/vitest-explained/#step-2-writing-your-first-test). Sections 2, 3, 6, and 8 are useful. The official docs beginner's guide is [here](https://vitest.dev/guide/#writing-tests). The main docs are [here](https://vitest.dev/api/).

## Notes

### Preexisting Integration Tests

Some progress has already been made. This suite may eventually in some way cooperate with or draw from
```
packages/backend/test/IntegrationTests/Local/integrationTests.ts
```

### Wiki

We have a wiki. On the API. It may be of some use. 
* https://github.com/gosqasorg/asset-provenance-tracking/wiki/Calling-the-GOSQAS-backend


## DevOps: CI / CD

These tests are integrated into our CI/CD pipeline, configured here:
```
asset-provenance-tracking/.github/workflows/be_on_push.yml
```

Note: Be mindful that running tests on GitHub servers uses up credits. Use them as needed: that's why we have the credits. And keep in mind the same tests can be run locally by cd packages/backend && npm run test

# PS

![API test screenshot](./readme_fig_1.png)
