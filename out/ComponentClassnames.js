var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/classnames/dedupe.js
var require_dedupe = __commonJS((exports, module) => {
  /*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  */
  (function() {
    var classNames = function() {
      function StorageObject() {
      }
      StorageObject.prototype = Object.create(null);
      function _parseArray(resultSet, array) {
        var length = array.length;
        for (var i = 0;i < length; ++i) {
          _parse(resultSet, array[i]);
        }
      }
      var hasOwn = {}.hasOwnProperty;
      function _parseNumber(resultSet, num) {
        resultSet[num] = true;
      }
      function _parseObject(resultSet, object) {
        if (object.toString !== Object.prototype.toString && !object.toString.toString().includes("[native code]")) {
          resultSet[object.toString()] = true;
          return;
        }
        for (var k in object) {
          if (hasOwn.call(object, k)) {
            resultSet[k] = !!object[k];
          }
        }
      }
      var SPACE = /\s+/;
      function _parseString(resultSet, str) {
        var array = str.split(SPACE);
        var length = array.length;
        for (var i = 0;i < length; ++i) {
          resultSet[array[i]] = true;
        }
      }
      function _parse(resultSet, arg) {
        if (!arg)
          return;
        var argType = typeof arg;
        if (argType === "string") {
          _parseString(resultSet, arg);
        } else if (Array.isArray(arg)) {
          _parseArray(resultSet, arg);
        } else if (argType === "object") {
          _parseObject(resultSet, arg);
        } else if (argType === "number") {
          _parseNumber(resultSet, arg);
        }
      }
      function _classNames() {
        var len = arguments.length;
        var args = Array(len);
        for (var i = 0;i < len; i++) {
          args[i] = arguments[i];
        }
        var classSet = new StorageObject;
        _parseArray(classSet, args);
        var list = [];
        for (var k in classSet) {
          if (classSet[k]) {
            list.push(k);
          }
        }
        return list.join(" ");
      }
      return _classNames;
    }();
    if (typeof module !== "undefined" && exports) {
      classNames.default = classNames;
      module.exports = classNames;
    } else if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
      define("classnames", [], function() {
        return classNames;
      });
    } else {
      window.classNames = classNames;
    }
  })();
});

// src/CustomCSS.ts
class CustomCSS {
  unstyled;
  stylesheets;
  classNames;
  styles;
  modifiers;
  constructor(config) {
    this.unstyled = config?.unstyled || false;
    this.stylesheets = config?.stylesheets || [];
    this.classNames = config?.classNames || {};
    this.styles = config?.styles || {};
    this.modifiers = config?.modifiers || {};
  }
}
var CustomCSS_default = CustomCSS;

// src/mergeCustomCSS.ts
var mergeClassNames = function(customCSS1, customCSS2) {
  const mergedClassNames = {};
  for (const key in customCSS2.classNames) {
    const originalClassNames = customCSS1.classNames[key] || [];
    const newClassNames = customCSS2.classNames[key];
    mergedClassNames[key] = [...originalClassNames, ...newClassNames];
  }
  return { ...customCSS1.classNames, ...mergedClassNames };
};
var mergeStyles = function(customCSS1, customCSS2) {
  const mergedStyles = {};
  for (const key in customCSS2.styles) {
    const oldStyles = customCSS1.styles[key] || {};
    const newStyles = customCSS2.styles[key];
    mergedStyles[key] = { ...oldStyles, ...newStyles };
  }
  return { ...customCSS1.styles, ...mergedStyles };
};
var mergeModifiers = function(customCSS1, customCSS2) {
  const mergedModifiers = {};
  for (const key in customCSS2.modifiers) {
    const originalModifiers = customCSS1.modifiers[key] || [];
    const newModifiers = customCSS2.modifiers[key];
    mergedModifiers[key] = [...originalModifiers, ...newModifiers];
  }
  return { ...customCSS1.modifiers, ...mergedModifiers };
};
function mergeCustomCSS(...customCSSObjs) {
  return customCSSObjs.reduce((merged, current) => {
    if (current.unstyled)
      return { ...current };
    merged.unstyled = current.unstyled;
    merged.stylesheets = [...merged.stylesheets, ...current.stylesheets];
    merged.classNames = mergeClassNames(merged, current);
    merged.styles = mergeStyles(merged, current);
    merged.modifiers = mergeModifiers(merged, current);
    return { ...merged };
  }, new CustomCSS_default);
}

// src/ComponentClassnames.ts
var dedupe = __toESM(require_dedupe(), 1);
var getClassNamesFromStylesheets = function(customCSS, elementName) {
  const classNames = [];
  customCSS.stylesheets.forEach((stylesheet) => {
    if (stylesheet[elementName])
      classNames.push(stylesheet[elementName]);
  });
  return classNames;
};
var getClassNamesFromModifiers = function(customCSS, elementName) {
  const classNames = [];
  if (customCSS.modifiers[elementName]) {
    customCSS.modifiers[elementName].map((mod) => {
      const fullModifier = `${elementName}--${mod}`;
      const styleSheetModifiers = getClassNamesFromStylesheets(customCSS, fullModifier);
      const classNameModifiers = customCSS.classNames[fullModifier] || [];
      classNames.push(...styleSheetModifiers, ...classNameModifiers);
    });
  }
  return classNames;
};
var use = function(...configs) {
  let mergedCustomCSS;
  if (configs.length === 0) {
    mergedCustomCSS = new CustomCSS_default;
  } else {
    const customCSSObjs = configs.map((config) => new CustomCSS_default(config));
    mergedCustomCSS = mergeCustomCSS(...customCSSObjs);
  }
  const classNames = (elementName) => {
    const cssModuleNames = getClassNamesFromStylesheets(mergedCustomCSS, elementName);
    const classNameNames = mergedCustomCSS.classNames[elementName] || [];
    const modifierNames = getClassNamesFromModifiers(mergedCustomCSS, elementName);
    const allNames = dedupe.default([...cssModuleNames, ...classNameNames, ...modifierNames]);
    return allNames;
  };
  const styles = (elementName) => mergedCustomCSS.styles[elementName] || {};
  const useName = (elementName) => ({
    className: classNames(elementName),
    style: styles(elementName)
  });
  return {
    classNames,
    styles,
    useName
  };
};
var ComponentClassnames_default = {
  use
};
export {
  ComponentClassnames_default as default
};
