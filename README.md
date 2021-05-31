# Peer-to-peer decentralized graph editor

P2P Defloditor is a collaborative graph editor built for desktop platform by using [conflict-free replicated datatype (CRDT)](https://crdt.tech/) as a conflict resolution mechanism. This allows the app to resolve conflicts by multiple users without involving a single centralized authority as a conflict resolver. You can use it with your friends or peers to work on a graph together :grin:	.


## Dependencies
### Linux
1. Make sure you have python 2.x or python 3.x installed on your local
2. Use node version 12, you can use [nvm](https://github.com/nvm-sh/nvm) to install and manage different versions of node on your local:
```
nvm install 12.22.1
nvm use 12.22.1
```
3. Make sure you already install `build-essential` (`sudo apt-get install build-essential`)
### Windows
1. Make sure you have python 2.x or python 3.x installed on your local
2. Use node version 12, you can use [nvm-windows](https://github.com/coreybutler/nvm-windows) (a separate project from [nvm](https://github.com/nvm-sh/nvm)) to install and manage different versions of node on your local:
```
nvm install 12.22.1
nvm use 12.22.1
```
3. Make sure you already install [Visual Studio Community](https://visualstudio.microsoft.com/) (2013, 2015, 2017, or 2019) and also already install the ***Desktop Development With C++*** module
## How to start the project
The development mode (the only mode currently supported) provides you with two types of CRDT to run the app, [yjs](https://github.com/yjs/yjs) and [Automerge](https://github.com/automerge/automerge)
> Use ***npm***. Usage of ***yarn*** is strongly discouraged for this specific project, because of [native dependency problem](https://www.electronjs.org/docs/tutorial/using-native-node-modules). But the problem has been solved from the installation script, at least when tried with npm.

```
# clone the repo
git clone https://github.com/abdashaffan/p2p-defloditor.git

# enter the project root folder
cd p2p-defloditor

# install the dependencies
npm install

# to run the app using Yjs CRDT, use this command:
npm run yjs

# or you can use this command instead to run the app using Automerge CRDT:
npm run automerge
```
***Make sure there are no error showed up during the installation process***, and after successfuly launched the app, you can share your workspace url to your peers and let them join your workspace by inserting your url inside their app instance.

## Important Notes 
1. You cannot run multiple instances of this app inside the same local. This is because the app will save your document history on the disk and there cannot be more than one instances that can edit the same document. Use VM (or different machine) if you need to do that.
2. The yjs option uses the [y-webrtc](https://github.com/yjs/y-webrtc) for the communication mechanism. The default setting will use the signaling server provided by yjs maintainers.
3. An app launched by using yjs option cannot collaborate with another app that launched by using Automerge option.
