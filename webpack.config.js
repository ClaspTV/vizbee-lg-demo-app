const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './js/index.js',
    output: {
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    mode: 'development',
    optimization: {
        minimize: false
    },
    devtool: 'source-map',
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: path.resolve(__dirname, 'index.html'),
                    to: path.resolve(__dirname, 'build', 'index.html')
                },
                { 
                    from: path.resolve(__dirname, 'js', 'lib'), 
                    to: path.resolve(__dirname, 'build', 'js') 
                },
                { 
                    from: path.resolve(__dirname, 'images'), 
                    to: path.resolve(__dirname, 'build', 'images') 
                },
                { 
                    from: path.resolve(__dirname, 'fonts'), 
                    to: path.resolve(__dirname, 'build', 'fonts') 
                },
                { 
                    from: path.resolve(__dirname, 'css'), 
                    to: path.resolve(__dirname, 'build', 'css') 
                },
                { 
                    from: path.resolve(__dirname, 'appinfo.json'),
                    to: path.resolve(__dirname, 'build', 'appinfo.json')
                },
            ],
        }),
    ]
};