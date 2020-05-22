var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-15543008-1']);
_gaq.push(['_trackPageview']);
(function () {
	if (document.location.protocol != 'file:') {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	}
})();

(function (d, w, c) {
  (w[c] = w[c] || []).push(function () {
    try {
      w.yaCounter2199583 = new Ya.Metrika2({
        id: 2199583,
        webvisor: true,
        triggerEvent: true,
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        trackHash:true,
        params: {},
        ecommerce:"dataLayer"
      });
    } catch(e) {}
	});
  var n = d.getElementsByTagName("script")[0],
    s = d.createElement("script"),
    f = function () { n.parentNode.insertBefore(s, n); };
  s.type = "text/javascript";
  s.async = true;
  s.src = "https://mc.yandex.ru/metrika/tag.js";

  if (w.opera == "[object Opera]") {
    d.addEventListener("DOMContentLoaded", f, false);
  } else { f(); }
})(document, window, "yandex_metrika_callbacks2");


// [96277] Отправлять события в метрику из читалки фрагмента WEB/PDA
/*
  Отправка цели Яндекс.Метрики
*/
function sendReachGoal(goal, callbackFunction) {
	callbackFunction = callbackFunction || function() {};

	if(goal){
		try {
			yaCounter2199583.reachGoal(goal, undefined, callbackFunction);
		} catch(e) {
			console.error(e.message);
			callbackFunction();
		}
	} else {
		callbackFunction();
	}
}
/*
  Создание объекта для отслеживания измений в DOM
*/
function createTrackingNode(trackingNode, work) {
  var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true };
  var target =  document.querySelector(trackingNode);
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) { 
      try {
        work.call(null, mutation);
      } catch(e) {
        console.error(e.message);
      }      
    })
  });
  if(target) { 
    return observer.observe(target, config);
  } else {
    return false;
  }
}
/*
  Возвращает событие с указанными страницами (7, 13, 25, 49) и сохраняет их для предотвращения повторного отправления  
*/
function detectPageNumber(num) {
  var pageNumbers = [7, 13, 25, 49];
  if(pageNumbers.indexOf(Number(num)) != -1) {
    var sendNumber = 'ReadPages' + (num - 1).toString();
    if(sessionStorage.getItem(sendNumber)) {
      return false;
    } else {
      sessionStorage.setItem(sendNumber, 'true');
      return sendNumber;
    }
  }
}
/*
  Возвращает событие с указанными процентами (16, 8, 4, 2) и сохраняет их для предотвращения повторного отправления  
*/
function detectPagePercent(number) {
  var maxPage = document.getElementById('pager-max').innerText;
  var percent = (Number(number) / Number(maxPage)) * 100;
  for(var i = 4; i > 0; i--) {
    if(!sessionStorage.getItem('ReadPercent' + Math.pow(2,i).toString())) {
      if(percent > Math.pow(2,i)) {
        sessionStorage.setItem('ReadPercent' + Math.pow(2,i).toString(), 'true');
        return 'ReadPercent' + Math.pow(2,i).toString();
      }  
    }
  }
  return false;
}
/*
  Возвращает хранимое событие, прочтенное в процентах, с максимальным индексом
*/
function sendProcentOnClick() {
  var keys = [];
  for(var key in sessionStorage) {
    if(key.indexOf('ReadPercent') === 0) keys.push(Number(key.substr(11)));
  }
  if(keys.length > 0) {
    return 'BuyFragment' + Math.max.apply(null, keys).toString();
  } else {
    return false;
  }  
}
/*
  Проверка наличия ключа or_buy_dialog в хранилище
*/
function detectFinishBuyButton() {
  if(!sessionStorage.getItem('or_buy_dialog')) {
    sendReachGoal('or_buy_dialog');
    sessionStorage.setItem('or_buy_dialog', true);
    return true;
  } else {
    return false;
  }
}
/*
  Возвращение ID книги с использованием класса URLparserClass модуля URLParser
*/
function getArtId() {
  try {
    var getArtURL = new window.URLparser.URLparserClass();
    return getArtURL.ArtID;
  } catch(e) {
    console.error(e.message);
    return false;
  }
}
/*
  Очистка хранилища при обновлении книги
*/
function clearAdvStorage(artID) {
  if(!sessionStorage.getItem('artID')) {
    sessionStorage.setItem('artID', artID);
  } else {
    if(sessionStorage.getItem('artID') !== artID) {
      for(var key in sessionStorage) {
        if(key.indexOf('ReadP') === 0 || key.indexOf('or_') === 0) sessionStorage.removeItem(key);
      }
    }
  }  
}
  
function sendMessage(maxPage) {
  var artID = getArtId();
  clearAdvStorage(artID);
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var curPage = document.getElementById('pager-current');
  var maxPage = document.getElementById('pager-max');
  if(!MutationObserver) {
    curPage.addEventListener('DOMNodeInserted', function() {
      if(Number(maxPage.innerText) > 10) {
        sendReachGoal(detectPageNumber(curPage.innerText));
        sendReachGoal(detectPagePercent(curPage.innerText));
      }
      if(curPage.innerText == maxPage.innerText) {
        detectFinishBuyButton();
      }
    }, false);
  } else {
    var currentPageChange = createTrackingNode('#pager-current', function(mutation){
      if(Number(maxPage.innerText) > 10) {
        // Отправка событий Прочитанная страница и Прочитанный процент в Яндекс.Метрику 
        sendReachGoal(detectPageNumber(mutation.target.innerText));
        sendReachGoal(detectPagePercent(mutation.target.innerText));
        //Отправка события об окончании чтения фрагмента
        if(mutation.target.innerText === maxPage.innerText) {
          detectFinishBuyButton();
        }
      }
    });
  }
  // Отслеживание нажатия на кнопку "Купить в верхней части окна"
  var buyBookElement = document.getElementById('buy-book');
  buyBookElement.addEventListener("click", function(event) {event.preventDefault(); sendReachGoal(sendProcentOnClick(), function() {
  	window.location.href = buyBookElement.getAttribute('href');
  })});
}

if(document.readyState === "complete") { sendMessage(); } 
else { document.addEventListener("DOMContentLoaded", function(event) { sendMessage(); }, false); }
