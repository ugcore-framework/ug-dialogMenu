fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'ug-dialogMenu'
description 'Dialog Menu for UgCore by UgDev'
author 'UgDev'
version '3.5'
url 'https://github.com/UgDevOfc/ug-menu'
ui_page 'html/index.html'

client_script 'client/main.lua'

files { 
    'html/index.html', 
    'html/css/*.css', 
    'html/js/*.min.js', 
    'html/js/*.js',
    'html/fonts/*.ttf'
}

dependency 'ug-core'