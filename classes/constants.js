const REQUEST_TIMEOUT_MS = 10_000;

function createTimeoutSignal() {
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
	}

	return undefined;
}

const HEADERS = {
	headers: {
		'User-Agent': process.env.USER_AGENT
	},
	get signal() {
		// Return a new timeout signal for each request.
		return createTimeoutSignal();
	}
};

module.exports = {
	HEADERS,
	REQUEST_TIMEOUT_MS
};