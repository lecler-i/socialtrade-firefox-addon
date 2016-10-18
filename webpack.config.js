require( 'es6-promise' ).polyfill();

var path = require( 'path' );
var webpack = require( 'webpack' );
var NODE_ENV = process.env.NODE_ENV || 'development';
var ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
var CopyWebpackPlugin = require('copy-webpack-plugin');
var styleExtractor = new ExtractTextPlugin('styles.css');

var webpackConfig = {

	entry: {
		bundle: './src/main.js',
		background: './src/background.js',
	},
	output: {
		path: path.join( __dirname, 'build'),
		filename: "[name].js"
	},
	module: {

		// Webpack loaders are applied when a resource is matches the test case
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: [ 'babel-loader?cacheDirectory' ]
			},
			{
				test: /\.css$/, 
				loader: styleExtractor.extract('style-loader', 'css')
			},
		]
	},
	resolve: {
		extensions: [ '', '.js'],
		modulesDirectories: [ 'node_modules', 'src' ]
	},
	node: {
		fs: "empty",
		process: true
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify( NODE_ENV )
			}
		}),
		styleExtractor,
		new CopyWebpackPlugin([
            // {output}/file.txt
            { from: 'manifest.json' },
        ]),
	]
};

if ( NODE_ENV === 'production' ) {
	// When running in production, we want to use the minified script so that the file is smaller
	webpackConfig.plugins.push( new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}) );
}

module.exports = webpackConfig;
