{{#each games}}
import game_{{#if group}}{{group}}_{{/if}}{{object}} from "./{{file}}";
{{/each}}

let all_games = {
{{#each games}}
  "{{name}}": game_{{#if group}}{{group}}_{{/if}}{{object}}{{#unless @last}},{{/unless}}
{{/each}}
};

let public_games = {
{{#each public_games}}
  "{{name}}": game_{{#if group}}{{group}}_{{/if}}{{object}}{{#unless @last}},{{/unless}}
{{/each}}
};

export default (process.env.REACT_APP_ONLY_PUBLIC_GAMES ? public_games : all_games);
