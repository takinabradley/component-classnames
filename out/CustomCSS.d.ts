import classNames from "classnames/dedupe";
import type { CSSProperties } from "react";
export type { CSSProperties };
export type CSSModuleClasses = {
    readonly [key: string]: string;
};
export interface ModifiersMap {
    [key: string]: string[];
}
export interface ClassNameMap {
    [key: string]: classNames.ArgumentArray;
}
export interface CSSPropertiesMap {
    [key: string]: CSSProperties;
}
export interface CustomCSSConfig {
    unstyled?: boolean;
    stylesheets?: CSSModuleClasses[];
    classNames?: ClassNameMap;
    styles?: CSSPropertiesMap;
    modifiers?: ModifiersMap;
}
declare class CustomCSS {
    unstyled: boolean;
    stylesheets: CSSModuleClasses[];
    classNames: ClassNameMap;
    styles: CSSPropertiesMap;
    modifiers: ModifiersMap;
    constructor(config?: CustomCSSConfig);
}
export default CustomCSS;
