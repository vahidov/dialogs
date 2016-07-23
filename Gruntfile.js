module.exports = function(grunt) {

    var files = grunt.file.readJSON('nittro.json').files;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            dialogs: {
                files: {
                    'dist/js/nittro-extras-dialogs.min.js': files.js
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            dialogs: {
                files: {
                    'dist/js/nittro-extras-dialogs.js': files.js
                }
            }
        },

        less: {
            min: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nittro-extras-dialogs.min.css': files.css
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/css/nittro-extras-dialogs.css': files.css
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['uglify', 'concat', 'less']);

};
