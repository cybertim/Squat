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
    input: "./test/myapp.ts",
    output: {
        dir: "test",
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

// deno run --unstable --allow-all https://deno.land/x/denopack/cli.ts -c mod.ts
export default config;