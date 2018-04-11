'use strict';

describe('Viewers E2E Tests:', function () {
  describe('Test viewers page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/viewers');
      expect(element.all(by.repeater('viewer in viewers')).count()).toEqual(0);
    });
  });
});
