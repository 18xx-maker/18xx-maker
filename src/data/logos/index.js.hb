import { lazy } from "react";

export default {
{{#each svgs}}
  "{{#if group}}{{group}}/{{/if}}{{name}}": {
    name: "{{name}}",
{{#if group}}    group: "{{group}}",
{{/if}}
    Component: lazy(() => import(/* webpackChunkName: "{{{file}}}" */"./{{{dir}}}/{{{name}}}"))
  }{{#unless @last}},{{/unless}}
{{/each}}
};
