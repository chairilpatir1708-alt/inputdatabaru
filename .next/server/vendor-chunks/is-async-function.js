"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-async-function";
exports.ids = ["vendor-chunks/is-async-function"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-async-function/index.js":
/*!*************************************************!*\
  !*** ./node_modules/is-async-function/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar callBound = __webpack_require__(/*! call-bound */ \"(ssr)/./node_modules/call-bound/index.js\");\nvar safeRegexTest = __webpack_require__(/*! safe-regex-test */ \"(ssr)/./node_modules/safe-regex-test/index.js\");\n\nvar toStr = callBound('Object.prototype.toString');\nvar fnToStr = callBound('Function.prototype.toString');\nvar isFnRegex = safeRegexTest(/^\\s*async(?:\\s+function(?:\\s+|\\()|\\s*\\()/);\n\nvar hasToStringTag = __webpack_require__(/*! has-tostringtag/shams */ \"(ssr)/./node_modules/has-tostringtag/shams.js\")();\nvar getProto = __webpack_require__(/*! get-proto */ \"(ssr)/./node_modules/get-proto/index.js\");\n\nvar getAsyncFunc = __webpack_require__(/*! async-function */ \"(ssr)/./node_modules/async-function/index.js\");\n\n/** @type {import('.')} */\nmodule.exports = function isAsyncFunction(fn) {\n\tif (typeof fn !== 'function') {\n\t\treturn false;\n\t}\n\tif (isFnRegex(fnToStr(fn))) {\n\t\treturn true;\n\t}\n\tif (!hasToStringTag) {\n\t\tvar str = toStr(fn);\n\t\treturn str === '[object AsyncFunction]';\n\t}\n\tif (!getProto) {\n\t\treturn false;\n\t}\n\tvar asyncFunc = getAsyncFunc();\n\treturn asyncFunc && asyncFunc.prototype === getProto(fn);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtYXN5bmMtZnVuY3Rpb24vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsNERBQVk7QUFDcEMsb0JBQW9CLG1CQUFPLENBQUMsc0VBQWlCOztBQUU3QztBQUNBO0FBQ0E7O0FBRUEscUJBQXFCLG1CQUFPLENBQUMsNEVBQXVCO0FBQ3BELGVBQWUsbUJBQU8sQ0FBQywwREFBVzs7QUFFbEMsbUJBQW1CLG1CQUFPLENBQUMsb0VBQWdCOztBQUUzQyxXQUFXLGFBQWE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxTLkYuSy5DLkFcXGlucHV0ZGF0YWJhcnVcXG5vZGVfbW9kdWxlc1xcaXMtYXN5bmMtZnVuY3Rpb25cXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGNhbGxCb3VuZCA9IHJlcXVpcmUoJ2NhbGwtYm91bmQnKTtcbnZhciBzYWZlUmVnZXhUZXN0ID0gcmVxdWlyZSgnc2FmZS1yZWdleC10ZXN0Jyk7XG5cbnZhciB0b1N0ciA9IGNhbGxCb3VuZCgnT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZycpO1xudmFyIGZuVG9TdHIgPSBjYWxsQm91bmQoJ0Z1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZycpO1xudmFyIGlzRm5SZWdleCA9IHNhZmVSZWdleFRlc3QoL15cXHMqYXN5bmMoPzpcXHMrZnVuY3Rpb24oPzpcXHMrfFxcKCl8XFxzKlxcKCkvKTtcblxudmFyIGhhc1RvU3RyaW5nVGFnID0gcmVxdWlyZSgnaGFzLXRvc3RyaW5ndGFnL3NoYW1zJykoKTtcbnZhciBnZXRQcm90byA9IHJlcXVpcmUoJ2dldC1wcm90bycpO1xuXG52YXIgZ2V0QXN5bmNGdW5jID0gcmVxdWlyZSgnYXN5bmMtZnVuY3Rpb24nKTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4nKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBc3luY0Z1bmN0aW9uKGZuKSB7XG5cdGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKGlzRm5SZWdleChmblRvU3RyKGZuKSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAoIWhhc1RvU3RyaW5nVGFnKSB7XG5cdFx0dmFyIHN0ciA9IHRvU3RyKGZuKTtcblx0XHRyZXR1cm4gc3RyID09PSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXSc7XG5cdH1cblx0aWYgKCFnZXRQcm90bykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHR2YXIgYXN5bmNGdW5jID0gZ2V0QXN5bmNGdW5jKCk7XG5cdHJldHVybiBhc3luY0Z1bmMgJiYgYXN5bmNGdW5jLnByb3RvdHlwZSA9PT0gZ2V0UHJvdG8oZm4pO1xufTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-async-function/index.js\n");

/***/ })

};
;