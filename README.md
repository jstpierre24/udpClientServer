# Requirements
# James St-Pierre 26655785
# Andrea Julia Biondi 26456251

1. You need install node 4.2.1 or later
2. Run `npm install` to install dependencies
3. Run `npm install -g` to install global curl library

# Run echo server

`node server.js`

# Run separate terminal

`httpc get 'http://httpbin.org/get?course=networking&assignment=1'`
`httpc post 'http://httpbin.org/get?course=networking&assignment=1'`

`httpc get -v -h 'http://httpbin.org/get?course=networking&assignment=1'`
`httpc post -o test.txt -v -h 'http://httpbin.org/get?course=networking&assignment=1'`
