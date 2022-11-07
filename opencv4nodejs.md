**Installation OpenCV + OpenCV_contrib :** (all OpenCV libs like IA recognition etc...)
```sh
# in the folder Downloads/opencv
sudo apt update && sudo apt install -y cmake g++ wget unzip
wget -O opencv.zip https://github.com/opencv/opencv/archive/4.x.zip
wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/4.x.zip
unzip opencv.zip
unzip opencv_contrib.zip
mkdir -p build && cd build
sudo apt-get install libgtk2.0-dev pkg-config
cmake -DWITH_QT=OFF -DWITH_GTK=ON -DOPENCV_EXTRA_MODULES_PATH=../opencv_contrib-4.x/modules ../opencv-4.x
# This cmd = 1h
cmake --build .
sudo make install
sudo ldconfig
```
Opencv installed here : `/usr/local/bin`, `/usr/local/include` and `/usr/local/lib`.

**Installation opencv4nodejs :**
```sh
# installation nodejs :
sudo apt-get install nodejs

# verify installed nodejs's version is >= 14
node -v
# If it's not the case, please upgrade

# project creation
mkdir -p ~/codes/nodejs/ihm/projet && cd "$_"
npm init -y
echo 'const cv = require("@u4/opencv4nodejs"); const cap = new cv.VideoCapture(0); ' > index.js;

# setup & installation opencv4nodejs
export OPENCV_INCLUDE_DIR=/usr/local/include/opencv4
export OPENCV_LIB_DIR=/usr/local/lib
export OPENCV_BIN_DIR=/usr/local/bin
export OPENCV4NODEJS_DISABLE_AUTOBUILD=1

sudo apt-get install cmake

# Add this to the end of your package.json (into the object) :
"opencv4nodejs": {
    "disableAutoBuild": 1,
    "opencvIncludeDir": "/usr/local/include/opencv4",
    "opencvLibDir": "/usr/local/lib",
    "opencvBinDir": "/usr/local/bin"
}

# Add this 'install' command in the scripts of package.json :
"scripts": {
    "install": "npx build-opencv --incDir /usr/local/include/opencv4 --libDir /usr/local/lib --binDir /usr/local/bin --nobuild rebuild"
}

# Then, always in the package.json, add this in the 'dependencies' part :
"dependencies": {
    "@u4/opencv4nodejs": "^6.2.4"
}

# execute these following commands :
npm i
npm i -g typescript ts-node

# If there's no error, launch the app :
node .
```
