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
        # TODO
        {{! white: { }}
        {{!   %w[B5 C8 D3 D9 E8 H3 I8 I10 J3] => 'blank', }}
        {{!   %w[B11 G10 I12 J5 J9] => 'town', }}
        {{!   %w[A10 C10 E2 F3 G4 G12 H7 I2 J11 K8] => 'city', }}
        {{!   %w[A8 B9 C6 D5 D7 E4 E6 F5 F7 G6 G8 H9 H11 H13] => 'mtn80', }}
        {{!   %w[K6] => 'wtr80', }}
        {{!   %w[H5 I6] => 'mtn+wtr80', }}
        {{!   %w[I4] => 'c=r:0;l=H;u=c:80', }}
        {{! }, }}
        {{! yellow: { }}
        {{!   %w[C4] => 'c=r:20;p=a:2,b:_0', }}
        {{!   %w[K4] => 'c=r:30;p=a:0,b:_0;p=a:1,b:_0;p=a:2,b:_0;l=T', }}
        {{! }, }}
        {{! green: { }}
        {{!   %w[F9] => 'c=r:30,s:2;p=a:2,b:_0;p=a:3,b:_0;p=a:4,b:_0;p=a:5,b:_0;l=K;u=c:80', }}
        {{! }, }}
        {{! gray: { }}
        {{!   %w[B3] => 't=r:20;p=a:0,b:_0;p=a:_0,b:5', }}
        {{!   %w[B7] => 'c=r:40,s:2;p=a:1,b:_0;p=a:3,b:_0;p=a:5,b:_0', }}
        {{!   %w[G14] => 't=r:20;p=a:3,b:_0;p=a:_0,b:4', # TODO?: reference B3 tile, but with rotation }}
        {{!   %w[J7] => 'p=a:1,b:5', }}
        {{! }, }}
        {{! red: { }}
        {{!   %w[F1] => 'o=r:yellow_30|brown_60|diesel_100;p=a:0,b:_0;p=a:1,b:_0', }}
        {{!   %w[J1] => 'o=r:yellow_20|brown_40|diesel_80;p=a:0,b:_0;p=a:1,b:_0', }}
        {{!   %w[L7] => 'o=r:yellow_20|brown_40|diesel_80;p=a:1,b:_0;p=a:2,b:_0', }}
        {{! } }}
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
