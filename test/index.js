const numTrial = 10;
const numElements = [1, 10, 50, 100, 200];
const numUsers = [2, 5, 10, 20, 50];

require('./addElementsTest')({ testCases: numElements, numTrial });
require('./deleteElementsTest')({ testCases: numElements, numTrial });
require('./updateElementsTest')({ testCases: numElements, numTrial });
require('./concurrentEditTest')({ testCases: numUsers, numTrial });
