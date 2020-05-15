const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, './index.js'),
    output: {
        path: path.join(__dirname, '/'),
        filename: 'rpuzzle.min.js'
    },
    externals: {
        bsv: 'bsv',
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            RPuzzle: 'rpuzzle',
        }),
    ],
};