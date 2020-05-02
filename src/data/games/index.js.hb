{{#each games}}
import game_{{#if group}}{{group}}_{{/if}}{{object}} from "./{{file}}";
{{/each}}

let games = require("@18xx-maker/games");

if (process.env.REACT_APP_ONLY_PUBLIC_GAMES) {
  games = games.public;
} else {
  games = games.games;
}

{{#each games}}
games["{{name}}"] = game_{{#if group}}{{group}}_{{/if}}{{object}};
{{/each}}

export default games;
