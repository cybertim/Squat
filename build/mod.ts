import {
    htmlTemplate,
    pluginCssBundle as css,
    pluginHtmlBundle as html,
    pluginServe as serve,
    pluginTerserTransform as terser,
    useCache,
} from "https://deno.land/x/denopack/mod.ts";

import type {
    RollupOptions,
    TemplateOpts,
} from "https://deno.land/x/denopack/mod.ts";

const config: RollupOptions = {
    input: "../target/myapp.ts",
    output: {
        dir: "../target",
        sourcemap: false
    },
    plugins: [
        ...useCache({
            compilerOptions: {
                lib: ["dom"]
            }
        }),
        terser({
            module: true,
            compress: true,
            mangle: true,
        })]
}

export default config;