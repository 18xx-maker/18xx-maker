let games = require("@18xx-maker/games");

if (process.env.REACT_APP_ONLY_PUBLIC_GAMES) {
  games = games.public;
} else {
  games = games.games;
}

{{#each games}}
games["{{id}}"] = {
  id: "{{id}}",
  slug: "{{slug}}",
  file: "{{file}}",
  local: true,
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
