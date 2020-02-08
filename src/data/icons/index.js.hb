{{#each svgs}}
import icon_{{#if group}}{{group}}_{{/if}}{{object}}, { ReactComponent as icon_{{#if group}}{{group}}_{{/if}}{{object}}_Component } from "./{{file}}";
{{/each}}

export default {
{{#each svgs}}
  "{{#if group}}{{group}}/{{/if}}{{name}}": {
    name: "{{name}}",
{{#if group}}    group: "{{group}}",
{{/if}}
    src: icon_{{#if group}}{{group}}_{{/if}}{{object}},
    Component: icon_{{#if group}}{{group}}_{{/if}}{{object}}_Component
  }{{#unless @last}},{{/unless}}
{{/each}}
};
