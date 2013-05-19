# grunt-bulk-symlink

> run grunt-symbolic-link task repeatedly. It's useful when you want to pick some files up and symlink them into one destination directory.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-bulk-symlink --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bulk-symlink');
```

## Prerequisite
This plugin requires [grunt-symbolic-link](https://github.com/mintbridge/grunt-symbolic-link) plugin installed.

```shell
npm install grunt-symbolic-link --save-dev
```


```js
grunt.loadNpmTasks('grunt-symbolic-link');
```

### Overview
In your project's Gruntfile, add a section named `bulkSymlink` to the data object passed into `grunt.initConfig()`.

In bulkSymlink task, spawns ths specific task named 'symlink:bulkSymlink', so you need to set up link the following.

```js
grunt.initConfig({
  symlink: {
    bulkSymlink: {
      target: grunt.option('bulkSymlinkTarget'),
      link: grunt.option('bulkSymlinkLink'),
      options: {
      // Target-specific file lists and/or options go here (you can use symlink task option).
      }
    }
  },
  bulkSymlink: {
    your_target: {
      // Target-specific file lists and/or options go here.
      targets: ['path/to/target/file']
      dir: 'path/to/directory'
    },
  },
})
```

*** You need to specify the relative links from destination directory you set in targets argument.

### Options

#### targets
Type: `Array`
Default value: none

The targets to symlink

#### dir
Type: `String`
Default value: none

The destination symlink to. filename 

### Usage Examples

#### Default Options

The following setting does symlink to two files link the following manner.

```shell
path
  - to
    - dir
  - foo
    - bar.txt
  - bar
    - baz.txt
```


```js
grunt.initConfig({
  symlink: {
    bulkSymlink: {
      target: grunt.option('bulkSymlinkTarget'),
      link: grunt.option('bulkSymlinkLink'),
      options: {
      // Target-specific file lists and/or options go here (you can use symlink task option).
      }
    }
  },
  bulkSymlink: {
    your_target: {
      // Target-specific file lists and/or options go here.
      targets: ['../../foo/bar.txt', '../../bar/baz.txt']
      dir: 'path/to/dir'
    },
  },
})
```


```shell
path/to/dir > ls -al
---
bar.txt -> ../../foo/bar.txt
baz.txt -> ../../bar/baz.txt
```


## Release History
_(Nothing yet)_
