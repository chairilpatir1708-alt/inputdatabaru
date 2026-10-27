"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-generator-function";
exports.ids = ["vendor-chunks/is-generator-function"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-generator-function/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/is-generator-function/index.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar callBound = __webpack_require__(/*! call-bound */ \"(ssr)/./node_modules/call-bound/index.js\");\nvar safeRegexTest = __webpack_require__(/*! safe-regex-test */ \"(ssr)/./node_modules/safe-regex-test/index.js\");\nvar isFnRegex = safeRegexTest(/^\\s*(?:function)?\\*/);\nvar hasToStringTag = __webpack_require__(/*! has-tostringtag/shams */ \"(ssr)/./node_modules/has-tostringtag/shams.js\")();\nvar getProto = __webpack_require__(/*! get-proto */ \"(ssr)/./node_modules/get-proto/index.js\");\n\nvar toStr = callBound('Object.prototype.toString');\nvar fnToStr = callBound('Function.prototype.toString');\n\nvar getGeneratorFunction = __webpack_require__(/*! generator-function */ \"(ssr)/./node_modules/generator-function/index.js\");\n\n/** @type {import('.')} */\nmodule.exports = function isGeneratorFunction(fn) {\n\tif (typeof fn !== 'function') {\n\t\treturn false;\n\t}\n\tif (isFnRegex(fnToStr(fn))) {\n\t\treturn true;\n\t}\n\tif (!hasToStringTag) {\n\t\tvar str = toStr(fn);\n\t\treturn str === '[object GeneratorFunction]';\n\t}\n\tif (!getProto) {\n\t\treturn false;\n\t}\n\tvar GeneratorFunction = getGeneratorFunction();\n\treturn GeneratorFunction && getProto(fn) === GeneratorFunction.prototype;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtZ2VuZXJhdG9yLWZ1bmN0aW9uL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGdCQUFnQixtQkFBTyxDQUFDLDREQUFZO0FBQ3BDLG9CQUFvQixtQkFBTyxDQUFDLHNFQUFpQjtBQUM3QztBQUNBLHFCQUFxQixtQkFBTyxDQUFDLDRFQUF1QjtBQUNwRCxlQUFlLG1CQUFPLENBQUMsMERBQVc7O0FBRWxDO0FBQ0E7O0FBRUEsMkJBQTJCLG1CQUFPLENBQUMsNEVBQW9COztBQUV2RCxXQUFXLGFBQWE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxTLkYuSy5DLkFcXGlucHV0ZGF0YWJhcnVcXG5vZGVfbW9kdWxlc1xcaXMtZ2VuZXJhdG9yLWZ1bmN0aW9uXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsQm91bmQgPSByZXF1aXJlKCdjYWxsLWJvdW5kJyk7XG52YXIgc2FmZVJlZ2V4VGVzdCA9IHJlcXVpcmUoJ3NhZmUtcmVnZXgtdGVzdCcpO1xudmFyIGlzRm5SZWdleCA9IHNhZmVSZWdleFRlc3QoL15cXHMqKD86ZnVuY3Rpb24pP1xcKi8pO1xudmFyIGhhc1RvU3RyaW5nVGFnID0gcmVxdWlyZSgnaGFzLXRvc3RyaW5ndGFnL3NoYW1zJykoKTtcbnZhciBnZXRQcm90byA9IHJlcXVpcmUoJ2dldC1wcm90bycpO1xuXG52YXIgdG9TdHIgPSBjYWxsQm91bmQoJ09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcnKTtcbnZhciBmblRvU3RyID0gY2FsbEJvdW5kKCdGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcnKTtcblxudmFyIGdldEdlbmVyYXRvckZ1bmN0aW9uID0gcmVxdWlyZSgnZ2VuZXJhdG9yLWZ1bmN0aW9uJyk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzR2VuZXJhdG9yRnVuY3Rpb24oZm4pIHtcblx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoaXNGblJlZ2V4KGZuVG9TdHIoZm4pKSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmICghaGFzVG9TdHJpbmdUYWcpIHtcblx0XHR2YXIgc3RyID0gdG9TdHIoZm4pO1xuXHRcdHJldHVybiBzdHIgPT09ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXSc7XG5cdH1cblx0aWYgKCFnZXRQcm90bykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHR2YXIgR2VuZXJhdG9yRnVuY3Rpb24gPSBnZXRHZW5lcmF0b3JGdW5jdGlvbigpO1xuXHRyZXR1cm4gR2VuZXJhdG9yRnVuY3Rpb24gJiYgZ2V0UHJvdG8oZm4pID09PSBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGU7XG59O1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-generator-function/index.js\n");

/***/ })

};
;