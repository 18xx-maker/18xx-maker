{{#each themes}}
import theme_{{object}} from "./{{file}}";
{{/each}}

const themes = {
{{#each themes}}
  "{{name}}": theme_{{object}}{{#unless @last}},{{/unless}}
{{/each}}
};

export default themes;
