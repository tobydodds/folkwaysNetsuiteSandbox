TestCasesData = {
		view: { 
				'empty model' : null
			,	'with zip code and without state': {'zip':'11430','phone':'(650) 627-2011','defaultshipping':'F','state':null,'isresidential':'F','isvalid':'T','city':'Montevideo','country':'UY','addr1':'6 de abril','addr2':'1270','addr3':null,'defaultbilling':'F','internalid':'1660','fullname':'Pablo Rodriguez','company':'NetSuite Inc.'}  
			,	'with state and zip code': {'zip':'94403-2511','phone':'(650) 627-1010','defaultshipping':'T','state':'CA','isresidential':'F','isvalid':'T','city':'San Mateo','country':'US','addr1':'2955 Campus Drive','addr2':'Suite 100','addr3':null,'defaultbilling':'T','internalid':'1661','fullname':'Walter Lopez','company':'NetSuite'}
			,	'without state and zip code': {'zip':null,'phone':'(650) 627-8080','defaultshipping':'F','state':null,'isresidential':'T','isvalid':'T','city':'Santiago','country':'CL','addr1':'Santo Puerto','addr2':'3923','addr3':null,'defaultbilling':'F','internalid':'1659','fullname':'Jose Perez','company':'SuiteCommerce'}
		}
	,	model: { }
	,	collection: {
				'empty collection': []
			,	'generic collection': [{'zip':'11430','phone':'(650) 627-2011','defaultshipping':'F','state':'Montevideo','isresidential':'F','isvalid':'T','city':'Montevideo','country':'UY','addr1':'6 de abril','addr2':'1270','addr3':null,'defaultbilling':'F','internalid':'1660','fullname':'Pablo Rodriguez','company':'NetSuite Inc.'},{'zip':'94403-2511','phone':'(650) 627-1010','defaultshipping':'T','state':'CA','isresidential':'F','isvalid':'T','city':'San Mateo','country':'US','addr1':'2955 Campus Drive','addr2':'Suite 100','addr3':null,'defaultbilling':'T','internalid':'1661','fullname':'Walter Lopez','company':'NetSuite'},{'zip':null,'phone':'(650) 627-8080','defaultshipping':'F','state':null,'isresidential':'T','isvalid':'T','city':'Santiago','country':'CL','addr1':'Santo Puerto','addr2':'3923','addr3':null,'defaultbilling':'F','internalid':'1659','fullname':'Jose Perez','company':'SuiteCommerce'}]
		} 
	,	environment: { 
			siteSettings : {
					countries: {
							'US': {'name':'United States','code':'US', isziprequired:'T','states':[{'name':'Alabama','code':'AL'},{'name':'Alaska','code':'AK'},{'name':'Arizona','code':'AZ'},{'name':'Arkansas','code':'AR'},{'name':'Armed Forces Europe','code':'AE'},{'name':'Armed Forces Pacific','code':'AP'},{'name':'California','code':'CA'},{'name':'Colorado','code':'CO'},{'name':'Connecticut','code':'CT'},{'name':'Delaware','code':'DE'},{'name':'District of Columbia','code':'DC'},{'name':'Florida','code':'FL'},{'name':'Georgia','code':'GA'},{'name':'Hawaii','code':'HI'},{'name':'Idaho','code':'ID'},{'name':'Illinois','code':'IL'},{'name':'Indiana','code':'IN'},{'name':'Iowa','code':'IA'},{'name':'Kansas','code':'KS'},{'name':'Kentucky','code':'KY'},{'name':'Louisiana','code':'LA'},{'name':'Maine','code':'ME'},{'name':'Maryland','code':'MD'},{'name':'Massachusetts','code':'MA'},{'name':'Michigan','code':'MI'},{'name':'Minnesota','code':'MN'},{'name':'Mississippi','code':'MS'},{'name':'Missouri','code':'MO'},{'name':'Montana','code':'MT'},{'name':'Nebraska','code':'NE'},{'name':'Nevada','code':'NV'},{'name':'New Hampshire','code':'NH'},{'name':'New Jersey','code':'NJ'},{'name':'New Mexico','code':'NM'},{'name':'New York','code':'NY'},{'name':'North Carolina','code':'NC'},{'name':'North Dakota','code':'ND'},{'name':'Ohio','code':'OH'},{'name':'Oklahoma','code':'OK'},{'name':'Oregon','code':'OR'},{'name':'Pennsylvania','code':'PA'},{'name':'Puerto Rico','code':'PR'},{'name':'Rhode Island','code':'RI'},{'name':'South Carolina','code':'SC'},{'name':'South Dakota','code':'SD'},{'name':'Tennessee','code':'TN'},{'name':'Texas','code':'TX'},{'name':'Utah','code':'UT'},{'name':'Vermont','code':'VT'},{'name':'Virginia','code':'VA'},{'name':'Washington','code':'WA'},{'name':'West Virginia','code':'WV'},{'name':'Wisconsin','code':'WI'},{'name':'Wyoming','code':'WY'}]}
						,	'UY': {'name':'Uruguay','code':'UY', isziprequired: 'T'}
						,	'CL': {'name':'Chile','code':'CL', isziprequired: 'F'}
						}
				,	phoneformat:'(123) 456-7890'
				,	registration: {displaycompanyfield: 'T'}
			}
		}
	,	configuration: {currentTouchpoint: 'customercenter'}
};


