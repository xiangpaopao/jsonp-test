/*
Ajax队列js库
1. ajax方法
发送ajax请求，options项同Cube.ajaxQueue.addAjaxItem中的options项
(1) Cube.ajax(options)
 @param {Object} options
	{
		type:'get',//ajax method
		url:false,//ajax 请求地址
		data:null,//发送数据
		dataType:'json',//数据格式，支持text,json
		timeout:0,//超时时间,单位是毫秒，0代表永不超时
		beforeSend(),//发送前调用的方法
		success(data,options, status, xhr),//数据成功返回后的回调方法.
		error(xhr, type, error,options),//数据错误的回调方法
		complete(status, xhr, options)//ajax完成后的回调方法，无论出错，成功，超时，都会调用这个方法。status有四种情况，timeout:超时,success:成功,parseerror:json格式错误,error:服务器数据返回错误
	}
 @return 对应的XMLHttpRequest对象

 
 
2. Ajax队列相关方法
(1) Cube.ajaxQueue.addAjaxItem(options,[priority])
	描述：增加一个ajax队列项,不想使用队列的话，直接传0,那么请求将马上发送出去。返回一个Cube.ajaxItem对象
	参数：
   @param {Object} options 同 Cube.ajax(options)中的options
   @param {Number} [priority] 非必须参数,不传则视为0。ajax队列项的优先级，越小优先级越高。0代表不加入队列，直接发送请求。
   @return 对应的Cube.ajaxItem对象

(2) Cube.ajaxQueue.changePriority(urlPartOrObj,newPriority)
    描述：修改一个ajax队列项的优先级，如果此项已经被发送，那么修改无效
	参数：	
	@param {String/Cube.ajaxItem} urlPartOrObj 如果传的是String，那么ajax队列中url包含该String的ajax队列项都会生效。如果传的是Object，必须是Cube.ajaxItem对象
	@param {Number} newPriority  ajax队列项新的优先级。
	
	
(3) Cube.ajaxQueue.cancelAjax(urlPartOrObj)
    描述：取消一个ajax队列项，如果此项已经被发送，那么无法取消
	参数：	
	@param {String/Object} urlPartOrObj 如果传的是String，那么ajax队列中url包含该String的ajax队列项都会生效。如果传的是Object，必须是Cube.ajaxItem对象

(4) Cube.ajaxQueue.sendAjaxNow(urlPartOrObj)
    描述：将队列中的ajax项优先级提升到最高(0)，立即发送，如果此项已经被发送，那么提升无效。
	参数：	
	@param {String/Object} urlPartOrObj 如果传的是String，那么ajax队列中url包含该String的ajax队列项都会生效。如果传的是Object，必须是Cube.ajaxItem对象





 */

/*
* User: jerrewu
* Date: 2013-6-6
* ajax发送模块
*/
 ;
(
    function () {
        var ajax = function (options,xhr) {
            var defaultOptions = {
                type:'get',//ajax method
                url:false,//ajax 请求地址
                data:null,//发送数据
                dataType:'json',//数据格式，支持text,json
                timeout:0,//超时时间,单位是毫秒，0代表永不超时
                beforeSend:false,//发送前调用的方法
                success:false,//数据成功返回后的回调方法
                error:false,//数据错误的回调方法
                complete:false //ajax完成后的回调方法，无论出错，成功，超时，都会调用这个方法

            };
            //默认值
            for (i in defaultOptions) {
                if (options[i]===undefined) {
                    options[i] = defaultOptions[i];
                }
            }
           
            /*
             ajax执行出错后，将调用此方法
             type: "timeout", "error", "abort", "parsererror"
             @author:jerrywu
             @date:2012-07-24
             */
            function ajaxError(error, type, xhr, options) {
                options.error&&options.error(xhr, type, error,options);

                ajaxComplete(type,xhr,options)
            }

            /*
             ajax执行成功后，将调用此方法			 
             @author:jerrywu
             @date:2012-07-24
             */
            function ajaxSuccess(data, xhr, options) {
                var status = 'success';
                console.log(xhr,xhr.getResponseHeader('xx'));
                options.success&&options.success(data,options, status, xhr)
                ajaxComplete(status, xhr, options)
            }
            /*
             ajax执行完毕后，将调用此方法，无论成功还是失败，还是超时
             status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
             @author:jerrywu
             @date:2012-07-24
             */
            function ajaxComplete(status) {
                options.complete&&options.complete(xhr, status,options);


            }

            function onStateChange(a) {
                if(xhr.readyState==4)
                {
                    if(timeout>0)
                        clearTimeout(abortTimeout);
                    var result, error = false
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        var dataType = options.dataType;
                        result = xhr.responseText;
                        try{
                            if(dataType=="json")
                            {
                                if(window.JSON)
                                {
                                    result = JSON.parse(result);
                                }
                                else
                                {
                                    result = eval('(' + result + ')');
                                }
                            }
                        }
                        catch(ex)
                        {
                            error = ex;
                        }


                        if (error) ajaxError(error, 'parsererror', xhr, options)
                        else ajaxSuccess(result, xhr, options)

                    }
                    else
                    {
                        console.log("ERR",xhr.status,options);
                        //服务器返回状态码不对
                        ajaxError(null, 'error', xhr, options)
                    }
                }
            }


            var xhr = xhr||new XMLHttpRequest();


            //可以在options里面给xhr加其它的事件
            for(var key in xhr)
            {
                if(key.indexOf('on')==0)
                {
                   if(options[key])
                   {
                       xhr.addEventListener(key.replace('on',''),options[key])
                   }
                }

            }

           
            var timeout = options.timeout;
            var url = options.url;

            xhr.open(options.type, url);
            xhr.onreadystatechange = onStateChange;
            if (options.type === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            options.beforeSend&&options.beforeSend();
            xhr.send(options.data ? options.data : null);

            var abortTimeout;
            if (timeout > 0) abortTimeout = setTimeout(function () {                
                xhr.onreadystatechange = function(){};
                xhr.abort();

                ajaxError(null, 'timeout', xhr, options);

            }, options.timeout);

            return xhr;
        }
        window.Cube = window.Cube||{};
        window.Cube.ajax = ajax;
    }
    )()



/*
 * User: jerrewu
 * Date: 2013-6-6
 * ajax队列
 */
;
(

    function () {

        var ajaxQueue = {};
        //priority=0 代表直接发送，不参与所有队列
        function ajaxItem(options,priority) {
            this.options = options;
            this.status = "wait";
            if(priority==undefined)
            {
                priority = 0;
            }
            this.priority = priority;
        }

        ajaxQueue.ajaxItem = ajaxItem;


        var ajaxList = [];
        var highPriorityAjaxCount = 0;

        function init() {

        }

        /*
        最高优先级的ajax请求完成
         */
        function highPriorityAjaxComplete(originalComplete,xhr,status,options)
        {
            highPriorityAjaxCount--;
            //  console.log("COM",options,status);
            setTimeout(startSendLowPriorityAjax,100);
            originalComplete&&originalComplete(xhr,status,options);

        }
        

        function addAjaxItem(options,priority)
        {
            var aObj = new ajaxItem(options,priority);

            var options = aObj.options;
            //立即发送
            //if(aObj.priority==0)
            //{
            //
            //    highPriorityAjaxCount++;
            //    var complete = options.complete;
            //    options.complete = function(xhr,status,options){
            //        highPriorityAjaxComplete(complete,xhr,status,options);
            //    };
            //    Cube.ajax(options);
            //}
            //else
            //{
                ajaxList.push(aObj);
            //}
            console.log(aObj)

            if(highPriorityAjaxCount<=0)
            {
                setTimeout(startSendLowPriorityAjax,100);
            }

            //return aObj;
        }
        ajaxQueue.addAjaxItem = addAjaxItem;

        /*
        当前没有主ajax(priority=0的)在发送，开始发送次要ajax
         */
        function startSendLowPriorityAjax()
        {
            // console.log("startSendLowPriorityAjax",highPriorityAjaxCount);
            if(highPriorityAjaxCount>0)
                return;


            for(var i=0;i<ajaxList.length;i++)
            {
                var aObj = ajaxList[i];
                //当前有次要ajax在发送
                if(aObj.status=="sending"&&aObj.priority!=0)
                {
                    return;
                }

                if(aObj.status!="wait")
                {
                    ajaxList.splice(i,1);
                    i--;

                }
            }

            // 发送之前要对优先级排序

            ajaxList.sort(function(a,b){return a.priority>b.priority;});
            for(var i=0;i<ajaxList.length;i++)
            {
                console.log('for')
                var aObj = ajaxList[i];
                if(aObj.status=="wait")
                {
                    sendAjaxByAjaxItem(aObj);
                    break;
                }
            }

        }


        /*
        发送一个低优先级的ajax
        @author:jerrewu
        @date:2013-06-13
        @param:{AjaxItem} aObj AjaxItem对象

         */
        function sendAjaxByAjaxItem(aObj)
        {

            var options = aObj.options;
            var complete = options.complete;
            options.complete = function(xhr,status,options){
                setTimeout(startSendLowPriorityAjax,100);
                aObj.status = status;
                complete&&complete(xhr,status,options);
            };


            var xhr;
            if(ajaxQueue.lowPriorityXHR)
            {
                xhr =   ajaxQueue.lowPriorityXHR;
            }
            else
            {
                xhr = ajaxQueue.lowPriorityXHR = new XMLHttpRequest();
            }
            Cube.ajax(options,xhr);
            aObj.status = "sending";
        }


        /*
        根据url或者ajaxItem来查找列表中的ajaxItems
        @author:jerrewu
        @date:2013-06-13
        @param {String/Object} urlPartOrObj:url的部分字符串或者ajaxItem对象,程序会找到符合要求的所有ajaxItem并产即发送出去

         */
        function getAjaxItemsAsParam(urlPartOrObj)
        {
            var retList = [];

            if(typeof urlPartOrObj=="string")
            {
                for(var i=0;i<ajaxList.length;i++)
                {
                    if(ajaxList[i].options.url.indexOf(urlPartOrObj)!=-1)
                    {
                        retList.push(ajaxList[i]);
                    }
                }
            }
            else if(urlPartOrObj instanceof Cube.ajaxQueue.ajaxItem)
            {
                retList.push(urlPartOrObj);
            }
            return retList;
        }

        /*
         立即发送请求,优先级提到最高
         @author:jerrewu
         @date:2013-06-13
         @param {String/Object} urlPartOrObj:url的部分字符串或者ajaxItem对象,程序会找到符合要求的所有ajaxItem并产即发送出去
         */
        function sendAjaxNow(urlPartOrObj)
        {
            var selList = getAjaxItemsAsParam(urlPartOrObj);
            for(var i=0;i<selList.length;i++)
            {
                if(selList[i].status=="wait")
                {
                    selList[i].status = "sending";
                    selList[i].priority = 0;
                    addAjaxItem(selList[i].options,0);
                }

                //Cube.ajax(selList[i].options);
            }



        }
        ajaxQueue.sendAjaxNow = sendAjaxNow;
        /*
         从队列中移除某项或者某些项
         @author:jerrewu
         @date:2013-06-13
         @param {String/Object} urlPartOrObj:url的部分字符串或者ajaxItem对象,程序会找到符合要求的所有ajaxItem并产即发送出去
         */
        function cancelAjax(urlPartOrObj)
        {
            var selList = getAjaxItemsAsParam(urlPartOrObj);
            for(var i=0;i<selList.length;i++)
            {
                if(selList[i].status=="wait")
                {
                    selList[i].status = "cancel";
                }

            }
        }
        ajaxQueue.cancelAjax = cancelAjax;
        /*
         从队列中移除某项或者某些项
         @author:jerrewu
         @date:2013-06-13
         */
        function changePriority(urlPartOrObj,newPriority)
        {
            if(newPriority==0)
            {
                sendAjaxNow(urlPartOrObj);
            }
            else
            {
                var selList = getAjaxItemsAsParam(urlPartOrObj);
                for(var i=0;i<selList.length;i++)
                {
                    if(selList[i].status=="wait")
                    {
                        selList[i].priority = newPriority;
                    }

                }
            }

        }
        ajaxQueue.changePriority = changePriority;


        window.Cube = window.Cube || {};
        Cube.ajaxQueue = ajaxQueue;


    }

    )();


