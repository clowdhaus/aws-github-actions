SHELL = /usr/bin/env bash

.PHONY: help
.DEFAULT_GOAL := help

help:
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

ACTIONS := $(shell find . -maxdepth 1 -type d -not -path '*/\.*' | cut -c 3-)

##@ Development

.PHONY: compile
compile: ## Compile action module into a single file, together with all its dependencies, gcc-style using zeit/ncc
	@for ACTION in $(ACTIONS); do \
		pushd $$ACTION && \
		yarn && \
		ncc build index.ts -m && \
		popd ; \
	done;

.PHONY: clean
clean: ## Clean up generated files
	@for ACTION in $(ACTIONS); do \
		pushd $$ACTION && \
		rm -rf dist node_modules && \
		popd ; \
	done;