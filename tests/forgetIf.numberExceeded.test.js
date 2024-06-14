const forgetIf = require('../src/forget');
const { withMemoAsync } = require('../src/memorize');


const asyncDataGetter = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ id, id: Math.pow(id, 4)});
        }, 1000);
    });
}

const memoizedFn = withMemoAsync(asyncDataGetter, forgetIf.numberExceeded(5));


(async () => {
    const arr = [1, 2, 5, 3, 4, 5, 6, 7, 8, 1, 1, 9, 10, 1, 1 , 5, 11, 12];
    for(let i = 0; i < arr.length; i++) {
        await memoizedFn(arr[i]);
    }
})();