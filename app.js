var express = require('express'),
    http = require('http'),
    swig = require('swig'),
    ip = require('ip'),
    cmd = require('node-cmd');

var app = express();
app.engine('html', swig.renderFile);
swig.setDefaults({cache: false});
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

var counter = 0;
app.get('/jsonp_api', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    var callBackName = req.query['callback'];
    var json = JSON.stringify({
        "api_index":counter.toString(),
        "price":"199",
        "param":req.query['param']
    });
    counter ++;
    setTimeout(function(){
        res.send(callBackName+'('+json+')');
    },3250)
});

app.get('/jsonp_api.html', function(req, res) {
    res.setHeader('Content-Type', 'text/json');
    setTimeout(function(){
        res.send('priceServiceCallBack({"cityId":"9173","price":[{"cityId":"9173","depot":"0001","inputParameter":{"districtId":"","itemInputData":"120860973||2|"},"inputkey":"120860973||2|","itemPrice":330.35,"juId":"433334669","juPrice":100.00,"juServiceType":"3","paramater":{"cacheMinute":600},"partNumber":"000000000120860973","price":164.00,"priceType":"4-3","proPrice":164.00,"promotionPrice":100.00,"refPrice":330.35,"salesOrg":"1001","shopCode":"0000000000","vendor":"0010046166"}]});');
    },3250)
});

app.get('/json_api', function(req, res) {
    res.setHeader('Content-Type', 'text/json');
    var json = JSON.stringify({
        api_index:counter.toString(),
        price:"199",
        "param":req.query['param']
    });
    counter ++;
    setTimeout(function(){
        res.send(json);
    },3250)
});


app.get('/', function (req, res) {
    res.render('index');
});

app.listen(3001,function(){
    console.log('listen 3001');
    cmd.get('start http://'+ip.address()+':3001');
});
