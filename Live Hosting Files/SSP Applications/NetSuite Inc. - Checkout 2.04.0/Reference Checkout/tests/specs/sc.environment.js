var SC = window.SC = { //ENVIRONMENT: {}
	ENVIRONMENT: {
		jsEnvironment: 'browser' //(typeof nsglobal === 'undefined') ? 'browser' : 'server'
	}
,	isCrossOrigin: function() { 'use strict'; return false; }
,	isPageGenerator: function() { 'use strict'; return false; }
,	getSessionInfo: function (key)
	{
		'use strict';
		var session = SC.SESSION || SC.DEFAULT_SESSION || {};
		return (key) ? session[key] : session;
	}
 };

// Server Environment Info
SC.ENVIRONMENT = {
		'baseUrl':'/test/checkout/{{file}}'
	,	'currentHostString':'checkout.netsuite.com'
	,	'availableHosts':[]
	,	'availableLanguages':[
			{'isdefault':'T','languagename':'English (U.S.)','locale':'en_US','name':'English (U.S.)'}
		,	{'languagename':'Español (España)','name':'Español (España)','locale':'es_ES'}
		]
	,	'availableCurrencies':[
			{'internalid':'1','code':'USD','currencyname':'US Dollar','name':'US Dollar'}
		,	{'internalid':'2','code':'GBP','currencyname':'British pound','name':'British pound'}
		]
	,	'companyId':'3563497'
	,	'currentCurrency':{'internalid':'1','code':'USD','currencyname':'US Dollar','name':'US Dollar'}
	,	'currentLanguage':{'isdefault':'T','languagename':'English (U.S.)','locale':'en_US','name':'English (U.S.)'}
	,	'currentPriceLevel':'4'
	};

SC.SESSION = {
	currency: {'symbol':'$','symbolplacement':1,'isdefault':'T','name':'US Dollar','internalid':'1','code':'USD','currencyname':'US Dollar'}
,	language: {'isdefault':'T','languagename':'English (U.S.)','locale':'en_US','name':'English (U.S.)'}
,	priceLevel: '5'
,	touchpoints: {'register':'/c.3921516/checkout/login.ssp?n=2&sc=13&login=T&reset=T&newcust=T','home':'http://dev8.oloraqa.com?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17','logout':'/c.3921516/ShopFlow/logOut.ssp?n=2&sc=13&logoff=T&ckabandon=vkBOgn3gAXN3ugbX','viewcart':'http://dev8.oloraqa.com/ShopFlow/goToCart.ssp?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17','continueshopping':'http://dev8.oloraqa.com/?ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17','serversync':'http://dev8.oloraqa.com/app/site/backend/syncidentity.nl?c=3921516&n=2&ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&chrole=17','login':'/c.3921516/checkout/login.ssp?n=2&sc=13&login=T','welcome':'http://dev8.oloraqa.com/s.nl?sc=11&ck=vkBOgn3gAXN3ugbX&vid=vkBOgn3gAYh3un9m&cktime=123035&cart=3&gc=clear&chrole=17','checkout':'/c.3921516/checkout/index-local.ssp?n=2&sc=13','customercenter':'https://checkout.netsuite.com/c.3921516/MyAccount/index.ssp?n=2&sc=6'}
};

// Site Settings Info
SC.ENVIRONMENT.siteSettings = {
		'requireshippinginformation':'T'
	,	'currencies':[
				{'internalid':'1','code':'USD','currencyname':'US Dollar','name':'US Dollar'}
			,	{'internalid':'2','code':'GBP','currencyname':'British pound','name':'British pound'}
			]
	,	'sitelanguage':[
			{'isdefault':'T','languagename':'English (U.S.)','locale':'en_US','name':'English (U.S.)'}
		,	{'languagename':'Español (España)','name':'Español (España)','locale':'es_ES'}
		]
	,	'defaultshipcountry':null
	,	'defaultshippingmethod':null
	,	'iswebstoreoffline':'F'
	,	'siteregion':[
			{
					'internalid':'1'
				,	'isdefault':'T'
				,	'displayname':'Parent Company'
				,	'name':'Parent Company'
			}
		]
	,	'id':4
	,	'languages':[
			{'isdefault':'T','languagename':'English (U.S.)','locale':'en_US','name':'English (U.S.)'}
		,	{'languagename':'Español (España)','name':'Español (España)','locale':'es_ES'}
		]
	,	'defaultshippingcountry':null
	,	'order':{'upselldisplay':'ONLY_RELATED_ITEMS','outofstockbehavior':'ENABLENMSG','outofstockitems':'ENABLENMSG'}
	,	'siteloginrequired':'F'
	,	'subsidiaries':[{'internalid':'1','isdefault':'T','displayname':'Parent Company','name':'Parent Company'}]
	,	'entrypoints':{
				'register':'#register'
			,	'home':'#home'
			,	'logout':'#logout'
			,	'viewcart':'#viewcart'
			,	'continueshopping':'#continueshopping'
			,	'serversync':'#serversync'
			,	'login':'#login'
			,	'welcome':'#welcome'
			,	'checkout':'#checkout'
			,	'customercenter':'#customercenter'
		}
	,	'siteid':4
	,	'loginrequired':'F'
	,	'paymentmethods':[
				{'ispaypal':'F','name':'VISA','creditcard':'T','internalid':'5'}
			,	{'ispaypal':'F','name':'Master Card','creditcard':'T','internalid':'4'}
			,	{'paypalemailaddress':'paypalmerchant@williams.com','ispaypal':'T','name':'test Paypal Account','creditcard':'F','internalid':'10'}
			]
	,	'cookiepolicy':''
	,	'pricesincludevat':'F'
	,	'shipstoallcountries':'F'
	,	'facetfield':[{'facetfieldid':'custitem_test_checkbox'},{'facetfieldid':'pricelevel5'}]
	,	'registration':{'registrationanonymous':'F','registrationmandatory':'F','registrationoptional':'F','companyfieldmandatory':'F','registrationallowed':'T','displaycompanyfield':'F','requirecompanyfield':'F','showcompanyfield':'F'}
	,	'sitecurrency':[
				{'internalid':'1','code':'USD','currencyname':'US Dollar','name':'US Dollar'}
			,	{'internalid':'2','code':'GBP','currencyname':'British pound','name':'British pound'}
			,	{'internalid':'3','code':'CAD','isdefault':'T','currencyname':'Canadian Dollar','name':'Canadian Dollar'}
			,	{'internalid':'4','code':'EUR','currencyname':'Euro','name':'Euro'}
		]
	,	'sitetype':'ADVANCED'
	,	'analytics':{'clickattributes':null,'analyticssubmitattributes':null,'confpagetrackinghtml':'','submitattributes':null,'analyticsclickattributes':null}
	,	'includevatwithprices':'F'
	,	'touchpoints':{
				'register':'#register'
			,	'home':'#home'
			,	'logout':'#logout'
			,	'viewcart':'#viewcart'
			,	'continueshopping':'#continueshopping'
			,	'serversync':'#serversync'
			,	'login':'#login'
			,	'welcome':'#welcome'
			,	'checkout':'#checkout'
			,	'customercenter':'#customercenter'
		}
	,	'shiptocountries':['CA','MX','TG','US','UY']
	,	'loginallowed':'T'
	,	'shipstocountries':['CA','MX','TG','US','UY']
	,	'requireloginforpricing':'F'
	,	'showshippingestimator':'F'
	,	'defaultpricelevel':'5'
	,	'imagesizes':null
	,	'shipallcountries':'F'
	,	'checkout':{
				'showpurchaseorder':'F'
			,	'google':{'available':'F'}
			,	'termsandconditions':'Terms'
			,	'showsavecreditinfo':'F'
			,	'showsavecc':'F'
			,	'showpofieldonpayment':'F'
			,	'requiretermsandconditions':'T'
			,	'requestshippingaddressfirst':'F'
			,	'saveccinfo':'F'
			,	'paymentmandatory':'F'
			,	'shippingaddrfirst':'F'
			,	'hidepaymentpagewhennobalance':'T'
			,	'requireccsecuritycode':'T'
			,	'paypalexpress':{'available':'F'}
			,	'termsandconditionshtml':'<p>Terms</p>'
			,	'savecreditinfo':'F'
			,	'custchoosespaymethod':'T'
		}
	,	'showcookieconsentbanner':'T'
	,	'showextendedcart':'F'
	,	'displayname':'Checkout Test'
	,	'shippingrequired':'T'
	,	'sortfield':[
					{'sortfieldname':'pricelevel5','sortdirection':'ASCENDING','sortorder':'0'}
				,	{'sortfieldname':'relevance','sortdirection':'ASCENDING','sortorder':'1'}
				]
	,	'countries':{'CA':{'name':'Canada','code':'CA','states':[{'name':'Alberta','code':'AB'},{'name':'British Columbia','code':'BC'},{'name':'Manitoba','code':'MB'},{'name':'New Brunswick','code':'NB'},{'name':'Newfoundland','code':'NL'},{'name':'Northwest Territories','code':'NT'},{'name':'Nova Scotia','code':'NS'},{'name':'Nunavut','code':'NU'},{'name':'Ontario','code':'ON'},{'name':'Prince Edward Island','code':'PE'},{'name':'Quebec','code':'QC'},{'name':'Saskatchewan','code':'SK'},{'name':'Yukon','code':'YT'}]},'MX':{'name':'Mexico','code':'MX','states':[{'name':'Aguascalientes','code':'AGS'},{'name':'Baja California Norte','code':'BCN'},{'name':'Baja California Sur','code':'BCS'},{'name':'Campeche','code':'CAM'},{'name':'Chiapas','code':'CHIS'},{'name':'Chihuahua','code':'CHIH'},{'name':'Coahuila','code':'COAH'},{'name':'Colima','code':'COL'},{'name':'Distrito Federal','code':'DF'},{'name':'Durango','code':'DGO'},{'name':'Guanajuato','code':'GTO'},{'name':'Guerrero','code':'GRO'},{'name':'Hidalgo','code':'HGO'},{'name':'Jalisco','code':'JAL'},{'name':'Michoacán','code':'MICH'},{'name':'Morelos','code':'MOR'},{'name':'México (Estado de)','code':'MEX'},{'name':'Nayarit','code':'NAY'},{'name':'Nuevo León','code':'NL'},{'name':'Oaxaca','code':'OAX'},{'name':'Puebla','code':'PUE'},{'name':'Querétaro','code':'QRO'},{'name':'Quintana Roo','code':'QROO'},{'name':'San Luis Potosí','code':'SLP'},{'name':'Sinaloa','code':'SIN'},{'name':'Sonora','code':'SON'},{'name':'Tabasco','code':'TAB'},{'name':'Tamaulipas','code':'TAMPS'},{'name':'Tlaxcala','code':'TLAX'},{'name':'Veracruz','code':'VER'},{'name':'Yucatán','code':'YUC'},{'name':'Zacatecas','code':'ZAC'}]},'TG':{'name':'Togo','code':'TG'},'US':{'name':'United States','code':'US','states':[{'name':'Alabama','code':'AL'},{'name':'Alaska','code':'AK'},{'name':'Arizona','code':'AZ'},{'name':'Arkansas','code':'AR'},{'name':'Armed Forces Europe','code':'AE'},{'name':'Armed Forces Pacific','code':'AP'},{'name':'California','code':'CA'},{'name':'Colorado','code':'CO'},{'name':'Connecticut','code':'CT'},{'name':'Delaware','code':'DE'},{'name':'District of Columbia','code':'DC'},{'name':'Florida','code':'FL'},{'name':'Georgia','code':'GA'},{'name':'Hawaii','code':'HI'},{'name':'Idaho','code':'ID'},{'name':'Illinois','code':'IL'},{'name':'Indiana','code':'IN'},{'name':'Iowa','code':'IA'},{'name':'Kansas','code':'KS'},{'name':'Kentucky','code':'KY'},{'name':'Louisiana','code':'LA'},{'name':'Maine','code':'ME'},{'name':'Maryland','code':'MD'},{'name':'Massachusetts','code':'MA'},{'name':'Michigan','code':'MI'},{'name':'Minnesota','code':'MN'},{'name':'Mississippi','code':'MS'},{'name':'Missouri','code':'MO'},{'name':'Montana','code':'MT'},{'name':'Nebraska','code':'NE'},{'name':'Nevada','code':'NV'},{'name':'New Hampshire','code':'NH'},{'name':'New Jersey','code':'NJ'},{'name':'New Mexico','code':'NM'},{'name':'New York','code':'NY'},{'name':'North Carolina','code':'NC'},{'name':'North Dakota','code':'ND'},{'name':'Ohio','code':'OH'},{'name':'Oklahoma','code':'OK'},{'name':'Oregon','code':'OR'},{'name':'Pennsylvania','code':'PA'},{'name':'Puerto Rico','code':'PR'},{'name':'Rhode Island','code':'RI'},{'name':'South Carolina','code':'SC'},{'name':'South Dakota','code':'SD'},{'name':'Tennessee','code':'TN'},{'name':'Texas','code':'TX'},{'name':'Utah','code':'UT'},{'name':'Vermont','code':'VT'},{'name':'Virginia','code':'VA'},{'name':'Washington','code':'WA'},{'name':'West Virginia','code':'WV'},{'name':'Wisconsin','code':'WI'},{'name':'Wyoming','code':'WY'}]},'UY':{'name':'Uruguay','code':'UY'}}
	,	'is_loged_in':true
	,	'phoneformat':'(123) 456-7890'
	,	'minpasswordlength':'6'
	,	'campaignsubscriptions':true
	,	'shopperCurrency':{'internalid':'1','precision':2,'code':'USD','symbol':'$','currencyname':'US Dollar'}
};
// Site site (ADVANCED or STANDARD)
SC.ENVIRONMENT.siteType = 'ADVANCED';

SC.ENVIRONMENT.jsEnvironment = 'browser';

// The Cart
SC.ENVIRONMENT.CART_BOOTSTRAPED = true ;
SC.ENVIRONMENT.CART = {'lines':[{'internalid':'item87set807','quantity':2,'rate':100,'rate_formatted':'$100.00','amount':200,'tax_amount':0,'tax_rate':null,'tax_code':null,'discount':0,'total':200,'item':{'ispurchasable':true,'showoutofstockmessage':false,'stockdescription':'','itemid':'Hydrogen','minimumquantity':null,'storedisplayname2':'Hydrogen','internalid':87,'itemimages_detail':{'urls':[{'url':'https://checkout.netsuite.com/c.3921516/images/hydrogen.01.jpg','altimagetext':''},{'url':'https://checkout.netsuite.com/c.3921516/images/hydrogen.02.jpg','altimagetext':''}]},'onlinecustomerprice_detail':{'onlinecustomerprice_formatted':'$100.00','onlinecustomerprice':100},'itemtype':'InvtPart','outofstockmessage':'','isonline':true,'itemoptions_detail':{},'isinactive':false,'isinstock':false,'isbackorderable':true,'urlcomponent':'','displayname':''},'itemtype':'InvtPart','isshippable':true,'options':null,'amount_formatted':'$200.00','tax_amount_formatted':'$0.00','discount_formatted':'$0.00','total_formatted':'$200.00'}],'lines_sort':['item87set807'],'latest_addition':null,'promocode':null,'shipmethods':[{'internalid':'2','name':'Airborne - Canada','shipcarrier':'nonups','rate':20,'rate_formatted':'$20.00'},{'internalid':'3','name':'FedEx - to World','shipcarrier':'nonups','rate':32.68,'rate_formatted':'$32.68'},{'internalid':'93','name':'Fletes Rapidito (Uruguay Only)','shipcarrier':'nonups','rate':920,'rate_formatted':'$920.00'},{'internalid':'4','name':'UPS - Not Uruguay','shipcarrier':'nonups','rate':63,'rate_formatted':'$63.00'}],'shipmethod':'2','addresses':[{'zip':'1800','phone':'55512312347','defaultshipping':'T','state':'11','isresidential':'F','isvalid':'T','city':'1','country':'AL','addr1':'1','addr2':'1','addr3':'','defaultbilling':'T','internalid':'262','fullname':'ONE','company':null}],'billaddress':'262','shipaddress':'262','paymentmethods':[{'type':'creditcard','primary':true,'creditcard':{'internalid':'57','ccnumber':'************1111','ccname':'VISA','ccexpiredate':'08/2028','ccsecuritycode':'','expmonth':'08','expyear':'2028','paymentmethod':{'internalid':'5','name':'VISA','creditcard':true,'ispaypal':false}}}],'isPaypalComplete':false,'touchpoints':{'register':'/c.3921516/checkout/index-local.ssp?is=register&n=2&login=T&reset=T&newcust=T','home':'http://dev8.oloraqa.com?ck=vkBOgoPgATF2ZQWv&vid=vkBOgoPgAUR2ZdmA&cktime=123054&cart=3&gc=clear&chrole=14','logout':'/c.3921516/ShopFlow/logOut.ssp?n=2&logoff=T&ckabandon=vkBOgoPgATF2ZQWv','viewcart':'http://dev8.oloraqa.com/checkout/cart.ssp?ck=vkBOgoPgATF2ZQWv&vid=vkBOgoPgAUR2ZdmA&cktime=123054&cart=3&gc=clear&chrole=14','continueshopping':'http://dev8.oloraqa.com/?ck=vkBOgoPgATF2ZQWv&vid=vkBOgoPgAUR2ZdmA&cktime=123054&cart=3&gc=clear&chrole=14','serversync':'http://dev8.oloraqa.com/app/site/backend/syncidentity.nl?c=3921516&n=2&ck=vkBOgoPgATF2ZQWv&vid=vkBOgoPgAUR2ZdmA&cktime=123054&chrole=14','login':'/c.3921516/checkout/index-local.ssp?is=login&n=2&login=T','welcome':'http://dev8.oloraqa.com/s.nl?ck=vkBOgoPgATF2ZQWv&vid=vkBOgoPgAUR2ZdmA&cktime=123054&cart=3&gc=clear&chrole=14','checkout':'/c.3921516/checkout/index-local.ssp?is=checkout&n=2','customercenter':'https://checkout.netsuite.com/c.3921516/MyAccount/index-local.ssp?n=2'},'agreetermcondition':false,'summary':{'total':220,'taxtotal':0,'taxondiscount':0,'discountrate_formatted':'','subtotal_formatted':'$200.00','discounttotal':0,'tax2total_formatted':'$0.00','discountrate':'','shippingcost_formatted':'$20.00','taxonshipping':0,'discountedsubtotal_formatted':'$200.00','handlingcost':0,'tax2total':0,'giftcertapplied_formatted':'($0.00)','taxonshipping_formatted':'$0.00','shippingcost':20,'taxtotal_formatted':'$0.00','giftcertapplied':0,'itemcount':2,'discountedsubtotal':200,'taxonhandling':0,'discounttotal_formatted':'($0.00)','handlingcost_formatted':'$0.00','subtotal':200,'taxondiscount_formatted':'$0.00','estimatedshipping_formatted':'$20.00','total_formatted':'$220.00','taxonhandling_formatted':'$0.00','estimatedshipping':20},'options':{}};

// The Profile
SC.ENVIRONMENT.PROFILE = {'middlename':'Middle Name','isperson':true,'lastname':'Last Name','phoneinfo':{'altphone':null,'phone':'5551111','fax':null},'firstname':'First Name','companyname':'NetSuite','emailsubscribe':'F','paymentterms':{'internalid':'2','name':'Net 30'},'balance':0,'creditlimit':200,'campaignsubscriptions':[{'description':null,'name':'Billing Communication','internalid':2,'subscribed':false},{'description':null,'name':'Marketing','internalid':1,'subscribed':false},{'description':null,'name':'Newsletters','internalid':4,'subscribed':false},{'description':null,'name':'Product Updates','internalid':5,'subscribed':false},{'description':null,'name':'Surveys','internalid':3,'subscribed':false}],'email':'email@test.com','name':'84 First Last','creditholdoverride':'F','internalid':'87','phone':'213133131345445','altphone':null,'fax':null,'priceLevel':'4','type':'INDIVIDUAL','isGuest':'F','creditlimit_formatted':'$200.00','balance_formatted':'$0.00','isLoggedIn':'T'};

// The Address
SC.ENVIRONMENT.ADDRESS = [{'zip':'12121212','phone':'213133131345445','defaultshipping':'T','state':null,'isresidential':'T','isvalid':'T','city':'21212','country':'UY','addr1':'fadsfas','addr2':null,'addr3':null,'defaultbilling':'T','internalid':'1293','fullname':'dfasfs','company':null}];

// The Credit Card
SC.ENVIRONMENT.CREDITCARD = [{'ccsecuritycode':null,'expmonth':'11','customercode':null,'paymentmethod':{'ispaypal':'F','name':'VISA','creditcard':'T','internalid':'5'},'debitcardissueno':null,'ccnumber':'************1111','validfrommon':null,'expyear':'2013','validfromyear':null,'savecard':'T','ccdefault':'T','ccexpiredate':'11/1/2013','internalid':'471','validfrom':null,'ccname':'QWQW'}];

// Touch Support
// Checks if this is a touch enalbed device
SC.ENVIRONMENT.isTouchEnabled = 'ontouchstart' in window;
