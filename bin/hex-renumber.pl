#!/usr/bin/perl
#
# % perl hex-renumber.pl [-l] <fileB >fileA
#   -l to increment the letter instead of the number
#
# Check its work before you do anything rash like overwriting your original.
# Seriously, USE WITH CARE.
#
# This makes some effort to make sure it's only applied to the "map" section, but
# it's not a lot.  It also can't decrement since it's taking advantage of the "magic
# increment" to do the letter-side work.  There is no matching "magic decrement".
#

use Getopt::Std;

# This has all the good intentions of caring about command line options,
# but it really only cares about -l or not.
%options = ();
getopts("ln", \%options);

# For the magic increment to work, it needs to do the increment
# outside of the regex's arithmetic context.
sub succ {
  $str = @_[0];
  return ++$str;
}

while (<>) {
  # look for the start of the "map" section
  if (/"map"\w*:/) {
    $inmap = 1;
  }

  if ($inmap) {
    if ($options{l}) {
      # increment the letter in "A12" to "B12"
      $_ =~ s/"([A-Z]+)(\d+)"/'"' . succ($1) . $2 . '"'/ge;
    } else {
      # increment the number in "A12" to "A13"
      # note that the increment operator ++ on either side of the $2 doesn't work here
      $_ =~ s/"([A-Z]+)(\d+)"/'"' . $1 . ($2+1) . '"'/ge;
    }

    # crudely try and determine where the "map" block ends
    # functional only if you:
    #   a) don't put the previous block's closing curly brace on the same line as "map":
    #   b) don't put the next block's open curly brace on the same line as closing brace of
    #      the "map" block
    $left_cb_count = ($_ =~ tr/{//);
    $right_cb_count = ($_ =~ tr/}//);
    $cb_count += $left_cb_count - $right_cb_count;

    if ($cb_count < 1) {
      $inmap = 0;
    }
  }
  print;
}
