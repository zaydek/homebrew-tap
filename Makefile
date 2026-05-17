.PHONY: requirements test

requirements:
	@node requirements/ops/run-all.mjs

test: requirements
