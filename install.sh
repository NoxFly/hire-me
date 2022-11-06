# install node-pre-gyp globally
npm i node-pre-gyp

if [ $? -eq 0 ]; then
    # install all dependencies & build tensorflow
    npm i && npm rebuild @tensorflow/tfjs-node --build-from-source
    
    if [ $? -eq 0 ]; then
        # remove a buggy package after the installation
        rm -rf node_modules/face-api.js/node_modules
    fi
fi