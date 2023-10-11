import CustomCSS from "./CustomCSS";
import type { CSSProperties, CustomCSSConfig } from "./CustomCSS";
interface CCNController {
    classNames: (elementname: string) => string;
    styles: (elementname: string) => CSSProperties;
    useName: (elementname: string) => {
        className: string;
        style: CSSProperties;
    };
}
declare function use(...configs: CustomCSSConfig[]): CCNController;
export type { CustomCSS };
declare const _default: {
    use: typeof use;
};
export default _default;
