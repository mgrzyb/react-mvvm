"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const devMode = process.env.NODE_ENV !== "production";
const customIconsPath = path.resolve(__dirname, "src/assets/icons");

console.log("Dev mode: ", devMode);

module.exports = {
    entry: {
        app: ["./src/index.tsx"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/[name].bundle.js",
        publicPath: "/"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
        alias: {
            react: path.resolve('./node_modules/react'),
            'react-dom': path.resolve('./node_modules/react-dom')
        }        
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "less-loader",
                        options: {
                            javascriptEnabled: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                exclude: /src/,
                use: [devMode ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.css$/,
                include: /src/,
                exclude: /node_modules/,
                use: [
                    devMode ? "style-loader" : MiniCssExtractPlugin.loader,
                    {
                        loader: "typings-for-css-modules-loader",
                        options: {
                            modules: true,
                            importLoaders: 1,
                            sourceMap: true,
                            namedExport: true,
                            localIdentName: "[name]__[local]___[hash:base64:5]"
                        }
                    },
                    "postcss-loader"
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: devMode ? true : false,
                        experimentalWatchApi: devMode ? true : false,
                        compilerOptions: {
                            noEmit: devMode ? true : false
                        }
                    }
                }
            },
            {
                test: /\.(bmp|jpe?g|png|gif|svg)$/,
                exclude: customIconsPath,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            name: "static/media/[name].[hash:8].[ext]",
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                include: customIconsPath,
                use: {
                    loader: "@svgr/webpack",
                    options: {
                        icon: true
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "static/fonts/[name].[ext]"
                        }
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.(ts|tsx|js|jsx)$/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
//        new HardSourceWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "src", "index.html"),
            filename: "index.html"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? "[name].css" : "[name].[hash].css",
            chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
    optimization: {
        sideEffects: false,
        splitChunks: {
            chunks: "all"
        }
    },
    devServer: {
        historyApiFallback: {
            rewrites: [{ from: /^\/$/, to: "/index.html" }]
        }
    }
};
