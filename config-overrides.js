const rewireStyledComponents = require("react-app-rewire-styled-components");

// const { override, addBabelModule } = require("customize-cra");
// module.exports = override(addBabelPreset("module:babel-plugin-styled-components"));

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireStyledComponents(config, env);
  return config;
};
