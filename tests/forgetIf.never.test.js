const forgetIf = require('../src/forget');
const { withMemoAsync } = require('../src/memorize');


const asyncDataGetter = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ id, id: Math.pow(id, 4) });
        }, 1000);
    });
}

const memoizedFn = withMemoAsync(asyncDataGetter, forgetIf.never());


(async () => {
    const arr = Array(10000).fill(10000).map(() => Math.round(Math.random() * 100));
    for (let i = 0; i < arr.length; i++) {
        await memoizedFn(arr[i]);
    }
})();