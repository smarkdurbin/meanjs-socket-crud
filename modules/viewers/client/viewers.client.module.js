(function (app) {
  'use strict';

  app.registerModule('viewers', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('viewers.admin', ['core.admin']);
  app.registerModule('viewers.admin.routes', ['core.admin.routes']);
  app.registerModule('viewers.services');
  app.registerModule('viewers.routes', ['ui.router', 'core.routes', 'viewers.services']);
}(ApplicationConfiguration));
