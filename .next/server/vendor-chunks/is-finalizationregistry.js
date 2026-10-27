"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-finalizationregistry";
exports.ids = ["vendor-chunks/is-finalizationregistry"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-finalizationregistry/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/is-finalizationregistry/index.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar callBound = __webpack_require__(/*! call-bound */ \"(ssr)/./node_modules/call-bound/index.js\");\n\n/** @type {undefined | ((value: ThisParameterType<typeof FinalizationRegistry.prototype.register>, ...args: Parameters<typeof FinalizationRegistry.prototype.register>) => ReturnType<typeof FinalizationRegistry.prototype.register>)} */\nvar $register = callBound('FinalizationRegistry.prototype.register', true);\n\n/** @type {import('.')} */\nmodule.exports = $register\n\t? function isFinalizationRegistry(value) {\n\t\tif (!value || typeof value !== 'object') {\n\t\t\treturn false;\n\t\t}\n\t\ttry {\n\t\t\t// @ts-expect-error TS can't figure out that it's always truthy here\n\t\t\t$register(value, {}, null);\n\t\t\treturn true;\n\t\t} catch (e) {\n\t\t\treturn false;\n\t\t}\n\t}\n\t// @ts-ignore unused var\n\t: function isFinalizationRegistry(value) { // eslint-disable-line no-unused-vars\n\t\treturn false;\n\t};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtZmluYWxpemF0aW9ucmVnaXN0cnkvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsNERBQVk7O0FBRXBDLFdBQVcsNk5BQTZOO0FBQ3hPOztBQUVBLFdBQVcsYUFBYTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1QztBQUNBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXFMuRi5LLkMuQVxcaW5wdXRkYXRhYmFydVxcbm9kZV9tb2R1bGVzXFxpcy1maW5hbGl6YXRpb25yZWdpc3RyeVxcaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY2FsbEJvdW5kID0gcmVxdWlyZSgnY2FsbC1ib3VuZCcpO1xuXG4vKiogQHR5cGUge3VuZGVmaW5lZCB8ICgodmFsdWU6IFRoaXNQYXJhbWV0ZXJUeXBlPHR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeS5wcm90b3R5cGUucmVnaXN0ZXI+LCAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeS5wcm90b3R5cGUucmVnaXN0ZXI+KSA9PiBSZXR1cm5UeXBlPHR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeS5wcm90b3R5cGUucmVnaXN0ZXI+KX0gKi9cbnZhciAkcmVnaXN0ZXIgPSBjYWxsQm91bmQoJ0ZpbmFsaXphdGlvblJlZ2lzdHJ5LnByb3RvdHlwZS5yZWdpc3RlcicsIHRydWUpO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLicpfSAqL1xubW9kdWxlLmV4cG9ydHMgPSAkcmVnaXN0ZXJcblx0PyBmdW5jdGlvbiBpc0ZpbmFsaXphdGlvblJlZ2lzdHJ5KHZhbHVlKSB7XG5cdFx0aWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yIFRTIGNhbid0IGZpZ3VyZSBvdXQgdGhhdCBpdCdzIGFsd2F5cyB0cnV0aHkgaGVyZVxuXHRcdFx0JHJlZ2lzdGVyKHZhbHVlLCB7fSwgbnVsbCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdC8vIEB0cy1pZ25vcmUgdW51c2VkIHZhclxuXHQ6IGZ1bmN0aW9uIGlzRmluYWxpemF0aW9uUmVnaXN0cnkodmFsdWUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-finalizationregistry/index.js\n");

/***/ })

};
;