// package vars
const pkg = require('./package.json')

// gulp
const gulp = require('gulp')

// Run sequence
const runSequence = require('run-sequence')

// load all plugins in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
  pattern: ['*'],
  scope: ['devDependencies']
})

const onError = err => console.log(err)

const banner = [
  '/**',
  ' * @project        <%= pkg.name %>',
  ' * @author         <%= pkg.author %>',
  ' * @build          ' + $.moment().format('llll') + ' ET',
  ' * @copyright      Copyright (c) ' + $.moment().format('YYYY') + ', <%= pkg.copyright %>',
  ' *',
  ' */',
  ''
].join('\n')

// scss - build the scss to the build folder, including the required paths, and writing out a sourcemap
gulp.task('scss', () => {
  $.fancyLog('-> Compiling scss')
  return gulp.src(pkg.paths.src.scss + pkg.vars.scssName)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sass({
      includePaths: pkg.paths.scss
    })
      .on('error', $.sass.logError))
    .pipe($.cached('sass_compile'))
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write('./'))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.build.css))
})

// css task - combine & minimize any distribution CSS into the dist css folder, and add our banner to it
gulp.task('css', ['scss'], () => {
  $.fancyLog('-> Building css')
  return gulp.src(pkg.globs.distCss)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.newer({dest: pkg.paths.dist.css + pkg.vars.siteCssName}))
    .pipe($.print())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.concat(pkg.vars.siteCssName))
    .pipe($.cssnano({
      discardComments: {
        removeAll: true
      },
      discardDuplicates: true,
      discardEmpty: true,
      minifyFontValues: true,
      minifySelectors: true
    }))
    .pipe($.header(banner, {pkg: pkg}))
    .pipe($.sourcemaps.write('./'))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.dist.css))
    .pipe($.livereload())
})

// Babel and Browserify task - transpile our Javascript into the build directory
gulp.task('babelAndBrowserify', () => {
  $.fancyLog('-> Transpiling Javascript via Babel and Browserify...')
  return $.browserify({entries: pkg.globs.srcJs, debug: true})
    .transform($.babelify)
    .bundle()
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.vinylSourceStream('bundle.js'))
    .pipe(gulp.dest(pkg.paths.build.js))
})

// js task - minimize any distribution Javascript into the dist js folder, and add our banner to it
gulp.task('js', ['babelAndBrowserify'], () => {
  $.fancyLog('-> Building js')
  return gulp.src(pkg.globs.distJs)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.if(['*.js', '!*.min.js'],
      $.newer({dest: pkg.paths.dist.js, ext: '.min.js'}),
      $.newer({dest: pkg.paths.dist.js})
    ))
    .pipe($.if(['*.js', '!*.min.js'],
      $.uglify()
    ))
    .pipe($.if(['*.js', '!*.min.js'],
      $.rename({suffix: '.min'})
    ))
    .pipe($.header(banner, {pkg: pkg}))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.dist.js))
    .pipe($.livereload())
})

// html task - inject partials
gulp.task('html', () => {
  $.fancyLog('-> Injecting html partials')
  return gulp.src(pkg.globs.srcHtmlIndex)
    .pipe($.inject(gulp.src(pkg.globs.partials.header), {
      starttag: '<!-- inject:header:{{ext}} -->',
      transform: (filePath, file) => file.contents.toString('utf8')
    }))
    .pipe($.inject(gulp.src(pkg.globs.partials.body), {
      starttag: '<!-- inject:body:{{ext}} -->',
      transform: (filePath, file) => file.contents.toString('utf8')
    }))
    .pipe($.inject(gulp.src(pkg.globs.partials.footer), {
      starttag: '<!-- inject:footer:{{ext}} -->',
      transform: (filePath, file) => file.contents.toString('utf8')
    }))
    .pipe(gulp.dest('./dist'))
    .pipe($.livereload())
})

// favicons-generate task
gulp.task('favicons-generate', () => {
  $.fancyLog('-> Generating favicons')
  return gulp.src(pkg.paths.favicon.src).pipe($.favicons({
    appName: pkg.name,
    appDescription: pkg.description,
    developerName: pkg.author,
    background: '#FFFFFF',
    path: pkg.paths.favicon.path,
    url: pkg.site_url,
    display: 'standalone',
    orientation: 'portrait',
    version: pkg.version,
    logging: false,
    online: false,
    html: pkg.paths.build.html + 'favicons.html',
    replace: true,
    icons: {
      android: false, // Create Android homescreen icon. `boolean`
      appleIcon: false, // Create Apple touch icons. `boolean`
      appleStartup: false, // Create Apple startup images. `boolean`
      coast: false, // Create Opera Coast icon. `boolean`
      favicons: true, // Create regular favicons. `boolean`
      firefox: false, // Create Firefox OS icons. `boolean`
      opengraph: false, // Create Facebook OpenGraph image. `boolean`
      twitter: false, // Create Twitter Summary Card image. `boolean`
      windows: false, // Create Windows 8 tile icons. `boolean`
      yandex: false // Create Yandex browser icon. `boolean`
    }
  }))
    .pipe(gulp.dest(pkg.paths.favicon.dest))
})

// copy favicons task
gulp.task('favicons', ['favicons-generate'], () => {
  $.fancyLog('-> Copying favicon.ico')
  return gulp.src(pkg.globs.siteIcon)
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.dist.base))
})

// imagemin task
gulp.task('imagemin', () => {
  return gulp.src(pkg.paths.dist.img + '**/*.{png,jpg,jpeg,gif,svg}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 7,
      svgoPlugins: [{removeViewBox: false}],
      verbose: true,
      use: []
    }))
    .pipe(gulp.dest(pkg.paths.dist.img))
})

// generate-fontello task
gulp.task('generate-fontello', () => {
  return gulp.src(pkg.paths.src.fontello + 'config.json')
    .pipe($.fontello({
      font: 'fonts' // Destination dir for Fonts and Glyphs
    }))
    .pipe($.print())
    .pipe(gulp.dest(pkg.paths.build.fontello))
})

// copy fonts task
gulp.task('fonts', ['generate-fontello'], callback => {
  gulp.src(pkg.globs.fonts)
    .pipe(gulp.dest(pkg.paths.dist.fonts))
  callback()
})

// Default task
gulp.task('default', ['css', 'js', 'html'], () => {
  $.livereload.listen()
  gulp.watch([pkg.paths.src.scss + '**/*.scss'], ['css'])
  gulp.watch([pkg.paths.src.css + '**/*.css'], ['css'])
  gulp.watch([pkg.paths.src.js + '**/*.js'], ['js'])
  gulp.watch([pkg.paths.src.html + '**/*.html'], ['html'])
})

// Production build
gulp.task('build', callback => {
  runSequence(['js', 'html', 'favicons', 'imagemin', 'fonts'],
    'css',
    callback)
})
