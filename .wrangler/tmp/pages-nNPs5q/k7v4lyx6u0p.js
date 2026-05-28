// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/static/*",
    "/manifest.json",
    "/robots.txt",
    "/favicon.ico"
  ],
  enablePrerenderFlag: true
};

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/harshbanker/Desktop/GitHub/shop/.wrangler/tmp/pages-nNPs5q/functionsWorker-0.9128964515497255.mjs";
import { isRoutingRuleMatch } from "/Users/harshbanker/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/harshbanker/Desktop/GitHub/shop/.wrangler/tmp/pages-nNPs5q/functionsWorker-0.9128964515497255.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=k7v4lyx6u0p.js.map
