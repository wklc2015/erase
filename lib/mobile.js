+(function($) {
	'use strict';

	var Mobile = (function() {
		var isMobile = false;
		var sUserAgent = navigator.userAgent.toLowerCase();
		var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
		var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
		var bIsMidp = sUserAgent.match(/midp/i) == "midp";
		var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
		var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
		var bIsAndroid = sUserAgent.match(/android/i) == "android";
		var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
		var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
		if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
			isMobile = true;
		}
		return {
			check: isMobile,
			eventName: {
				start: isMobile ? 'touchstart' : 'mousedown',
				move: isMobile ? 'touchmove' : 'mousemove',
				end: isMobile ? 'touchend' : 'mouseup',
				tap: isMobile ? 'touchstart' : 'click'
			}
		};
	}())

	$.fn.isMobile = Mobile.check;

	$.fn.mobileEvent = Mobile.eventName;
}(jQuery))