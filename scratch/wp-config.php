<?php
define( 'WP_CACHE', true );

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u639375659_rrdft' );

/** Database username */
define( 'DB_USER', 'u639375659_L6eAv' );

/** Database password */
define( 'DB_PASSWORD', 'diTWThGx8G' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'GRBX+R4H4lmVJx !XR82H/zj!Hel<z+LFh,j5GKz+^jm}wk5`GM497DGidveLv;+' );
define( 'SECURE_AUTH_KEY',   '9] y+4=JZ MqjsfSI?3F,L~,82a^a&#=--hr<2vW;FQQ]ll;e!`Qh2dt$,{<o12m' );
define( 'LOGGED_IN_KEY',     '=tmKIErkKZ6,Z~|x7/9kK4j|+3.g@6I4T0YD+m6BWv9edKs?@7cw/Pcr0aq=?E!b' );
define( 'NONCE_KEY',         'B}>1RkPSb(=6C[Y2H$ESnZAS(,>;ca;=vN`;75p<&&:#^Af(@h);L`Y/*+lh;Wh]' );
define( 'AUTH_SALT',         'i_$kt`6/fD]k@K-ND9~FgZ}gzT;vnmE8hq1~:Ob)-`ZOLFW6/znHH,b.I>xa<g-1' );
define( 'SECURE_AUTH_SALT',  'rK|I`7XdsSMhUNT!8/2$kKwTfX52)5&s7Wid,PBZtmE( NT#J1nO[jqHes*8ppF5' );
define( 'LOGGED_IN_SALT',    ')57ndhrah.F];DmncJ2{s4$hotT$1rXRfqmW&GEf-yAO!X<[I;Ia7_w[i]}C_&?d' );
define( 'NONCE_SALT',        '-Zq-@p)vRa0d|K>Fq85}>B+D<_tv9OVg&q~Hx.Oe1ZrHyX;.m;7oaC<rfb}--jnO' );
define( 'WP_CACHE_KEY_SALT', '#LU 3O51S:LU-U1#Uwt,h]Hqi@SXzPSZIT%+>[FV{bqp~Kh~t zX^o@Q|:ZxS42E' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', '1f3c4374ab2d225e29ac16598a268b77' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
