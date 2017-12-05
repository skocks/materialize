describe("Dropdown Plugin", () => {
  beforeEach(() => {
    loadFixtures('dropdown/dropdownFixture.html');
    $('.dropdown-trigger').dropdown();
  });

  describe("Dropdown", () => {
    var normalDropdown;

    beforeEach(() => {
      // browserSelect = $('select.normal');
    });

    it("should open and close programmatically", done => {
      var dropdown1 = $('#dropdown1');
      normalDropdown = $('#dropdownActivator');

      expect(dropdown1).toBeHidden('Should be hidden before dropdown is opened.');

      normalDropdown.dropdown('open');

      setTimeout(function() {
        expect(dropdown1).toBeVisible('Should be shown after dropdown is opened.');
        normalDropdown.dropdown('close');

        setTimeout(function() {
          expect(dropdown1).toBeHidden('Should be hidden after dropdown is closed.');
          done();
        }, 400);
      }, 400);
    });

    it("should close dropdown on document click if programmatically opened", done => {
      normalDropdown = $('#dropdownActivator');

      expect(dropdown1).toBeHidden('Should be hidden before dropdown is opened.');

      normalDropdown.dropdown('open');

      setTimeout(function() {
        expect(dropdown1).toBeVisible('Should be shown after dropdown is opened.');
        click(document.body);

        setTimeout(function() {
          expect(dropdown1).toBeHidden('Should be hidden after dropdown is closed.');
          done();
        }, 400);
      }, 400);
    });

    it("should bubble events correctly", done => {
      var dropdown2 = $('#dropdown2');
      normalDropdown = $('#dropdownBubble');

      expect(dropdown2).toBeHidden('Should be hidden before dropdown is opened.');

      normalDropdown.find('i').click();

      setTimeout(function() {
        expect(dropdown2).toBeVisible('Should be shown after dropdown is opened.');
        click(document.body);

        setTimeout(function() {
          expect(dropdown2).toBeHidden('Should be hidden after dropdown is closed.');
          done();
        }, 400);
      }, 400);
    });
  });
});
