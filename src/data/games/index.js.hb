let games = {};

{{#each games}}
games["{{id}}"] = {
  id: "{{id}}",
  slug: "{{slug}}",
  file: "{{file}}",
  title: "{{title}}",
  {{#if subtitle}}
  subtitle: "{{subtitle}}",
  {{/if}}
  designer: "{{designer}}",
  {{#if publisher}}
  publisher: "{{publisher}}",
  {{/if}}
  {{#if group}}
  group: "{{group}}",
  {{/if}}
  {{#if minPlayers}}
  minPlayers: {{minPlayers}},
  {{/if}}
  {{#if maxPlayers}}
  maxPlayers: {{maxPlayers}},
  {{/if}}
};
{{/each}}

export default games;
