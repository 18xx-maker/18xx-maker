# frozen_string_literal: true

require_relative '../bank'
require_relative '../company'
require_relative '../corporation'
require_relative '../game/base'
require_relative '../hex'
require_relative '../tile'

module Engine
  module Game
    class G{{filename}} < Base
      BANK_CASH = {{game.bank}}

      CURRENCY_FORMAT_STR = '{{{game.currency}}}'

      CERT_LIMIT = {
        {{#each game.cert_limit}}
        {{player}} => {{limit}},
        {{! 2 => 25, }}
        {{! 3 => 19, }}
        {{! 4 => 14, }}
        {{! 5 => 12, }}
        {{! 6 => 11, }}
        {{/each}}
      }.freeze

      HEXES = {
        {{#each game.hexes}}
        {{{color}}}: {
          {{#each hexes}}
          %w[{{#each hexes as |hex|}}{{hex}}{{#unless @last}} {{/unless}}{{/each}}] => '{{{encoding}}}',
          {{/each}}
        }{{#unless @last}},{{/unless}}
        {{/each}}
      }.freeze

      TILES = {
        {{#each game.tiles}}
        '{{id}}' => {{quantity}},
        {{/each}}
      }.freeze

      LOCATION_NAMES = {
        {{#each game.location_names}}
        '{{coord}}' => '{{{name}}}',
        {{/each}}
      }.freeze

      MARKET = [
        {{#each game.market}}
        %W[{{#each row}}{{{value}}}{{#unless @last}} {{/unless}}{{/each}}],
        {{/each}}
      ].freeze

      STARTING_CASH = {
        {{#each game.starting_cash}}
        {{player}} => {{cash}},
        {{/each}}
      }.freeze

      PHASES = [
        {{#each game.phases}}
        Phase::{{{name}}},
        {{/each}}
      ].freeze

      TRAINS = [
        {{#each game.trains}}
        {
          name: '{{{name}}}',
          distance: {{#if distance}}{{distance}},{{else}}999, #TODO{{/if}}
          price: {{price}},
          {{#if rusts_on}}
          rusts_on: '{{rusts_on}}',
          {{/if}}
          num: {{num}},
          {{#if available_on}}
          available_on: '{{{available_on}}}',
          {{/if}}
          {{#if discount}}
          discount: {
            {{#each discount}}
            '{{{name}}}' => {{discount}},
            {{/each}}
          }
          {{/if}}
        }{{#unless @last}},{{/unless}}
        {{/each}}
      ].freeze

      COMPANIES = [
        {{#each game.privates}}
        {
          name: '{{{name}}}',
          value: {{value}},
          revenue: {{revenue}},
          sym: '{{{abbrev}}}',
          desc: '{{{description}}}',
          abilities: [
            # TODO
          ],
        },
        {{/each}}
      ].freeze

      CORPORATIONS = [
        {{#each game.companies}}
        {
          sym: '{{{abbrev}}}',
          logo: {{#if logo}}'{{{logo}}}',{{else}}'', # TODO{{/if}}
          name: '{{{name}}}',
          tokens: [{{#each tokens}}{{label}}{{#unless @last}}, {{/unless}}{{/each}}],
          float_percent: {{#if floatPercent}}{{floatPercent}},{{else}}60, # TODO{{/if}}
          {{#if home}}
          coordinates: '{{home}}',
          {{/if}}
          color: '{{color}}'
        }{{#unless @last}},{{/unless}}
        {{/each}}
      ].freeze
    end
  end
end
