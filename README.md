Freshlinks checks that the relative links between your markdown pages are correct, and helps keep them that way! You can use Freshlinks as a GitHub Action, where it will annotate your PR and tell you exactly where the mistaken link is. Or, you can use it from the command-line, installed with NPM.

## GitHub Action

<img src="img/freshlinks-github-action-screenshot.png" alt="Freshlinks GitHub Action screenshot" width="800"/>

The Freshlinks GitHub Action can be installed with adding the following workflow file:

### `.github/workflows/freshlinks.yml`

```yml
name: Freshlinks
on: [push]

jobs:
  freshlinks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Freshlinks
        uses: reiddraper/freshlinks@v0.0.2
        with:
          # put in a glob pattern to find the
          # files you want Freshlinks to scan
          glob: 'docs/**/*.md'
```

## Command-line or Node project

Freshlinks can be used programmatically as a library, or from the command-line:

```shell
npm install --save-dev freshlinks
```

Freshlinks will scan any files provided as arguments, so you'll frequently use it like:

```
$ git ls-files '*.md' | xargs npx freshlinks
```

Freshlinks has pretty colorized output:

<img src="img/freshlinks-cli-output.png" alt="Freshlinks command-line output" width="600"/>

## [LICENSE](LICENSE)

Freshlinks is released under the MIT License.

## Changelog

View the [changelog](CHANGELOG.md) to follow new releases.