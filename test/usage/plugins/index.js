module.exports = (on, config) => {
    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
            launchOptions.args.push('--disable-site-isolation-trials');

            return launchOptions;
        }
    });
    on('task', require('../support/cypress-istanbul/task.js'));
};
