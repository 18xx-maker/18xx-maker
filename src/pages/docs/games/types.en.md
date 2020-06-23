# Share and Token Types

You can now add shares and tokens to all of you companies in a game file without
copy and pasting the same definition to each company.

## Usage

Instead of defining tokens and shares for a company you can replace the
definition with a single string. This string needs to be a reference to one of
the fields of the `shareTypes` or `tokenTypes` object defined in the file.

The definitions in `shareTypes` and `tokenTypes` work exactly as they did before
as part of each company.

Special behavior exists for the names `default` and `minor`. If you define a
token or share type named `minor` and have companies with `"minor": true`
defined, than xxMaker will use those definitions for any minor that doesn't have
it's own share or tokens definition. If you define a token or share type named
`default` than xxMaker will use those definitions for any company that was
included in the `minor` definitions, and that didn't define it's own definitions
for shares or tokens.

## Examples

Please look at how it's defined in 1830.
