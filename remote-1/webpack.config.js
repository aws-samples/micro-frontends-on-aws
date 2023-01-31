// remote/webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const { dependencies } = require('./package.json');

module.exports = {
    entry: './src/index.ts',
    mode: process.env.NODE_ENV || 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 4000,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env),
        }),
        new ModuleFederationPlugin({
            name: 'Remote1',
            filename: 'moduleEntry.js',
            exposes: {
                './App': './src/App',
                './Button': './src/Button',
            },
            shared: {
                ...dependencies,
                react: {
                    singleton: true,
                    requiredVersion: dependencies['react'],
                },
                'react-dom': {
                    singleton: true,
                    requiredVersion: dependencies['react-dom'],
                },
            },
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    target: 'web',
};
