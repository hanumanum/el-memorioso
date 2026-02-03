# el-memorioso

Lightweight, configurable async memoization utilities for Node.js.

el-memorioso provides a tiny wrapper to memoize async functions and a small collection of "forget" policies that control when cached entries get removed. It is deliberately minimal and easy to drop into existing projects.

## Features

- Memoize async functions (promises) with a simple wrapper
- Pluggable forget / eviction policies:
  - never forget
  - forget entries older than a TTL
  - forget when the number of entries exceeds a limit (LRU-like by creation time)
  - forget a specific key
- Very small and dependency-free

## Quick install

Install directly from GitHub:

```bash
npm install git+https://github.com/hanumanum/el-memorioso.git
```

If you are using the source in-repo (local), require from `./src`.

## Usage

CommonJS example:

```javascript
// require the library files (adjust path if installed as a package)
const { withMemoAsync } = require('./src/memorize');
const forgetIf = require('./src/forget');

// Example async function to memoize
async function fetchData(id) {
  // simulate async work
  await new Promise((r) => setTimeout(r, 100));
  return { id, ts: Date.now() };
}

// Wrap with memoization and a TTL-based forget policy (5 seconds)
const fetchMemo = withMemoAsync(fetchData, forgetIf.liveMoreThan(5000));

(async () => {
  const a = await fetchMemo(1); // calls fetchData
  const b = await fetchMemo(1); // returns cached result
  console.log(a, b);
})();
```

## API

- withMemoAsync(fn, forgetFn)
  - fn: async function (...args) => value
  - forgetFn: (memoKey, memo, memoMap) => boolean
  - Returns: async function that memoizes calls by argument signature.
  - Notes:
    - Arguments are converted to a memo key using JSON.stringify on each arg joined with `_:_`.
    - The wrapper will call the provided `forgetFn` for each stored memo entry before checking/returning cache.
    - The wrapper logs DEBUG messages. (See source for the DEBUG flag.)

- forgetIf (object)
  - never(): never forgets (always returns a predicate that is false)
  - liveMoreThan(ttl): forget entries older than ttl (ms)
  - keyIs(key): forget entries whose memo key equals `key`
  - numberExceeded(count): when number of entries > count, forget the oldest entries so count is respected

See the source files for exact behavior and examples.

## Source reference

I inspected the implementation files to derive this README (may be incomplete). You can view the code in the repository:

```javascript name=src/memorize.js url=https://github.com/hanumanum/el-memorioso/blob/bd2c65d02878d353181dee758d6345ccfeff7957/src/memorize.js#L1-L49
const DEBUG = true;
const LoggerActionsENUM = {
    FORGET: 'FORGET',
    RECALL: 'RECALL',
    REMEMBER: 'REMEMBER',
};


const argsToKey = (...args) => args.map(JSON.stringify).join('_:_');

const dataLogger = (memoKey, memoMap, action) => DEBUG
    && console.log(`${action} ${memoKey} ${JSON.stringify(memoMap[memoKey])}, count ${Object.keys(memoMap).length}`);

const withMemoAsync = (fn, forgetFn) => {
    let memoMap = {};

    return async (...args) => {
        const memoKey = argsToKey(...args);

        for (const _memoKey in memoMap) {
            if (forgetFn(_memoKey, memoMap[_memoKey], memoMap)) {
                dataLogger(_memoKey, memoMap, LoggerActionsENUM.FORGET);
                delete memoMap[_memoKey];
            }
        }

        if (memoMap[memoKey]) {
            dataLogger(memoKey, memoMap, LoggerActionsENUM.RECALL);
            return memoMap[memoKey].value;
        }

        try {

            const value = await fn(...args)
            memoMap[memoKey] = {
                value,
                created: Date.now(),
            }

            dataLogger(memoKey, memoMap, LoggerActionsENUM.REMEMBER);
            return value;
        } catch (e) {
            console.error(e)
            return null;
        }
    }
};

module.exports = { withMemoAsync };
```

```javascript name=src/forget.js url=https://github.com/hanumanum/el-memorioso/blob/bd2c65d02878d353181dee758d6345ccfeff7957/src/forget.js#L1-L19
const forgetIf = {
    never: () => () => false,
    liveMoreThan: (ttl) => (memoKey, memo, memoMap) => (Date.now() - memo.created) > ttl,
    keyIs: (key) => (memoKey, memo, memoMap) => memoKey === key,
    numberExceeded: (count) => (memoKey, memo, memoMap) => {
        if (Object.keys(memoMap).length > count) {
            const oldKeys = Object
                .keys(memoMap)
                .sort((a, b) => memoMap[a].created - memoMap[b].created)
                .slice(0, Object.keys(memoMap).length + 1 - count)
                .map((obj) => (obj));

            return oldKeys.includes(memoKey);
        }
        return false;
    },
};

module.exports = forgetIf;
```

To view more files or results in the GitHub UI (search results may be incomplete):  
https://github.com/hanumanum/el-memorioso/search?q=&type=code

## Development & tests

- There is a `src/` and a `tests/` directory in the repository. Run tests with the repository's test script if present:

```bash
npm test
```

If no test script is configured, add one to your package.json or run tests directly using your chosen runner.

## Contributing

Contributions, bug reports, and improvements are welcome.

- Add tests for new behavior
- Keep the API minimal and backwards-compatible
- Open a PR describing the change

## License

No license file detected in the repository. Add a LICENSE file (e.g., MIT) if you want to make the project open-source.
