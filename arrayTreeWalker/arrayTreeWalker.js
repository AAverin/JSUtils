/**
* @Author Anton Averin, a.a.averin@gmail.com
*
* Array-tree walker
*
* Walks an array-tree with structure like:
* [Root,
*      [SubRoot1]
*      ...
*      [SubRoot5,
*          SubRoot5_element1, SubRoot5_element2, ... , SubRoot5_elementN]
*      ...
*      [SubRootN]
* ]
*
* callback function should return true to continue and false to stop processing
* if there are elements for current subRoot, this branch will come as 'true' only if some of the elements is true
* if branch consists only of 1 element - it will get the result of that element
*
* This walker can be used to traverse tree of regexps
*
* @param array array to walk through
* @param callback function to call for each element
* @param options additional options (not used for now)
*
* @return [result, [index]]. result is true|false depending on the results of callback function called for each element
*      index is an array of indexes where function returned true.
*/
var walkArrayTree = function(array, callback, options) {
        var processFunction = function(index, el) {
            var result;
            if (el instanceof Array) {
                result = walkArrayTree(el, callback, options);
            } else {
                result = [callback(index, el), []];
            }
            var _return = [result[0], result[1]];
            return _return;
        };

        var isFinished = false;
        var finishIndex = [];
        var proceed = array.length == 1;
        for (var i = 0, len = array.length; i < len && !isFinished; i++)  {
            var result =  processFunction(i, array[i]);
            if (i === 0 && !proceed) {
                if (result[0]) {
                    proceed = true;
                } else {
                    break;
                }
            } else {
                if (proceed) {
                    isFinished |= result[0];
                    if (result[1].length > 0) {
                        finishIndex.concat(result[1]);
                    }
                    if (isFinished) {
                        finishIndex.push(i - 1);
                    }
                }
            }
        }
        return [isFinished, finishIndex];
    };
