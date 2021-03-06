import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import autoprefixer from 'autoprefixer';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ImageminPlugin from 'imagemin-webpack-plugin';

const isProd = process.env.NODE_ENV === 'PROD';

module.exports = {
    context: __dirname + '/app',
    entry: __dirname + '/app/js/main.js',
    
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    
    devtool: !isProd ? 'source-map' : '',

    module: {
        rules: [
            //Passa o babel para converter de ES6 para ES5 e cria um bundle dos arquivos JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            },
            //Compila os arquivos SASS para CSS e juntamente com o import via JS, o injeta em uma tag "<style>" no HTML
            {
                test: /\.scss$/,
                //A ordem de execucao dos loaders se segue da direita para a esquerda (ou baixo para cima)
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: isProd
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [autoprefixer];
                            }
                        }
                    },
                    'sass-loader',
                ]
            },
            //Verifica por alteracoes nos arquivos HTML e caso ocorra, recarrega o browser
            {
                test: /\.pug$/,
                use: [
                    'raw-loader',
                    'pug-html-loader'
                ]
            }
        ]
    },
    
    plugins: [
        //Limpa a pasta "build"
        new CleanWebpackPlugin('build'),
        //Cria o "index.html" (default filename) e injeta o script de import do "bundle.js" no final da tag "<body>" do "index.html"
        new HTMLWebpackPlugin({
            template: __dirname + '/app/pug/index.pug',
            minify: {
                collapseWhitespace: isProd,
                collapseInlineTagWhitespace: isProd,
                removeComments: isProd
            },
            inject: 'body'
        }),

        //Cria uma constante global em tempo de compilacao para os arquivos JS lerem a NODE_ENV
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }),

        //Copia as imagens
        new CopyWebpackPlugin([{
            from: 'img/',
            to: 'img/'
        }]),
        //Minifica as imagens (precisa sempre vir depois de plugins que adicionam imagens)
        new ImageminPlugin({
            disable: !isProd,
            test: /\.(jpe?g|png|gif|bmp|svg)$/i
        })
    ],

    //A flag "--hot" no script que roda o "webpack-dev-server" no JSON, atualiza o browser automaticamente caso o codigo seja alterado (Hot Reload)
    devServer: {
        //Porta do servidor
        port: 9000,
        //Abre o browser automaticamente
        open: true
    }
};