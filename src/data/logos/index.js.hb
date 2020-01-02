{{#each svgs}}
import {{#if group}}{{group}}_{{/if}}{{name}}, { ReactComponent as {{#if group}}{{group}}_{{/if}}{{name}}_Component } from "./{{file}}";
{{/each}}

export default {
{{#each svgs}}
  "{{#if group}}{{group}}/{{/if}}{{name}}": {
    name: "{{name}}",
{{#if group}}    group: "{{group}}",
{{/if}}
    src: {{#if group}}{{group}}_{{/if}}{{name}},
    Component: {{#if group}}{{group}}_{{/if}}{{name}}_Component
  }{{#unless @last}},{{/unless}}
{{/each}}
};
