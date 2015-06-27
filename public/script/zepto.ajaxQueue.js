/*! jQuery Ajax Queue - v0.1.2pre - 2013-03-19
* https://github.com/gnarf37/jquery-ajaxQueue
* Copyright (c) 2013 Corey Frang; Licensed MIT */
(function($) {

// jQuery on an empty object, we are going to use this as our Queue
var ajaxQueue = $({});
var ajaxList = [];
var queueStatus = "";


    var jqXHR,
        dfd = $.Deferred(),
        promise = dfd.promise();

$.ajaxQueue = function( ajaxOpts ) {
//
    var ajaxItem = {
        options : ajaxOpts,
        status : 'wait'
    }

    ajaxList.push(ajaxItem);

    var ajax = ajaxList[0];
    if (ajax.status != 'pending'){
        sendAjax()
    }




    //if(ajaxList.length > 1)return





    function sendAjax(){
        //for(var i=0;i<ajaxList.length;i++)
        //{
        //    var ajax = ajaxList[i];
        //    console.log(ajaxList);
        //    //if(ajax.status!="wait")
        //    //{
        //    //    ajaxList.splice(i,1);
        //    //    i--;
        //    //
        //    //}
        //    if(ajax.status == 'sending'){
        //        ajaxList.splice(i,1);
        //        i--;
        //        return;
        //    }
        //
        //    //if()
        //
        //    if(ajax.status == 'wait'){
        //        ajax.status = 'sending';
        //        $.ajax( ajax.options)
        //            //.done(sendAjax);
        //        console.log(i)
        //        break;
        //    }
        //
        //
        //}
        var ajax = ajaxList[0];
        ajax.status = 'pending';
        $.ajax( ajax.options)
            .done( dfd.resolve )
            .fail( dfd.reject )
            .then(function(){
                ajaxList.shift();
                if(ajaxList.length>0)sendAjax();
            });
    }

    // run the actual query
    //function doRequest( next ) {
    //    jqXHR = $.ajax( ajaxOpts );
    //    jqXHR.done( dfd.resolve )
    //        .fail( dfd.reject )
    //        .then( next, next );
    //}

    // queue our ajax request
    //ajaxQueue.queue( doRequest );
    //ajaxList.push(doRequest);
    //doRequest()
    //for(var i=0;i<ajaxList.length;i++){
    //    var req = ajaxList[i];
    //    req();
    //    ajaxList.splice(i,1);
    //    i--;
    //}
//    debugger
//    var req = Q[0];
//req;
//    Q[0]();
//    console.log(Q[0])

    //add the abort method
    //promise.abort = function( statusText ) {
    //
    //    // proxy abort to the jqXHR if it is active
    //    if ( jqXHR ) {
    //        return jqXHR.abort( statusText );
    //    }
    //
    //    // if there wasn't already a jqXHR we need to remove from queue
    //    var queue = ajaxQueue.queue(),
    //        index = $.inArray( doRequest, queue );
    //    if ( index > -1 ) {
    //        queue.splice( index, 1 );
    //    }
    //
    //    // and then reject the deferred
    //    dfd.rejectWith( ajaxOpts.context || ajaxOpts, [ promise, statusText, "" ] );
    //    return promise;
    //};

    return promise;
};

})(Zepto);
