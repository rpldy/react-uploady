# Contributing

Contributions by the community are more than welcome.  
By contributing to React-Uploady, you agree to abide by the [code of conduct](CODE_OF_CONDUCT.md).

## Reporting Issues and Asking Questions

Before opening an issue, please search the [issue tracker][tracker] to make sure your issue hasn't already been reported.

## Development

Visit the [Issue tracker][tracker] to find a list of open issues that need attention.

Fork, then clone the repo:
```
git clone https://github.com/your-username/react-uploady.git
```

### Building

```bash
$ yarn install
```
then:

```bash
$ yarn build
```

### Testing

In order to verify there are no issues, run:
```
$ yarn test 
```

this will run flow, lint, jest 

each one of these has a corresponding script to run separately.

### Storybook

to run SB locally, run 

```bash
$ yarn start 
```

### E2E

Another verification requires is to running the e2e suite:

```bash
$ yarn e2e 
```

Which runs all existing tests on top of the storybook 

If you've made any changes. make sure to test them in the storybook.

### New Features

Please open an issue with a proposal for a new feature or refactoring before starting on the work. 
We don't want you to waste your efforts on a pull request that we won't want to accept.

New UI features should have a new story added.

New stories and functionality should be tested in the cypress (e2e) suite.  

New API features or props must be added to the type definitions of the changed package.

## Submitting Changes

* Open a new issue in the [Issue tracker][tracker]
* Fork the repo.
* Create a new feature branch based off the `master` branch.
* Make sure all unit tests, flow, lint and e2e tests pass locally.
* Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.
Keeping changes small will make it easier to review and accept.

All PRs opened will be considered but final decision is reserved for the project maintainers.  

**Thank you for contributing!**

[tracker]: https://github.com/rpldy/react-uploady/issues