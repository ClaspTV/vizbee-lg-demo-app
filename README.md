# Vizbee LG WebOS TV Demo App

Vizbee LG WebOS TV Demo App demonstrates how to integrate Vizbee casting 
functionality into an LG WebOS TV app.

## Integration Steps for your LG WebOS TV app

Look for the block comments with text "[BEGIN] Vizbee Integration" and 
"[END] Vizbee Integration" in the code for an easy understanding of the integration.

### Setup

#### Prerequisites
- Ensure you have minimum Node.js version of 16.15.1 installed on your system.
- Setup `ares-cli` to run the app on your LG WebOS TV.

For how to install & setup `ares-cli`, refer to [Setup ares-cli](#ares-cli-setup).

#### Installation

- Clone this repository: `git clone https://github.com/ClaspTV/vizbee-lg-demo-app.git`.
- Install the dependencies: `npm install`.

### Running the app

This project uses Webpack for bundling and Babel for transpiling. The main entry point is `src/index.js`.
1. Build the project: `npm run build`.
2. Generate the .ipk file for LG WebOS TV deployment: `npm run package`.
3. Install the package into the LG WebOS TV: `ares-install -d <DEVICE-NAME> <PATH-TO-GENERATED-PACKAGE-FILE>`
4. Sideload/Launch the app: `ares-inspect -o -d <DEVICE-NAME> com.vizbee.demoapp`

### Packaging

To package the app for LG WebOS TV:

1. Run `npm run build` to create a production build.
2. Run `npm run package` to generate the .ipk file.

### Configuration

- Replace the Demo Vizbee App ID with your actual App ID: `vzbInstance.start('vzb2000001');` in `src/index.js`.
- Replace the bitmovin player key with your's: `<YOUR-BITMOVIN-PLAYER-KEY>` in `setupPlayer` method of  `src/screens/PlayerScreen.js`.
- Replace the app's package name with your's: `<YOUR-APP's-PACKAGE-NAME-CONFIGURED-WITH-BITMOVIN-PLAYER>` in `setupPlayer` method of  `src/screens/PlayerScreen.js`.

## Project Structure

```
.
├── .vscode/
├── build/
├── css/
├── fonts/
├── images/
├── js/
├── packages/
├── index.html
├── appinfo.json
├── README.md
├── .babelrc
├── package.json
├── generate-package.sh
└── webpack.config.js
```

| File/Folder         | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| index.html          | HTML laying out the structure of the demo and definition of the used player resources |
| js/index.js         | Main JavaScript file our demo application will use                                    |
| src/lib             | Libraries required for the app                                                        |
| src/screens         | App UI screens                                                                        |
| src/vizbee          | Vizbee integration code                                                               |
| images/             | The application logo assets                                                           |
| fonts/              | Font files used in the demo application                                               |
| css/                | Stylesheets used for making the demo application pretty                               |
| appinfo.json        | Application manifest info                                                             |
| generate-package.sh | Shell script that generates app package                                               |
| build/              | Code distribution files generated after build command                                 |
| packages            | Package file (.ipk) generated after package command                                   |

## Dependencies

This project uses several development dependencies, including:

- Babel for JavaScript transpilation
- Webpack for bundling
- Various loaders and plugins for asset management

For a full list of dependencies, please refer to the `package.json` file.

## Troubleshooting

If you encounter any issues:

1. Ensure all prerequisites are installed and up to date.
2. Clean the build folder `npm run clean`.

## Support

For any questions or support, please contact support@vizbee.tv or visit our documentation at https://developer.vizbee.tv/continuity/smart-tv/integration-guide/setup

## Appendix

### ares cli setup

1. Download & Install [ares-cli](https://webostv.developer.lge.com/develop/tools/cli-installation)
2. Connect to your TV. This [tutorial](https://webostv.developer.lge.com/develop/tools/cli-dev-guide#ares-setup-device) is a good reference
3. Run/debug the sample app. If you debug, you will see Chrome developer tools launch. This will enable you to debug, monitor network requests, and execute commands through the javascript console. These references will give you good insight:
    - https://webostv.developer.lge.com/develop/tools/cli-dev-guide#ares-install
    - https://webostv.developer.lge.com/develop/tools/cli-dev-guide#ares-inspect

### Documentation
- [Vizbee Smart TV Developer Guide](https://developer.vizbee.tv/continuity/smart-tv/integration-guide/setup)
- [Vizbee Documentation](https://developer.vizbee.tv)