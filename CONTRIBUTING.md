# Contributing to OpenSCG

First off, thank you for considering contributing to OpenSCG! It's people like you that make open source such a great community. We welcome any and all contributions, from simple bug reports to new feature implementations.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Styleguides](#styleguides)
  - [Git Commit Messages](#git-commit-messages)
  - [Python Styleguide](#python-styleguide)
  - [TypeScript/React Styleguide](#typescriptreact-styleguide)
- [Development Setup](#development-setup)

## Code of Conduct

This project and everyone participating in it is governed by the [OpenSCG Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [team@heartscan.app](mailto:team@heartscan.app). (Note: `CODE_OF_CONDUCT.md` to be added).

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/HeartScan/openSCG/issues).

If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/HeartScan/openSCG/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please open an issue to discuss it. This allows us to coordinate our efforts and prevent duplication of work.

1.  **Search existing issues** to see if your idea has been discussed.
2.  If not, **create a new issue**, clearly outlining your proposal. Explain why the enhancement would be useful and what problem it solves.

### Your First Code Contribution

Unsure where to begin contributing to OpenSCG? You can start by looking through these `good first issue` and `help wanted` issues:

- **Good first issues** - issues which should only require a few lines of code, and a test or two.
- **Help wanted issues** - issues which should be a bit more involved than `good first issue` issues.

### Pull Requests

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes.
5.  Make sure your code lints.
6.  Issue that pull request!

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.

### Python Styleguide

- We follow [PEP 8](https://www.python.org/dev/peps/pep-0008/).
- We use `black` for code formatting and `isort` for import sorting. Please run these tools before committing your code.

### TypeScript/React Styleguide

- We use `prettier` for code formatting.
- Follow the standard conventions used in the existing codebase.

## Development Setup

Please see `docs/DEV_SETUP.md` for instructions on how to set up your development environment.
