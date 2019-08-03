# I18N Component

This component is an example of a component that uses I18N. The I18N json files can be found in `./json-files/`. 

## How it works

In `index.ts` the general I18N configuration is defined with `WebComponent.initI18N`. Here the URL format (where `$LANG$` is replaced with the language name), the default language and a `getMessage` function are defined. Let's call the object passed to this function `initObj` for now. 
The call to `WebComponent.initComplexTemplateProvider` only serves to initialize the complex template element which allows for the use of `@click` and other features (which you can see in the HTML template). In `i18n-component.html.ts` the I18N values are retrieved by calling `this.__('key')`. This basically returns `initObj.returner(initObj.getMessage(langFile, 'key'))`. In this case, `initObj.returner` is defined as a function that will set the value to a placeholder while the promise that `initObj.getMessage` returns has not resolved yet. The returner function is optional and omitting it would have simply displayed the text after the promise has resolved. This just shows any content if the language file is still loading for example.