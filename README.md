# websocket-signalling-server

## Description
Signal server to enable peer to peer webrtc calls

## How to Use
I deployed this on Azure so giving steps for that. Follow them accordingly for other cloud providers.
1. Create a webapp in the azure with runtime as "NODE:20-lts" and enable web scokets in the configuration(as its not enabled by default).
2. Zip whole directory into deployment.zip file. and deploy the webapp using this zip file.

**Note**: My repository already has required node_modules and in package.json I mentioned start command as directly calling server.js instead of installing dependencies first.

3. After deployment you get server dns name in the UI page. We can use this as websocket server.
   
**Note**: Data is stores on memeory hashmap so if app restarts all data is lost.
