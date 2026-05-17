.PHONY: requirements live-e2e test

requirements:
	@node requirements/ops/run-all.mjs

live-e2e:
	@ADDERALL_LIVE_E2E=1 node requirements/acceptance/homebrew-live-e2e.acceptance.mjs

test: requirements
