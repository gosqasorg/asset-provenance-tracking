#!/usr/bin/env bash

echo 'Installing node modules in...'
echo -n 'Backend... '
cd ../pa*/ba* && [ "$(npm i)" ] && echo 'Done' || echo 'Failed'
echo -n 'Frontend... '
cd ../f* && [ "$(npm i)" ] && echo 'Done' || echo 'Failed'

# Leave user back where they started
cd ../..

