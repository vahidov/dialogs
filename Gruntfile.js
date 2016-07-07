module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        nittro: {
            options: {
            },
            full: {
                options: {
                    extras: [
                        'dialogs',
                        'confirm',
                        'dropzone',
                        'paginator'
                    ]
                },
                files: {
                    'dist/nittro-full.js': []
                }
            }
        }
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            dialogs: {
                files: {
                    'dist/js/nittro-dialogs.min.js': [
                        'src/js/Nittro/Widgets/Dialog.js',
                        'src/js/Nittro/Widgets/FormDialog.js'
                    ]
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            dialogs: {
                files: {
                    'dist/js/nittro-dialogs.js': [
                        'src/js/Nittro/Widgets/Dialog.js',
                        'src/js/Nittro/Widgets/FormDialog.js'
                    ]
                }
            }
        },

        less: {
            min: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nittro-dialogs.min.css': [
                        'src/css/dialogs.less'
                    ]
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/css/nittro-dialogs.css': [
                        'src/css/dialogs.less'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['uglify', 'concat', 'less']);

};
