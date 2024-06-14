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