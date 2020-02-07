{{#each svgs}}
import icon_{{#if group}}{{group}}_{{/if}}{{name}}, { ReactComponent as icon_{{#if group}}{{group}}_{{/if}}{{name}}_Component } from "./{{file}}";
{{/each}}

export default {
{{#each svgs}}
  "{{#if group}}{{group}}/{{/if}}{{name}}": {
    name: "{{name}}",
{{#if group}}    group: "{{group}}",
{{/if}}
    src: icon_{{#if group}}{{group}}_{{/if}}{{name}},
    Component: icon_{{#if group}}{{group}}_{{/if}}{{name}}_Component
  }{{#unless @last}},{{/unless}}
{{/each}}
};
