{{#each svgs}}
import logo_{{#if group}}{{group}}_{{/if}}{{name}}, { ReactComponent as logo_{{#if group}}{{group}}_{{/if}}{{name}}_Component } from "./{{file}}";
{{/each}}

export default {
{{#each svgs}}
  "{{#if group}}{{group}}/{{/if}}{{name}}": {
    name: "{{name}}",
{{#if group}}    group: "{{group}}",
{{/if}}
    src: logo_{{#if group}}{{group}}_{{/if}}{{name}},
    Component: logo_{{#if group}}{{group}}_{{/if}}{{name}}_Component
  }{{#unless @last}},{{/unless}}
{{/each}}
};
