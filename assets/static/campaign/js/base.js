(function($){

    var qs = querystring.decode();

    $(function(){

        // Attempting to fix Google Fonts issue, in Chrome.
        // Read more at https://productforums.google.com/forum/#!topic/chrome/elw8busIfJA
        $('body').hide().show();

        // If the form has been successfully submitted without Ajax, show the success modal
        if('salsa_success' in qs){
            $('[data-action="' + qs['salsa_success'] + '"]').modal();
            showDonateUI();
        }

        //
        if('congress_success' in qs){
            var $action = $('[data-action="' + qs['congress_success'] + '"]');
            if($action.length){
                $(window).scrollTop($action.eq(0).offset().top - 25);
            }
        }

        // Placeholder
        $('input').placeholder();

        // Remove Purpose tracking from social buttons
        var socialSites = ['google-plus', 'facebook', 'tumblr', 'twitter'];
        for (var i in socialSites) {
            var target = '.social-' + socialSites[i],
                $target = $(target);

            if ($target.length === 0) {
                continue;
            }

            $target.attr('href', $(target).attr('href').replace(/%3Ft%3D[\w%]+/, ''));
        }

        // Get Purpose tag
        var tag = $('input[name=tag]').val() || 'untagged';

        // Progress Bar
        if (tag !== 'untagged' && $('#progress-bar-count').length) {
            var url = 'https://fftf-cache.herokuapp.com/signatures?tag='+tag;
            $.getScript(url);

            var $progressBar = $('.progress-bar'),
                $progressBarSignatures = $('.progress-bar-signatures'),
                $progressBarGoal = $('.progress-bar-goal'),
                $progressBarInner = $('.progress-bar-inner'),
                $progressBarCount = $('#progress-bar-count'); 

            window.signaturesCallback = function(res) {
                var count = res.data.count,
                    countUpIsSupported = !!window.requestAnimationFrame;

                var correction = +$progressBarCount.attr('data-number') || 0;

                if (correction)
                    count = count + correction;

                // Animate count.
                if (countUpIsSupported) {
                    new countUp("progress-bar-count", 1, count, 0, 2).start();
                } else {
                    $('#progress-bar-count').text(count);
                }
                $progressBarSignatures.css({
                    opacity: 1
                });

                // Animate bar.
                var goal = +$progressBarGoal.attr('data-number') || 1000;
                if (countUpIsSupported) {
                    new countUp("progress-bar-goal-number", goal, goal, 0, 1).start();
                } else {
                    $('#progress-bar-goal-number').text(goal);
                }
                $progressBarGoal.css({
                    opacity: 1
                });
                var percent = count / goal;
                percent = Math.min(percent, 1);
                percent *= 100;
                $progressBarInner.width(percent + '%');
            }
        }

        // Tracking with Purpose
        if (qs.t) {
            // Actions
            $('form').each(function() {
                var $form = $(this);
                if (!$form.find('[name=t]').length) {
                    var $input = $('<input name="t" type="hidden" />');
                    $input.val(qs.t);
                    $form.append($input);
                }
            });
        }
        

        // When an action form is submitted, attempt to submit it via Ajax, then show its
        // success modal when completed.
        var $actions = $('.action.salsa');
        $actions.each(function() {
            var $action = $(this),
                id = $action.find('[name="action"]').val();

            $action.find('form').bind('submit', function(e){
                var $form = $(this),
                    $buttons = $form.find('button');

                // IE8 & 9.
                if (!$.support.cors) {
                    var $input = $('<input type="hidden" name="redirect" />'),
                        url = location.href.split('?')[0].split('#')[0];
                    $input.val(url + '#thanks');
                    return $form.append($input);
                }

                $buttons.attr('disabled', 'disabled').text('Working...');

                $.post($form.attr('action'), $form.serialize(), function(data){
                    $('[data-action="' + id + '"]').modal();
                    showDonateUI();
                    $buttons.text('Thanks!');
                });

                e.preventDefault();
            });
        });

        if(window.location.hash.indexOf('#thanks') !== -1) {
          $('.modal:first').modal();
          showDonateUI();
        }

        $('figure.video').fitVids();

        
        if(Modernizr.geolocation){

            var $geos = $('form[data-geolocation]');
            $geos.each(function(index, geo){

                var $geo = $(geo),
                    $wrapper = $geo.find('[data-geolocation-wrapper]'),
                    $error = $geo.find('[data-geolocation-error]'),
                    $trigger = $geo.find('[data-geolocation-trigger]');

                $geo.addClass('geo_active');
                $wrapper.removeClass('hidden');

                $trigger.bind('click', function(evt){
                    evt.preventDefault();
                    $trigger.attr('disabled', 'disabled');
                    var process_location = function(position){
                            $geo.find('[name="latitude"]').val(position.coords.latitude);
                            $geo.find('[name="longitude"]').val(position.coords.longitude);
                            $geo.submit();
                        },
                        location_exception = function(code, message){
                            $wrapper.hide();
                            $error.removeClass('hidden');
                            $geo.removeClass('geo_active');
                        };
                    navigator.geolocation.getCurrentPosition(process_location, location_exception);

                });

                $geo.find('form').bind('submit', function(evt){
                    $(this).find('button').attr('disabled', 'disabled');
                });


            });
        }


    });

	var close_modal = false;
	var userAgent = navigator.userAgent;
	var pathname = window.location.href;

    $(document).ready(function() {
        if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/iBlackBerry/i) || userAgent.match(/iAndroid/i) || userAgent.match(/IEMobile/i) || pathname.indexOf("salsa") !== -1 || userAgent.indexOf("android") > -1 || userAgent.indexOf("Android") > -1) {
            $.teenage_modal.close();
		}else if(pathname.indexOf("teenager") > -1 && !close_modal && pathname.indexOf("salsa") === -1){
			close_modal = true;
            setTimeout(function() {
                var token = $("[name=csrfmiddlewaretoken]").val();
                $.teenage_modal("<section class='action salsa' id='salsa-email'><h1 style='color:white'>Sign the petition to get this kid home to his parents:</h1><p style='color:white'>A kid is in prison.&nbsp; Away from his family.&nbsp; We need your help right now&nbsp; --&nbsp; please sign the petition to get him home to his parents and protect free speech:</p><form action='/salsa/' method='POST' class='group'><div style='display:none'><input type='hidden' name='csrfmiddlewaretoken' value='" + token + "' /></div><input type='hidden' name='object' value='supporter' /><input type='hidden' name='organization_KEY' value='501' /><input type='hidden' name='action' value='1' /><div class='hidden'><label for='hp_enabled'><input type='checkbox' checked='checked' id='hp_enabled' name='hp_enabled' /> Do not uncheck this box</label><label for='hp_disabled'><input type='checkbox' id='hp_disabled' name='hp_disabled' /> Do not check this box</label></div><input type='hidden' name='tag' value='Methuen' /><input type='hidden' id='trigger' name='email_trigger_KEYS' value='233' /><div class='field' id='field_email'><label for='id_email' class='hidden'>Email Address</label><input type='email' id='id_email' name='Email' placeholder='Email' pattern='^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[a-z]{2,4}$' required='required' /></div><div class='field buttons'><button type='submit' class='btn btn-success'>Sign Petition</button></div></form><ul class='socials'><a class='social-facebook social-large' href='http://www.facebook.com/sharer.php?u=http%3A%2F%2Fcms.fightforthefuture.org%2Fteenager' title='Share on Facebook' target='_blank'>Share on Facebook</a><a class='social-twitter social-large' href='https://twitter.com/intent/tweet?related=&hashtags=FreeCam&text=After+you+read+this+kid%27s+story%2C+you%27ll+never+post+on+Facebook+again...+Via+%40FightForTheFtr&url=https%3A%2F%2Fcms.fightforthefuture.org%2Fteenager%2F' title='Share on Twitter' target='_blank'>Share on Twitter</a></ul><div class='disclaimer'><p><a href='http://fightforthefuture.org/'>Fight for the Future</a>&nbsp; and&nbsp; <a href='http://thecenterforrights.org/'>Center for Rights</a>&nbsp; will contact you about future campaigns. &nbsp;<a href='http://fightforthefuture.org/privacy/'>Privacy Policy</a></p></div></div></div></section>");
			}, 20000);
		}
		if(pathname.indexOf("teenager") !== -1 && pathname.indexOf("salsa") !== -1) {
			setTimeout(function() {
				$.teenage_modal.close();
				$.modal();
                showDonateUI();
			}, 500)
		}
	});

})(jQuery);

function showDonateUI() {
    if (!$('#fftf_donate_tag').length)
        return console.log('No tag');

    var tag = $('#fftf_donate_tag').html();

    var email = '';
    if ($('#id_email'))
        email = $('#id_email').val();

    var options = {
        tag: tag,
        email: email
    };
    FFTFDonate.init(options).test($('#fftf_donate')[0], 'stripe10_vs_external', [
        {
            name: 'stripe10',
            ui: 'button',
            buttonText: 'Donate $10',
            amount: 10,
            checkoutFlow: 'stripe'
        },
        {
            name: 'external',
            ui: 'button',
            buttonText: 'Donate'
        }
    ]);
}

/*
 * SimpleModal 1.4.4 - jQuery Plugin
 * http://simplemodal.com/
 * Copyright (c) 2013 Eric Martin
 * Licensed under MIT and GPL
 * Date: Sun, Jan 20 2013 15:58:56 -0800
 */
(function(b){"function"===typeof define&&define.amd?define(["jquery"],b):b(jQuery)})(function(b){var j=[],n=b(document),k=navigator.userAgent.toLowerCase(),l=b(window),g=[],o=null,p=/msie/.test(k)&&!/opera/.test(k),q=/opera/.test(k),m,r;m=p&&/msie 6./.test(k)&&"object"!==typeof window.XMLHttpRequest;r=p&&/msie 7.0/.test(k);b.teenage_modal=function(a,h){return b.teenage_modal.impl.init(a,h)};b.teenage_modal.close=function(){b.teenage_modal.impl.close()};b.teenage_modal.focus=function(a){b.teenage_modal.impl.focus(a)};b.teenage_modal.setContainerDimensions=
function(){b.teenage_modal.impl.setContainerDimensions()};b.teenage_modal.setPosition=function(){b.teenage_modal.impl.setPosition()};b.teenage_modal.update=function(a,h){b.teenage_modal.impl.update(a,h)};b.fn.teenage_modal=function(a){return b.teenage_modal.impl.init(this,a)};b.teenage_modal.defaults={appendTo:"body",focus:!0,opacity:50,overlayId:"simplemodal-overlay",overlayCss:{},containerId:"simplemodal-container",containerCss:{},dataId:"simplemodal-data",dataCss:{},minHeight:null,minWidth:null,maxHeight:null,maxWidth:null,autoResize:!1,autoPosition:!0,zIndex:1E3,
close:!0,closeHTML:'<a class="modalCloseImg" title="Close">X</a>',closeClass:"simplemodal-close",escClose:!0,overlayClose:!1,fixed:!0,position:null,persist:!1,modal:!0,onOpen:null,onShow:null,onClose:null};b.teenage_modal.impl={d:{},init:function(a,h){if(this.d.data)return!1;o=p&&!b.support.boxModel;this.o=b.extend({},b.teenage_modal.defaults,h);this.zIndex=this.o.zIndex;this.occb=!1;if("object"===typeof a){if(a=a instanceof b?a:b(a),this.d.placeholder=!1,0<a.parent().parent().size()&&(a.before(b("<span></span>").attr("id",
"simplemodal-placeholder").css({display:"none"})),this.d.placeholder=!0,this.display=a.css("display"),!this.o.persist))this.d.orig=a.clone(!0)}else if("string"===typeof a||"number"===typeof a)a=b("<div></div>").html(a);else return alert("SimpleModal Error: Unsupported data type: "+typeof a),this;this.create(a);this.open();b.isFunction(this.o.onShow)&&this.o.onShow.apply(this,[this.d]);return this},create:function(a){this.getDimensions();if(this.o.teenage_modal&&m)this.d.iframe=b('<iframe src="javascript:false;"></iframe>').css(b.extend(this.o.iframeCss,
{display:"none",opacity:0,position:"fixed",height:g[0],width:g[1],zIndex:this.o.zIndex,top:0,left:0})).appendTo(this.o.appendTo);this.d.overlay=b("<div></div>").attr("id",this.o.overlayId).addClass("simplemodal-overlay").css(b.extend(this.o.overlayCss,{display:"none",opacity:this.o.opacity/100,height:this.o.teenage_modal?j[0]:0,width:this.o.teenage_modal?j[1]:0,position:"fixed",left:0,top:0,zIndex:this.o.zIndex+1})).appendTo(this.o.appendTo);this.d.container=b("<div></div>").attr("id",this.o.containerId).addClass("simplemodal-container").css(b.extend({position:this.o.fixed?
"fixed":"absolute"},this.o.containerCss,{display:"none",zIndex:this.o.zIndex+2})).append(this.o.close&&this.o.closeHTML?b(this.o.closeHTML).addClass(this.o.closeClass):"").appendTo(this.o.appendTo);this.d.wrap=b("<div></div>").attr("tabIndex",-1).addClass("simplemodal-wrap").css({height:"100%",outline:0,width:"100%"}).appendTo(this.d.container);this.d.data=a.attr("id",a.attr("id")||this.o.dataId).addClass("simplemodal-data").css(b.extend(this.o.dataCss,{display:"none"})).appendTo("body");this.setContainerDimensions();
this.d.data.appendTo(this.d.wrap);(m||o)&&this.fixIE()},bindEvents:function(){var a=this;b("."+a.o.closeClass).bind("click.simplemodal",function(b){b.preventDefault();a.close()});a.o.teenage_modal&&a.o.close&&a.o.overlayClose&&a.d.overlay.bind("click.simplemodal",function(b){b.preventDefault();a.close()});n.bind("keydown.simplemodal",function(b){a.o.teenage_modal&&9===b.keyCode?a.watchTab(b):a.o.close&&a.o.escClose&&27===b.keyCode&&(b.preventDefault(),a.close())});l.bind("resize.simplemodal orientationchange.simplemodal",
function(){a.getDimensions();a.o.autoResize?a.setContainerDimensions():a.o.autoPosition&&a.setPosition();m||o?a.fixIE():a.o.teenage_modal&&(a.d.iframe&&a.d.iframe.css({height:g[0],width:g[1]}),a.d.overlay.css({height:j[0],width:j[1]}))})},unbindEvents:function(){b("."+this.o.closeClass).unbind("click.simplemodal");n.unbind("keydown.simplemodal");l.unbind(".simplemodal");this.d.overlay.unbind("click.simplemodal")},fixIE:function(){var a=this.o.position;b.each([this.d.iframe||null,!this.o.teenage_modal?null:this.d.overlay,
"fixed"===this.d.container.css("position")?this.d.container:null],function(b,e){if(e){var f=e[0].style;f.position="absolute";if(2>b)f.removeExpression("height"),f.removeExpression("width"),f.setExpression("height",'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"'),f.setExpression("width",'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"');else{var c,d;a&&a.constructor===
Array?(c=a[0]?"number"===typeof a[0]?a[0].toString():a[0].replace(/px/,""):e.css("top").replace(/px/,""),c=-1===c.indexOf("%")?c+' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"':parseInt(c.replace(/%/,""))+' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',a[1]&&(d="number"===typeof a[1]?
a[1].toString():a[1].replace(/px/,""),d=-1===d.indexOf("%")?d+' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"':parseInt(d.replace(/%/,""))+' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"')):(c='(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"',
d='(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"');f.removeExpression("top");f.removeExpression("left");f.setExpression("top",c);f.setExpression("left",d)}}})},focus:function(a){var h=this,a=a&&-1!==b.inArray(a,["first","last"])?a:"first",e=b(":input:enabled:visible:"+a,h.d.wrap);setTimeout(function(){0<e.length?e.focus():h.d.wrap.focus()},
10)},getDimensions:function(){var a="undefined"===typeof window.innerHeight?l.height():window.innerHeight;j=[n.height(),n.width()];g=[a,l.width()]},getVal:function(a,b){return a?"number"===typeof a?a:"auto"===a?0:0<a.indexOf("%")?parseInt(a.replace(/%/,""))/100*("h"===b?g[0]:g[1]):parseInt(a.replace(/px/,"")):null},update:function(a,b){if(!this.d.data)return!1;this.d.origHeight=this.getVal(a,"h");this.d.origWidth=this.getVal(b,"w");this.d.data.hide();a&&this.d.container.css("height",a);b&&this.d.container.css("width",
b);this.setContainerDimensions();this.d.data.show();this.o.focus&&this.focus();this.unbindEvents();this.bindEvents()},setContainerDimensions:function(){var a=m||r,b=this.d.origHeight?this.d.origHeight:q?this.d.container.height():this.getVal(a?this.d.container[0].currentStyle.height:this.d.container.css("height"),"h"),a=this.d.origWidth?this.d.origWidth:q?this.d.container.width():this.getVal(a?this.d.container[0].currentStyle.width:this.d.container.css("width"),"w"),e=this.d.data.outerHeight(!0),f=
this.d.data.outerWidth(!0);this.d.origHeight=this.d.origHeight||b;this.d.origWidth=this.d.origWidth||a;var c=this.o.maxHeight?this.getVal(this.o.maxHeight,"h"):null,d=this.o.maxWidth?this.getVal(this.o.maxWidth,"w"):null,c=c&&c<g[0]?c:g[0],d=d&&d<g[1]?d:g[1],i=this.o.minHeight?this.getVal(this.o.minHeight,"h"):"auto",b=b?this.o.autoResize&&b>c?c:b<i?i:b:e?e>c?c:this.o.minHeight&&"auto"!==i&&e<i?i:e:i,c=this.o.minWidth?this.getVal(this.o.minWidth,"w"):"auto",a=a?this.o.autoResize&&a>d?d:a<c?c:a:f?
f>d?d:this.o.minWidth&&"auto"!==c&&f<c?c:f:c;this.d.container.css({height:b,width:a});this.d.wrap.css({overflow:e>b||f>a?"auto":"visible"});this.o.autoPosition&&this.setPosition()},setPosition:function(){var a,b;a=g[0]/2-this.d.container.outerHeight(!0)/2;b=g[1]/2-this.d.container.outerWidth(!0)/2;var e="fixed"!==this.d.container.css("position")?l.scrollTop():0;this.o.position&&"[object Array]"===Object.prototype.toString.call(this.o.position)?(a=e+(this.o.position[0]||a),b=this.o.position[1]||b):
a=e+a;this.d.container.css({left:b,top:a})},watchTab:function(a){if(0<b(a.target).parents(".simplemodal-container").length){if(this.inputs=b(":input:enabled:visible:first, :input:enabled:visible:last",this.d.data[0]),!a.shiftKey&&a.target===this.inputs[this.inputs.length-1]||a.shiftKey&&a.target===this.inputs[0]||0===this.inputs.length)a.preventDefault(),this.focus(a.shiftKey?"last":"first")}else a.preventDefault(),this.focus()},open:function(){this.d.iframe&&this.d.iframe.show();b.isFunction(this.o.onOpen)?
this.o.onOpen.apply(this,[this.d]):(this.d.overlay.show(),this.d.container.show(),this.d.data.show());this.o.focus&&this.focus();this.bindEvents()},close:function(){if(!this.d.data)return!1;this.unbindEvents();if(b.isFunction(this.o.onClose)&&!this.occb)this.occb=!0,this.o.onClose.apply(this,[this.d]);else{if(this.d.placeholder){var a=b("#simplemodal-placeholder");this.o.persist?a.replaceWith(this.d.data.removeClass("simplemodal-data").css("display",this.display)):(this.d.data.hide().remove(),a.replaceWith(this.d.orig))}else this.d.data.hide().remove();
this.d.container.hide().remove();this.d.overlay.hide();this.d.iframe&&this.d.iframe.hide().remove();this.d.overlay.remove();this.d={}}}}});
