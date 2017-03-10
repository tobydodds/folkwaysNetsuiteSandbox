/*jshint laxcomma:true*/
var SC = window.SC = { //ENVIRONMENT: {}
	ENVIRONMENT: {
		jsEnvironment: 'browser' //(typeof nsglobal === 'undefined') ? 'browser' : 'server'
	}
,	isCrossOrigin: function() { return false; }
,	isPageGenerator: function() { return false; }
,	getSessionInfo: function(key)
	{
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
 };

// Server Environment Info
SC.ENVIRONMENT = {
		"baseUrl":"/test/checkout/{{file}}"
	,	"currentHostString":"checkout.netsuite.com"
	,	"availableHosts":[]
	,	"availableLanguages":[
			{"isdefault":"T","languagename":"English (U.S.)","locale":"en_US","name":"English (U.S.)"}
		,	{"languagename":"Español (España)","name":"Español (España)","locale":"es_ES"}
		]
	,	"availableCurrencies":[
			{"internalid":"1","code":"USD","currencyname":"US Dollar","name":"US Dollar"}
		,	{"internalid":"2","code":"GBP","currencyname":"British pound","name":"British pound"}
		]
	,	"companyId":"3563497"
	,	"currentCurrency":{"internalid":"1","code":"USD","currencyname":"US Dollar","name":"US Dollar"}
	,	"currentLanguage":{"isdefault":"T","languagename":"English (U.S.)","locale":"en_US","name":"English (U.S.)"}
	,	"currentPriceLevel":"4"
	};

SC.SESSION = {
	currency: {"symbol":"$","symbolplacement":1,"isdefault":"T","name":"US Dollar","internalid":"1","code":"USD","currencyname":"US Dollar"}
,	language: {"isdefault":"T","languagename":"English (U.S.)","locale":"en_US","name":"English (U.S.)"}
,	priceLevel: "5"
,	touchpoints: {"register":"/c.3921516/checkout/login.ssp?n=2&sc=13&login=T&reset=T&newcust=T","home":"http://dev8.oloraqa.com?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17","logout":"/c.3921516/ShopFlow/logOut.ssp?n=2&sc=13&logoff=T&ckabandon=vkBOgn3gAXN3ugbX","viewcart":"http://dev8.oloraqa.com/ShopFlow/goToCart.ssp?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17","continueshopping":"http://dev8.oloraqa.com/?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17","serversync":"http://dev8.oloraqa.com/app/site/backend/syncidentity.nl?c=3921516&n=2&ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&chrole=17","login":"/c.3921516/checkout/login.ssp?n=2&sc=13&login=T","welcome":"http://dev8.oloraqa.com/s.nl?sc=11&ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17","checkout":"/c.3921516/checkout/index-local.ssp?n=2&sc=13","customercenter":"https://checkout.netsuite.com/c.3921516/MyAccount/index.ssp?n=2&sc=6"}
};

// Site Settings Info
SC.ENVIRONMENT.siteSettings = {
		"requireshippinginformation":"T"
	,	"currencies":[
				{"internalid":"1","code":"USD","currencyname":"US Dollar","name":"US Dollar"}
			,	{"internalid":"2","code":"GBP","currencyname":"British pound","name":"British pound"}
			]
	,	"sitelanguage":[
			{"isdefault":"T","languagename":"English (U.S.)","locale":"en_US","name":"English (U.S.)"}
		,	{"languagename":"Español (España)","name":"Español (España)","locale":"es_ES"}
		]
	,	"defaultshipcountry":null
	,	"defaultshippingmethod":null
	,	"iswebstoreoffline":"F"
	,	"siteregion":[
			{
					"internalid":"1"
				,	"isdefault":"T"
				,	"displayname":"Parent Company"
				,	"name":"Parent Company"
			}
		]
	,	"id":4
	,	"languages":[
			{"isdefault":"T","languagename":"English (U.S.)","locale":"en_US","name":"English (U.S.)"}
		,	{"languagename":"Español (España)","name":"Español (España)","locale":"es_ES"}
		]
	,	"defaultshippingcountry":null
	,	"order":{"upselldisplay":"ONLY_RELATED_ITEMS","outofstockbehavior":"ENABLENMSG","outofstockitems":"ENABLENMSG"}
	,	"siteloginrequired":"F"
	,	"subsidiaries":[{"internalid":"1","isdefault":"T","displayname":"Parent Company","name":"Parent Company"}]
	,	"entrypoints":{
				"register":"#register"
			,	"home":"#home"
			,	"logout":"#logout"
			,	"viewcart":"#viewcart"
			,	"continueshopping":"#continueshopping"
			,	"serversync":"#serversync"
			,	"login":"#login"
			,	"welcome":"#welcome"
			,	"checkout":"#checkout"
			,	"customercenter":"#customercenter"
		}
	,	"siteid":4
	,	"loginrequired":"F"
	,	"paymentmethods":[
				{"ispaypal":"F","name":"VISA","creditcard":"T","internalid":"5"}
			,	{"ispaypal":"F","name":"Master Card","creditcard":"T","internalid":"4"}
			,	{"paypalemailaddress":"paypalmerchant@williams.com","ispaypal":"T","name":"test Paypal Account","creditcard":"F","internalid":"10"}
			]
	,	"cookiepolicy":""
	,	"pricesincludevat":"F"
	,	"shipstoallcountries":"F"
	,	"facetfield":[{"facetfieldid":"custitem_test_checkbox"},{"facetfieldid":"pricelevel5"}]
	,	"registration":{"registrationanonymous":"F","registrationmandatory":"F","registrationoptional":"F","companyfieldmandatory":"F","registrationallowed":"T","displaycompanyfield":"F","requirecompanyfield":"F","showcompanyfield":"F"}
	,	"sitecurrency":[
				{"internalid":"1","code":"USD","currencyname":"US Dollar","name":"US Dollar"}
			,	{"internalid":"2","code":"GBP","currencyname":"British pound","name":"British pound"}
			,	{"internalid":"3","code":"CAD","isdefault":"T","currencyname":"Canadian Dollar","name":"Canadian Dollar"}
			,	{"internalid":"4","code":"EUR","currencyname":"Euro","name":"Euro"}
		]
	,	"sitetype":"ADVANCED"
	,	"analytics":{"clickattributes":null,"analyticssubmitattributes":null,"confpagetrackinghtml":"","submitattributes":null,"analyticsclickattributes":null}
	,	"includevatwithprices":"F"
	,	"touchpoints":{
				"register":"#register"
			,	"home":"#home"
			,	"logout":"#logout"
			,	"viewcart":"#viewcart"
			,	"continueshopping":"#continueshopping"
			,	"serversync":"#serversync"
			,	"login":"#login"
			,	"welcome":"#welcome"
			,	"checkout":"#checkout"
			,	"customercenter":"#customercenter"
		}
	,	"shiptocountries":["CA","MX","TG","US","UY"]
	,	"loginallowed":"T"
	,	"shipstocountries":["CA","MX","TG","US","UY"]
	,	"requireloginforpricing":"F"
	,	"showshippingestimator":"F"
	,	"defaultpricelevel":"5"
	,	"imagesizes":null
	,	"shipallcountries":"F"
	,	"checkout":{
				"showpurchaseorder":"F"
			,	"google":{"available":"F"}
			,	"termsandconditions":"Terms"
			,	"showsavecreditinfo":"F"
			,	"showsavecc":"F"
			,	"showpofieldonpayment":"F"
			,	"requiretermsandconditions":"T"
			,	"requestshippingaddressfirst":"F"
			,	"saveccinfo":"F"
			,	"paymentmandatory":"F"
			,	"shippingaddrfirst":"F"
			,	"hidepaymentpagewhennobalance":"T"
			,	"requireccsecuritycode":"T"
			,	"paypalexpress":{"available":"F"}
			,	"termsandconditionshtml":"<p>Terms</p>"
			,	"savecreditinfo":"F"
			,	"custchoosespaymethod":"T"
		}
	,	"showcookieconsentbanner":"T"
	,	"showextendedcart":"F"
	,	"displayname":"Checkout Test"
	,	"shippingrequired":"T"
	,	"sortfield":[
					{"sortfieldname":"pricelevel5","sortdirection":"ASCENDING","sortorder":"0"}
				,	{"sortfieldname":"relevance","sortdirection":"ASCENDING","sortorder":"1"}
				]
	,	"countries":{"CA":{"name":"Canada","code":"CA","states":[{"name":"Alberta","code":"AB"},{"name":"British Columbia","code":"BC"},{"name":"Manitoba","code":"MB"},{"name":"New Brunswick","code":"NB"},{"name":"Newfoundland","code":"NL"},{"name":"Northwest Territories","code":"NT"},{"name":"Nova Scotia","code":"NS"},{"name":"Nunavut","code":"NU"},{"name":"Ontario","code":"ON"},{"name":"Prince Edward Island","code":"PE"},{"name":"Quebec","code":"QC"},{"name":"Saskatchewan","code":"SK"},{"name":"Yukon","code":"YT"}]},"MX":{"name":"Mexico","code":"MX","states":[{"name":"Aguascalientes","code":"AGS"},{"name":"Baja California Norte","code":"BCN"},{"name":"Baja California Sur","code":"BCS"},{"name":"Campeche","code":"CAM"},{"name":"Chiapas","code":"CHIS"},{"name":"Chihuahua","code":"CHIH"},{"name":"Coahuila","code":"COAH"},{"name":"Colima","code":"COL"},{"name":"Distrito Federal","code":"DF"},{"name":"Durango","code":"DGO"},{"name":"Guanajuato","code":"GTO"},{"name":"Guerrero","code":"GRO"},{"name":"Hidalgo","code":"HGO"},{"name":"Jalisco","code":"JAL"},{"name":"Michoacán","code":"MICH"},{"name":"Morelos","code":"MOR"},{"name":"México (Estado de)","code":"MEX"},{"name":"Nayarit","code":"NAY"},{"name":"Nuevo León","code":"NL"},{"name":"Oaxaca","code":"OAX"},{"name":"Puebla","code":"PUE"},{"name":"Querétaro","code":"QRO"},{"name":"Quintana Roo","code":"QROO"},{"name":"San Luis Potosí","code":"SLP"},{"name":"Sinaloa","code":"SIN"},{"name":"Sonora","code":"SON"},{"name":"Tabasco","code":"TAB"},{"name":"Tamaulipas","code":"TAMPS"},{"name":"Tlaxcala","code":"TLAX"},{"name":"Veracruz","code":"VER"},{"name":"Yucatán","code":"YUC"},{"name":"Zacatecas","code":"ZAC"}]},"TG":{"name":"Togo","code":"TG"},"US":{"name":"United States","code":"US","states":[{"name":"Alabama","code":"AL"},{"name":"Alaska","code":"AK"},{"name":"Arizona","code":"AZ"},{"name":"Arkansas","code":"AR"},{"name":"Armed Forces Europe","code":"AE"},{"name":"Armed Forces Pacific","code":"AP"},{"name":"California","code":"CA"},{"name":"Colorado","code":"CO"},{"name":"Connecticut","code":"CT"},{"name":"Delaware","code":"DE"},{"name":"District of Columbia","code":"DC"},{"name":"Florida","code":"FL"},{"name":"Georgia","code":"GA"},{"name":"Hawaii","code":"HI"},{"name":"Idaho","code":"ID"},{"name":"Illinois","code":"IL"},{"name":"Indiana","code":"IN"},{"name":"Iowa","code":"IA"},{"name":"Kansas","code":"KS"},{"name":"Kentucky","code":"KY"},{"name":"Louisiana","code":"LA"},{"name":"Maine","code":"ME"},{"name":"Maryland","code":"MD"},{"name":"Massachusetts","code":"MA"},{"name":"Michigan","code":"MI"},{"name":"Minnesota","code":"MN"},{"name":"Mississippi","code":"MS"},{"name":"Missouri","code":"MO"},{"name":"Montana","code":"MT"},{"name":"Nebraska","code":"NE"},{"name":"Nevada","code":"NV"},{"name":"New Hampshire","code":"NH"},{"name":"New Jersey","code":"NJ"},{"name":"New Mexico","code":"NM"},{"name":"New York","code":"NY"},{"name":"North Carolina","code":"NC"},{"name":"North Dakota","code":"ND"},{"name":"Ohio","code":"OH"},{"name":"Oklahoma","code":"OK"},{"name":"Oregon","code":"OR"},{"name":"Pennsylvania","code":"PA"},{"name":"Puerto Rico","code":"PR"},{"name":"Rhode Island","code":"RI"},{"name":"South Carolina","code":"SC"},{"name":"South Dakota","code":"SD"},{"name":"Tennessee","code":"TN"},{"name":"Texas","code":"TX"},{"name":"Utah","code":"UT"},{"name":"Vermont","code":"VT"},{"name":"Virginia","code":"VA"},{"name":"Washington","code":"WA"},{"name":"West Virginia","code":"WV"},{"name":"Wisconsin","code":"WI"},{"name":"Wyoming","code":"WY"}]},"UY":{"name":"Uruguay","code":"UY"}}
	,	"is_loged_in":true
	,	"phoneformat":"(123) 456-7890"
	,	"minpasswordlength":"6"
	,	"campaignsubscriptions":true
	,	"shopperCurrency":{"internalid":"1","precision":2,"code":"USD","symbol":"$","currencyname":"US Dollar"}
};
// Site site (ADVANCED or STANDARD)
SC.ENVIRONMENT.siteType = 'ADVANCED';

SC.ENVIRONMENT.jsEnvironment = 'browser';

// The Cart
SC.ENVIRONMENT.CART = {"summary":{"total":1212,"taxtotal":0,"taxondiscount":0,"discountrate_formatted":"","subtotal_formatted":"$1,212.00","discounttotal":0,"tax2total_formatted":"$0.00","discountrate":"","shippingcost_formatted":"$0.00","taxonshipping":0,"discountedsubtotal_formatted":"$1,212.00","handlingcost":0,"tax2total":0,"giftcertapplied_formatted":"($0.00)","taxonshipping_formatted":"$0.00","shippingcost":0,"taxtotal_formatted":"$0.00","giftcertapplied":0,"discountedsubtotal":1212,"taxonhandling":0,"discounttotal_formatted":"($0.00)","handlingcost_formatted":"$0.00","subtotal":1212,"taxondiscount_formatted":"$0.00","estimatedshipping_formatted":"$0.00","total_formatted":"$1,212.00","taxonhandling_formatted":"$0.00","estimatedshipping":0},"lines":[{"internalid":"item30set1546","quantity":1,"rate":1212,"amount":1212,"tax_amount":0,"tax_rate":null,"tax_code":null,"discount":0,"total":1212,"item":{"ispurchasable":true,"custitem_ns_pr_attributes_rating":"","featureddescription":"plutonio70","showoutofstockmessage":false,"defaultcategory_detail":[{"label":"Furniture","url":"Furniture"},{"label":"Dining Room & Kitchen","url":"Living-Family-Room_2"},{"label":"Dining Room & Kitchen Sub 4","url":"Dining-Room-Kitchen-Sub-4"}],"stockdescription":"plutonio70","itemid":"plutonio Kilo al 70%","minimumquantity":1,"storedisplayimage":"","outofstockbehavior":"Allow back orders with no out-of-stock message","storedescription2":"plutonio70","storedisplayname2":"plutonio Kilo al 70%","internalid":30,"itemimages_detail":{},"pagetitle":"plutonio70","onlinecustomerprice_detail":{"onlinecustomerprice_formatted":"$1,212.00","onlinecustomerprice":1212},"itemtype":"InvtPart","storedetaileddescription":"plutonio70","custitem_ns_pr_count":null,"outofstockmessage":"","isonline":true,"itemoptions_detail":{"fields":[{"values":[{"label":""},{"label":"Item 25","internalid":"11"}],"label":"_item","internalid":"custcol_item","type":"select"}]},"isinactive":false,"isinstock":false,"quantityavailable":0,"matrixchilditems_detail":null,"pagetitle2":"plutonio70","urlcomponent":"plutonio70","custitem_ns_pr_rating_by_rate":"","custitem_test_a":null,"displayname":"plutonio70","custitem_ns_pr_item_attributes":"&nbsp;"},"options":null,"shipaddress":null,"rate_formatted":"$1212.00","amount_formatted":"$1212.00","tax_amount_formatted":"$0.00","discount_formatted":"$0.00","total_formatted":"$1212.00"}],"lines_sort":["item30set1546"],"latest_addition":null,"promocode":null,"shipmethods":[{"internalid":"3","name":"FedEx - to World","shipcarrier":"nonups","rate":32.68,"rate_formatted":"$32.68"},{"internalid":"6","name":"Uruguay Only","shipcarrier":"nonups","rate":1,"rate_formatted":"$1,042.20"}],"shipmethod":null,"paymentmethods":[{"type":"creditcard","primary":true,"creditcard":{"internalid":"471","ccnumber":"************1111","ccname":"QWQW","ccexpiredate":"11/2013","ccsecuritycode":"","expmonth":"11","expyear":"2013","paymentmethod":{"internalid":"5","name":"VISA","creditcard":true,"ispaypal":false}}}],"isPaypalComplete":false,"agreetermcondition":false,"addresses":[{"zip":"12121212","phone":"213133131345445","defaultshipping":"T","state":"","isresidential":"T","isvalid":"T","city":"21212","country":"UY","addr1":"fadsfas","addr2":"","addr3":"","defaultbilling":"T","internalid":"1293","fullname":"dfasfs","company":null}],"shipaddress":"1293","billaddress":"1293","touchpoints":{"register":"/c.3563497/checkout/login.ssp?n=4&sc=6&login=T&reset=T&newcust=T","home":"http://dev11.becco.uy?ck=rBQ6CWO-AaW8pdtq&vid=rBQ6CWO-AdC8pXAu&cktime=114224&cart=2663&gc=clear&chrole=14","logout":"/c.3563497/ShopFlow/logOut.ssp?n=4&sc=17&logoff=T&ckabandon=rBQ6CWO-AaW8pdtq","viewcart":"http://dev11.becco.uy/ShopFlow/goToCart.ssp?ck=rBQ6CWO-AaW8pdtq&vid=rBQ6CWO-AdC8pXAu&cktime=114224&cart=2663&gc=clear&chrole=14","continueshopping":"http://dev11.becco.uy/?ck=rBQ6CWO-AaW8pdtq&vid=rBQ6CWO-AdC8pXAu&cktime=114224&cart=2663&gc=clear&chrole=14","serversync":"http://dev11.becco.uy/app/site/backend/syncidentity.nl?c=3563497&n=4&ck=rBQ6CWO-AaW8pdtq&vid=rBQ6CWO-AdC8pXAu&cktime=114224&chrole=14","login":"/c.3563497/checkout/login.ssp?n=4&sc=6&login=T","welcome":"http://dev11.becco.uy/s.nl?sc=15&ck=rBQ6CWO-AaW8pdtq&vid=rBQ6CWO-AdC8pXAu&cktime=114224&cart=2663&gc=clear&chrole=14","checkout":"/c.3563497/checkout/index-local.ssp?n=4&sc=17","customercenter":"https://checkout.netsuite.com/c.3563497/MyAccount/index.ssp?n=4&sc=6"},"options":{"custbody_quantity":"","custbody_andres":""}};

// The Profile
SC.ENVIRONMENT.PROFILE = {"middlename":"Middle Name","isperson":true,"lastname":"Last Name","phoneinfo":{"altphone":null,"phone":"5551111","fax":null},"firstname":"First Name","companyname":"NetSuite","emailsubscribe":"F","paymentterms":{"internalid":"2","name":"Net 30"},"balance":0,"creditlimit":200,"campaignsubscriptions":[{"description":null,"name":"Billing Communication","internalid":2,"subscribed":false},{"description":null,"name":"Marketing","internalid":1,"subscribed":false},{"description":null,"name":"Newsletters","internalid":4,"subscribed":false},{"description":null,"name":"Product Updates","internalid":5,"subscribed":false},{"description":null,"name":"Surveys","internalid":3,"subscribed":false}],"email":"email@test.com","name":"84 First Last","creditholdoverride":"F","internalid":"87","phone":"213133131345445","altphone":null,"fax":null,"priceLevel":"4","type":"INDIVIDUAL","isGuest":"F","creditlimit_formatted":"$200.00","balance_formatted":"$0.00","isLoggedIn":"T"};

// The Address
SC.ENVIRONMENT.ADDRESS = [{"zip":"12121212","phone":"213133131345445","defaultshipping":"T","state":null,"isresidential":"T","isvalid":"T","city":"21212","country":"UY","addr1":"fadsfas","addr2":null,"addr3":null,"defaultbilling":"T","internalid":"1293","fullname":"dfasfs","company":null}];

// The Credit Card
SC.ENVIRONMENT.CREDITCARD = [{"ccsecuritycode":null,"expmonth":"11","customercode":null,"paymentmethod":{"ispaypal":"F","name":"VISA","creditcard":"T","internalid":"5"},"debitcardissueno":null,"ccnumber":"************1111","validfrommon":null,"expyear":"2013","validfromyear":null,"savecard":"T","ccdefault":"T","ccexpiredate":"11/1/2013","internalid":"471","validfrom":null,"ccname":"QWQW"}];

// Touch Support
// Checks if this is a touch enalbed device
SC.ENVIRONMENT.isTouchEnabled = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;






