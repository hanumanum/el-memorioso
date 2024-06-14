const forgetIf = require('../src/forget');
const { withMemoAsync } = require('../src/memorize');


const asyncDataGetter = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ id, id: Math.pow(id, 4) });
        }, 1000);
    });
}

const memoizedFn = withMemoAsync(asyncDataGetter, forgetIf.liveMoreThan(10000));

(async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 3, 4, 5, 3, 4, 5, 8, 9, 15, 15, 15, 16, 15];
    for (let i = 0; i < arr.length; i++) {
        await memoizedFn(arr[i]);
    }
})();