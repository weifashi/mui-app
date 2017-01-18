/*
 * 
 * ===========common.js（各种封装好的类）	===============
 * 
 */
var common = {
	Url: function(dom,url, top, bottom) { //common.Url(url, top, bottom)
		//打开新页面
		if(!top) {
			top = 0;
		};
		if(!bottom) {
			bottom = 0;
		}
		document.querySelector(dom).addEventListener('tap',function  () {
				mui.openWindow({
					url: url,
					styles: {
						top: top, //新页面顶部位置
						bottom: bottom, //新页面底部位置
					},
					show: {
						autoShow: true, //页面loaded事件发生后自动显示，
						aniShow: "slide-in-right",
						duration: 300 //页面动画持续时间，
					},
					waiting: {
						autoShow: true, //自动显示等待框，默认为true
						title: '正在加载...', //等待对话框上显示的提示内容
					}
			});
		});
	},
	scroll: function() {// common.scroll()
		//区域滚动 
		mui('#scroll').scroll({indicators: true});
		mui('.mui-scroll-wrapper').scroll({deceleration: 0.0006});
	},
	menu:function  (dom,url) {// common.menu("#id","ce.html");
	//侧滑窗口；
		//生成2个对象分别控制主窗口和菜单窗口；
        var menu = null,main = null;
        var showMenu = false;
        var isInTransition = false;
        //开始预加载菜单页；
        mui.plusReady(function() {
            main = plus.webview.currentWebview();
            main.addEventListener('maskClick', closeMenu);
            //处理侧滑导航，为了避免和子页面初始化等竞争资源，延迟加载侧滑页面；
            setTimeout(function() {
                menu = mui.preload({
                    id: url,
                    url: url,
                    styles: {
                        left: 0,
                        width: '70%',
                        zindex: -99
                    }
                });
            }, 0);
        });
        //打开侧滑窗口；
        function openMenu() {
            if (isInTransition) {
                return;
            };
            if (!showMenu) {
                //侧滑菜单处于隐藏状态，则立即显示出来；
                isInTransition = true;
                menu.show(0, 0, function() {
                	//主窗体开始侧滑并显示遮罩
                    main.setStyle({
                    	mask: 'rgba(0,0,0,0.4)',
                        left: '70%',
                        transition: {
                       	 	duration: 100
                    	}
                    });
                    mui.later(function() {
                        isInTransition = false;
                        menu.setStyle({
                            mask: "none",
                            zindex: -99
                        }); //移除menu的mask
                    }, 200);
                    showMenu = true;
                });
            }
        };
        //关闭侧滑窗口；
        function closeMenu() {
            if (isInTransition) {
                return;
            };
            if (showMenu) {
                //关闭遮罩；
                //主窗体开始侧滑；
                isInTransition = true;
                main.setStyle({
                    mask: 'none',
                    left: '0',
                    transition: {
                        duration: 200
                    }
                });
                showMenu = false;
                //等动画结束后，隐藏菜单webview，节省资源；
                mui.later(function() {
                    isInTransition = false;
//                  menu.hide();
                }, 200);
            };
        };
     	document.querySelector(dom).addEventListener('tap', openMenu);  
	},
	refresh:function  (url,top,bottom) {// common.refresh(url,top,bottom);
		//打开子页面
		mui.init({
		    subpages:[{
		      url:url,//子页面HTML地址，支持本地地址和网络地址
		      id:url,//子页面标志
		       styles:{
       			top:top,//子页面顶部位置
       			bottom:bottom,//子页面底部位置
      			}
		    }]
		});
	},
	pullRefresh:function  (dom,True,fun) {// common.pullRefresh(dom,True,fun);
		//下拉刷新
		if(!True){
			True=false;
		};
		mui.init({
		  pullRefresh : {
		    container:dom,
		    down : {
		      height:50,//可选,默认50.触发下拉刷新拖动距离,
		      auto: True,//可选,默认false.自动下拉刷新一次
		      contentdown : "下拉刷新",
		      contentover : "释放刷新",
		      contentrefresh : "正在刷新...",
		      callback :function  () {
		      	if(fun){
		      		var pullRefresh=function  () {
		      			mui(dom).pullRefresh().endPulldownToRefresh();
		      		};
		      		fun(pullRefresh);
		      	};
		      }
		  	}
		  }
		});
	},
	subpages:function  (arr) {//common.subpages(["url1","url2"]);
		//导航切换子页面
		mui.plusReady(function() {
				var self = plus.webview.currentWebview();
				// 子窗口地址数组
				var subpages = arr;
				// 子窗口样式
				var subStyles = {
					top: "45px",
					bottom: "50px"
				};
				// 子窗口数量
				var subLen = subpages.length;
				// 子窗口对象数组
				var subWvs = [];
				// 标题栏
				var title = document.querySelector(".mui-title");
				// 底部选项
				var tabs = document.querySelectorAll(".mui-tab-item");
				// 底部文字
				var labels = document.querySelectorAll(".mui-tab-label");
				// 当前页面索引，初始化为0；
				var activeIndex = 0;
				// 目标页面索引，初始化为当前页面索引；
				var targetIndex = activeIndex;
				// 创建子页面
				for(var i = 0; i < subLen; i++) {
					/**
					 * 创建窗口对象，并将索引做为额外的参数传递；
					 */
					var subWv = plus.webview.create(subpages[i], cutWebviewId(subpages[i]), subStyles, {
						index: i
					});
					// 窗口对象添加至数组
					subWvs.push(subWv);
					if(i > 0) {
						/**
						 * 隐藏非第一页的窗口对象
						 */
						subWv.hide("none");
					}
					/**
					 * 向父窗口添加子窗口
					 */
					self.append(subWv);
				}
				// 底部选项卡点击切换事件
				for(var j = 0, jlen = tabs.length; j < jlen; j++) {
					tabs[j].addEventListener("tap", function() {
						// 获取当前结点的索引
						targetIndex = this.getAttribute("data-index");
						// 转换为number类型
						targetIndex = parseInt(targetIndex, 10);
						if(targetIndex == activeIndex) {
							return;
						}
						// 切换页面
						switchPage("tap", activeIndex, targetIndex);
					});
				}
				/**
				 * 切换页面
				 * @param {String} _event 事件类型
				 * @param {Number} _active 当前页面索引
				 * @param {Number} _target 目标页面索引
				 */
				function switchPage(_event, _active, _target) {
					/**
					 * 目标页面展示
					 */
					subWvs[_target].show("fade-in");
					// 顶部文字替换
					title.innerText = labels[_target].innerText;
					// 如果是滑动事件，则手动切换高亮选项；
					if(_event == "switch") {
						tabs[_active].classList.remove("mui-active");
						tabs[_target].classList.add("mui-active");
					}
					// 之前展示的页面隐藏
					subWvs[_active].hide("none");
					// 更新当前页索引
					activeIndex = _target;
				}
			});
			/**
			 * 截取url地址，获取窗口的id；
			 * @param {String} url html文件的路径
			 * @param {String} wvId webviewObject的id
			 */
			function cutWebviewId(url) {
				var startIndex = url.lastIndexOf("/");
				var endIndex = url.lastIndexOf(".html");
				var wvId = url.substring(startIndex + 1, endIndex);
				return wvId;
		}
	}
}