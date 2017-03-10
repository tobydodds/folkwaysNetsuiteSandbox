SC = {
	ENVIRONMENT : {
		PROFILE : {
			isGuest : 'F'
		}
	,	siteSettings : {
			registration : {
				companyfieldmandatory : 'F'
			}
		}
	}
};

specs = [
	'tests/specs/app/modules/OrderWizard/router'
,	'tests/specs/app/modules/OrderWizard/module.Proxy'
,	'tests/specs/app/modules/OrderWizard/confirmation'
,	'tests/specs/app/modules/OrderWizard/multishipto.EnableLink'
,	'tests/specs/app/modules/OrderWizard/module.CartSummary'
,	'tests/specs/app/modules/OrderWizard/multishipto.Set.Addresses.Packages'
,	'tests/specs/app/modules/OrderWizard/multishipto.Packages'
,	'tests/specs/app/modules/OrderWizard/multishipto.Shipmethod'
,	'tests/specs/app/modules/OrderWizard/multishipto.NonShippableItems'
,	'tests/specs/app/modules/OrderWizard/multishipto.Select.Address.Shipping'
];
