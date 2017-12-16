describe( 'Materialbox:', () => {
  var transformMaterialbox;

  beforeEach(() => {
    loadFixtures('materialbox/materialboxFixture.html');
  });

  describe('Materialbox opens correctly with transformed ancestor', () => {
    it('Opens a correctly placed overlay when clicked', done => {
      transformMaterialbox = $('#transformTest');
      $('.materialboxed').materialbox();

      // Mouse click
      transformMaterialbox.find('.materialboxed').trigger('click');
      setTimeout(function() {
        // Check overlay is attached
        var overlay = transformMaterialbox.find('#materialbox-overlay');
        var overlayRect = overlay[0].getBoundingClientRect();
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        expect(overlay).toExist('because it is generated on init');
        expect(overlay).toBeVisible('because materialbox was clicked');
        expect(overlayRect.top).toEqual(0);
        expect(overlayRect.left).toEqual(0);
        expect(overlayRect.width).toEqual(windowWidth);
        expect(overlayRect.height).toEqual(windowHeight);

        done();
      }, 1000);
    });
  });

});
