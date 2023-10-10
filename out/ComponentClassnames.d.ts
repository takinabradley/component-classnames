import CustomCSS from "./CustomCSS";
import type { CSSProperties, CustomCSSConfig } from "./CustomCSS";
interface CCNController {
    classNames: (componentName: string) => string;
    styles: (componentName: string) => CSSProperties;
}
declare function use(...configs: CustomCSSConfig[]): CCNController;
export type { CustomCSS };
declare const _default: {
    use: typeof use;
};
export default _default;
