LINT = $(PWD)/node_modules/.bin/eslint
JEST = $(PWD)/node_modules/.bin/jest
BABEL = $(PWD)/node_modules/.bin/babel

DIR ?= src

install:
	yarn install
	yarn global add jsinspect
	yarn add lru-cache redis --peer

build:
	$(BABEL) src -d . --copy-files

watch:
	$(BABEL) -w src -d . --copy-files

lint:
	$(LINT) --format 'node_modules/eslint-friendly-formatter' --fix src/*.js

test: lint
	$(JEST) --env=jsdom --detectOpenHandles --coverage --runInBand --forceExit $(DIR)

dev:
	node --inspect-brk=0.0.0.0:9229 $(JEST) --env=jsdom --detectOpenHandles -o --watch --runInBand --forceExit $(DIR)

publish: build
	npm publish

.PHONY: test lint dev build watch publish install
