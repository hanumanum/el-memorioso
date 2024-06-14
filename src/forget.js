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