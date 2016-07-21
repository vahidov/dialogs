module.exports = function(grunt) {

    var files = [
        'src/js/Nittro/Extras/Dialogs/Dialog.js',
        'src/js/Nittro/Extras/Dialogs/FormDialog.js',
        'src/js/Nittro/Extras/Dialogs/Bridges/DialogsDI.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            dialogs: {
                files: {
                    'dist/js/nittro-extras-dialogs.min.js': files
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            dialogs: {
                files: {
                    'dist/js/nittro-extras-dialogs.js': files
                }
            }
        },

        less: {
            min: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nittro-extras-dialogs.min.css': [
                        'src/css/dialogs.less'
                    ]
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/css/nittro-extras-dialogs.css': [
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
