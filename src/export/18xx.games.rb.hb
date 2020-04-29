# File original exported from 18xx-maker: https://www.18xx-maker.com/
# rubocop:disable Lint/RedundantCopDisableDirective, Layout/LineLength
# frozen_string_literal: true

require_relative '../bank'
require_relative '../company'
require_relative '../corporation'
require_relative '../game/base'
require_relative '../hex'
require_relative '../tile'

module Engine
  module Game
    class G{{name}} < Base
      {{#if game.bankPerPlayer}}
      BANK_CASH = {
        {{#each game.bank}}
        {{player}} => {{bank}},
        {{/each}}
      }.freeze
      {{else}}
      BANK_CASH = {{game.bank}}
      {{/if}}

      CURRENCY_FORMAT_STR = '{{{game.currency}}}'

      {{#if game.certLimitPerPlayer}}
      CERT_LIMIT = {
        {{#each game.certLimit}}
        {{player}} => {{certLimit}},
        {{/each}}
      }.freeze
      {{else}}
      CERT_LIMIT = {{game.certLimit}}
      {{/if}}

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

      # rubocop:disable Style/RedundantCapitalW, Lint/EmptyExpression, Lint/EmptyInterpolation
      MARKET = [
        {{#each game.market}}
        %W[{{#each row}}{{{value}}}{{#unless @last}} {{/unless}}{{/each}}],
        {{/each}}
      ].freeze
      # rubocop:enable Style/RedundantCapitalW, Lint/EmptyExpression, Lint/EmptyInterpolation

      {{#if game.startingCashPerPlayer}}
      STARTING_CASH = {
        {{#each game.startingCash}}
        {{player}} => {{startingCash}},
        {{/each}}
      }.freeze
      {{else}}
      STARTING_CASH = {{game.startingCash}}
      {{/if}}

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
          value: {{{value}}},
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

# rubocop:enable Lint/RedundantCopDisableDirective, Layout/LineLength
