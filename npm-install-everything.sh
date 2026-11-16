#!/usr/bin/env bash

echo 'Installing node modules in...'
echo 'Backend... '
echo
cd pa*/ba* && [ "$(npm i)" ] && echo 'Done' || echo 'Failed'

echo 'Installing node modules in...'
echo 'Frontend... '
echo
cd ../f* && [ "$(npm i)" ] && echo 'Done' || echo 'Failed'

# Leave user back where they started
cd ../..

