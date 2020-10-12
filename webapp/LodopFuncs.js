var CreatedOKLodop7766=null;

//====判断是否需要安装CLodop云打印服务器:====
function needCLodop(){
    try{
	var ua=navigator.userAgent;
	if (ua.match(/Windows\sPhone/i) !=null) return true;
	if (ua.match(/iPhone|iPod/i) != null) return true;
	if (ua.match(/Android/i) != null) return true;
	if (ua.match(/Edge\D?\d+/i) != null) return true;
	
	var verTrident=ua.match(/Trident\D?\d+/i);
	var verIE=ua.match(/MSIE\D?\d+/i);
	var verOPR=ua.match(/OPR\D?\d+/i);
	var verFF=ua.match(/Firefox\D?\d+/i);
	var x64=ua.match(/x64/i);
	if ((verTrident==null)&&(verIE==null)&&(x64!==null)) 
		return true; else
	if ( verFF !== null) {
		verFF = verFF[0].match(/\d+/);
		if ((verFF[0]>= 42)||(x64!==null)) return true;
	} else 
	if ( verOPR !== null) {
		verOPR = verOPR[0].match(/\d+/);
		if ( verOPR[0] >= 32 ) return true;
	} else 
	if ((verTrident==null)&&(verIE==null)) {
		var verChrome=ua.match(/Chrome\D?\d+/i);		
		if ( verChrome !== null ) {
			verChrome = verChrome[0].match(/\d+/);
			if (verChrome[0]>=42) return true;
		};
	};
        return false;
    } catch(err) {return true;};
};

//====页面引用CLodop云打印必须的JS文件：====
if (needCLodop()) {
	var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
	var oscript = document.createElement("script");
	oscript.src ="http://localhost:8000/CLodopfuncs.js?priority=1";
	head.insertBefore( oscript,head.firstChild );

	//引用双端口(8000和18000）避免其中某个被占用：
	oscript = document.createElement("script");
	oscript.src ="http://localhost:18000/CLodopfuncs.js?priority=0";
	head.insertBefore( oscript,head.firstChild );
};

//====获取LODOP对象的主过程：====
function getLodop(oOBJECT,oEMBED){
	var strHtmInstall="install_lodop32.exe";
    var strHtmUpdate="install_lodop32.exe";
    var strHtm64_Install="install_lodop64.exe";
    var strHtm64_Update="install_lodop64.exe";
    var strCLodopInstall="CLodop_Setup_for_Win32NT.exe";
    var strCLodopUpdate="CLodop_Setup_for_Win32NT.exe";
    var LODOP;
    try{
        var isIE = (navigator.userAgent.indexOf('MSIE')>=0) || (navigator.userAgent.indexOf('Trident')>=0);
        if (needCLodop()) {
            try{ LODOP=getCLodop();} catch(err) {};
            
	    if (!LODOP && document.readyState!=="complete") {return;};
            if (!LODOP) {
				 if (isIE) $("#plugin a").attr("href",strCLodopInstall); else
					 $("#plugin a").attr("href",strCLodopInstall)
				return;
            } else {

				 if (CLODOP.CVERSION<"3.0.0.8") { 
					 if (isIE) $("#plugin a").attr("href",strCLodopUpdate); else
						 $("#plugin a").attr("href",strCLodopUpdate);
				 };
				if (oEMBED && oEMBED.parentNode) oEMBED.parentNode.removeChild(oEMBED);
				if (oOBJECT && oOBJECT.parentNode) oOBJECT.parentNode.removeChild(oOBJECT);	
			};
        } else {
            var is64IE  = isIE && (navigator.userAgent.indexOf('x64')>=0);
            //=====如果页面有Lodop就直接使用，没有则新建:==========
            if (oOBJECT!=undefined || oEMBED!=undefined) {
                if (isIE) LODOP=oOBJECT; else  LODOP=oEMBED;
            } else if (CreatedOKLodop7766==null){
                LODOP=document.createElement("object");
                LODOP.setAttribute("width",0);
                LODOP.setAttribute("height",0);
                LODOP.setAttribute("style","position:absolute;left:0px;top:-100px;width:0px;height:0px;");
                if (isIE) LODOP.setAttribute("classid","clsid:2105C259-1E0C-4534-8141-A753534CB4CA");
                else LODOP.setAttribute("type","application/x-print-lodop");
                document.documentElement.appendChild(LODOP);
                CreatedOKLodop7766=LODOP;
             } else LODOP=CreatedOKLodop7766;
            //=====Lodop插件未安装时提示下载地址:==========
            if ((LODOP==null)||(typeof(LODOP.VERSION)=="undefined")) {
//                  if (navigator.userAgent.indexOf('Chrome')>=0)
//                	  $("#plugin a").attr("href",strHtmChrome); document.getElementById("plugin").innerHTML=strHtmChrome;
//                  if (navigator.userAgent.indexOf('Firefox')>=0)
                	 // document.getElementById("plugin").innerHTML=strHtmFireFox;
                  if (is64IE) $("#plugin a").attr("href",strHtm64_Install); else
                  if (isIE)   $("#plugin a").attr("href",strHtmInstall);    else
                	  $("#plugin a").attr("href",strHtmInstall);
                return LODOP;
            };
        };
        if (LODOP.VERSION<"6.2.2.0") {
             if (!needCLodop()){
            	 if (is64IE) $("#plugin a").attr("href",strHtm64_Update); else
            	 if (isIE) $("#plugin a").attr("href",strHtmUpdate); else
            		 $("#plugin a").attr("href",strHtmUpdate);
			 };
            return LODOP;
        };
        //===如下空白位置适合调用统一功能(如注册语句、语言选择等):===

        //===========================================================
        return LODOP;
    } catch(err) {};
};

