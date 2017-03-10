define('OrderWizard.Module.CustomTransactionFields', ['Wizard.Module'], function (WizardModule)
{
    'use strict';

    return WizardModule.extend({
        
        template: 'order_wizard_customtransactionfields_module'

    ,   events: {
            'change input[name="send-by-email"]' : 'saveOption'
        }
        
    ,   render: function()
        {
            this._render();
        }
        
    ,   saveOption: function(){
            
        console.log("SAVE OPTION");

            var self = this
            ,   promise = jQuery.Deferred()
            ,   _options = self.model.get('options')
            ,   sendbyemail = self.$('input[name="send-by-email"]').prop("checked") || false;

            _options.custbody4 = (sendbyemail) ? "T" : "F";

            console.log( _options )
        
            self.model.set('options', _options);

            this.isValid().done(function(){
                promise.resolve();
            }).fail(function(message){
                promise.reject(message);
            });
            
            return promise;
        }
        
    });
});
