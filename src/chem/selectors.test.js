import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import proxyquire from 'proxyquire';
import selectors from './selectors';
import Atom from './Atom';
import ResidueType from './ResidueType';

chai.use(dirtyChai);

describe('selectors', () => {
  let rFrom2To8;
  let rFrom2To8String;
  let rFrom2To8JSON;
  let rFrom1To14;
  let rFrom18To20;
  let rEqual2;
  let rEqual2AsString;
  let rEqual2AsJSON;

  let rList;
  let rListAsString;
  let rListAsJSON;

  let rListSelector;
  let rListSelectorAsString;
  let rListSelectorAsJSON;

  let VaLuE;
  let vALue;
  let value45;
  let value78;
  let anotherValue;
  let values;

  let vList;
  let vListAsString;
  let vListAsJSON;

  let vListOnlyUpper;
  let vListOnlyUpperAsString;
  let vListOnlyUpperAsJSON;

  let vListSelector;
  let vListSelectorAsString;
  let vListSelectorAsJSON;

  let vListSelectorSense;
  let vListSelectorSenseAsString;
  let vListSelectorSenseAsJSON;

  before(() => {
    rFrom2To8 = new selectors.Range(2, 8);
    rFrom2To8String = '2:8';
    rFrom2To8JSON = [2, 8];
    rFrom1To14 = new selectors.Range(1, 14);
    rFrom18To20 = new selectors.Range(18, 20);
    rEqual2 = new selectors.Range(2);
    rEqual2AsString = '2';
    rEqual2AsJSON = [2, 2];

    rList = new selectors.RangeList([rFrom2To8, rFrom1To14, rFrom18To20]);
    rListAsString = [rFrom2To8.toString(), rFrom1To14.toString(), rFrom18To20.toString()].join(',');
    rListAsJSON = [rFrom2To8.toJSON(), rFrom1To14.toJSON(), rFrom18To20.toJSON()];

    rListSelector = new selectors.RangeListSelector(rList);
    rListSelectorAsString = [rListSelector.keyword, rListAsString].join(' ');
    rListSelectorAsJSON = [rListSelector.name, rListAsJSON];

    VaLuE = 'VaLuE';
    vALue = 'vALue';
    value45 = 45;
    value78 = 78;
    anotherValue = 'anotherValue';
    values = [value45, VaLuE];

    vList = new selectors.ValueList(values);
    vListAsString = [value45.toString(), VaLuE.toString()].join(',');
    vListAsJSON = values;

    vListOnlyUpper = new selectors.ValueList(values, true);
    vListOnlyUpperAsString = [value45.toString(), VaLuE.toUpperCase().toString()].join(',');
    vListOnlyUpperAsJSON = [value45, VaLuE.toUpperCase()];

    vListSelector = new selectors.ValueListSelector(values, false);
    vListSelectorAsString = [vListSelector.keyword, vListOnlyUpper.toString()].join(' ');
    vListSelectorAsJSON = [vListSelector.name, vListOnlyUpper.toJSON()];

    vListSelectorSense = new selectors.ValueListSelector(values, true);
    vListSelectorSenseAsString = [vListSelectorSense.keyword, vList.toString()].join(' ');
    vListSelectorSenseAsJSON = [vListSelectorSense.name, vList.toJSON()];
  });

  describe('Range', () => {
    describe('#toString()', () => {
      it('constructs string for two arguments range', () => {
        expect(rFrom2To8.toString()).to.equal(rFrom2To8String);
      });
      it('constructs string for one argument range', () => {
        expect(rEqual2.toString()).to.equal(rEqual2AsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON for two arguments range', () => {
        expect(rFrom2To8.toJSON()).to.deep.equal(rFrom2To8JSON);
      });
      it('constructs JSON for one argument range', () => {
        expect(rEqual2.toJSON()).to.deep.equal(rEqual2AsJSON);
      });
    });
    describe('#includes(value)', () => {
      it('does not include value wich is smaller than bottom border', () => {
        expect(rFrom2To8.includes(0)).to.equal(false);
      });
      it('includes value wich is equal to bottom border', () => {
        expect(rFrom2To8.includes(2)).to.equal(true);
      });
      it('includes value wich lies between bottom and top borders', () => {
        expect(rFrom2To8.includes(4)).to.equal(true);
      });
      it('includes value wich is equal to top border', () => {
        expect(rFrom2To8.includes(7)).to.equal(true);
      });
      it('does not include value wich is igger than top border', () => {
        expect(rFrom2To8.includes(11)).to.equal(false);
      });
      it('does not include value wich is smaller than single existed', () => {
        expect(rEqual2.includes(-1)).to.equal(false);
      });
      it('includes value wich is equal to single existed', () => {
        expect(rEqual2.includes(2)).to.equal(true);
      });
      it('does not include value wich is bigger than single existed', () => {
        expect(rEqual2.includes(7)).to.equal(false);
      });
    });
  });

  describe('RangeList', () => {
    describe('#toString()', () => {
      it('constructs string', () => {
        expect(rList.toString()).to.equal(rListAsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON', () => {
        expect(rList.toJSON()).to.deep.equal(rListAsJSON);
      });
    });
    describe('#includes(value)', () => {
      it('includes value which exists in one of ranges', () => {
        expect(rList.includes(13)).to.equal(true);
      });
      it('includes value which exists in more than one range', () => {
        expect(rList.includes(5)).to.equal(true);
      });
      it('does not include value which is between different ranges', () => {
        expect(rList.includes(17)).to.equal(false);
      });
      it('does not include value which is outside all ranges', () => {
        expect(rList.includes(22)).to.equal(false);
      });
    });
    describe('#append(value)', () => {
      let rangeList;
      beforeEach(() => {
        rangeList = new selectors.RangeList();
      });

      it('begins containing values from appending range', () => {
        expect(rangeList.includes(19)).to.equal(false);
        rangeList.append(rFrom18To20);
        expect(rangeList.includes(19)).to.equal(true);
      });
      it('does not begin containing values outside of appending range', () => {
        expect(rangeList.includes(1)).to.equal(false);
        rangeList.append(rFrom18To20);
        expect(rangeList.includes(1)).to.equal(false);
      });
      it('keeps containing values from previous ranges', () => {
        rangeList.append(rFrom18To20);
        expect(rangeList.includes(19)).to.equal(true);
        rangeList.append(rFrom2To8);
        expect(rangeList.includes(19)).to.equal(true);
      });
    });
    describe('#remove(value)', () => {
      let rangeList;
      beforeEach(() => {
        rangeList = new selectors.RangeList([rFrom2To8, rFrom1To14, rFrom18To20]);
      });
      it('stops containing values from removing range', () => {
        expect(rangeList.includes(19)).to.equal(true);
        rangeList.remove(rFrom18To20);
        expect(rangeList.includes(19)).to.equal(false);
      });
      it('keeps containing values from remaining ranges', () => {
        expect(rangeList.includes(13)).to.equal(true);
        rangeList.remove(rFrom18To20);
        expect(rangeList.includes(13)).to.equal(true);
      });
      it('keeps containing values from remaining ranges even if they also exists in removing range', () => {
        expect(rangeList.includes(5)).to.equal(true);
        rangeList.remove(rFrom1To14);
        expect(rangeList.includes(5)).to.equal(true);
      });
      it('keeps containing values from all ranges when removed range was not existing in list', () => {
        expect(rangeList.includes(2)).to.equal(true);
        rangeList.remove(rEqual2);
        expect(rangeList.includes(2)).to.equal(true);
      });
    });
  });

  describe('ValueList', () => {
    describe('#toString()', () => {
      it('constructs string for case sensitive list', () => {
        expect(vList.toString()).to.equal(vListAsString);
      });
      it('constructs string for only upper case list', () => {
        expect(vListOnlyUpper.toString()).to.equal(vListOnlyUpperAsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON for case sensitive list', () => {
        expect(vList.toJSON()).to.deep.equal(vListAsJSON);
      });
      it('constructs JSON for only upper case list', () => {
        expect(vListOnlyUpper.toJSON()).to.deep.equal(vListOnlyUpperAsJSON);
      });
    });
    describe('#includes(value)', () => {
      it('includes value which exists in it (case sensitive list)', () => {
        expect(vList.includes(VaLuE)).to.equal(true);
      });
      it('does not include value which exists in it in different case (case sensitive list)', () => {
        expect(vList.includes(vALue)).to.equal(false);
      });
      it('does nit include value which does not exist in it (case sensitive list)', () => {
        expect(vList.includes(anotherValue)).to.equal(false);
      });
      it('includes value which exists in it (only upper case list)', () => {
        expect(vListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
      });
      it('does not include value which exists in it in not upper case (only upper case list)', () => {
        expect(vListOnlyUpper.includes(vALue)).to.equal(false);
      });
      it('does not include value which does not exist in it (only upper case list)', () => {
        expect(vListOnlyUpper.includes(anotherValue)).to.equal(false);
      });
    });
    describe('#append(value)', () => {
      let valueList;
      let valueListOnlyUpper;
      beforeEach(() => {
        valueList = new selectors.ValueList();
        valueListOnlyUpper = new selectors.ValueList(undefined, true);
      });
      it('begins containing appending value (case sensitive list)', () => {
        expect(valueList.includes(VaLuE)).to.equal(false);
        valueList.append(VaLuE);
        expect(valueList.includes(VaLuE)).to.equal(true);
      });
      it('does not begin containing appending value in different case (case sensitive list)', () => {
        expect(valueList.includes(vALue)).to.equal(false);
        valueList.append(VaLuE);
        expect(valueList.includes(vALue)).to.equal(false);
      });
      it('keeps containing values from previous ranges (case sensitive list)', () => {
        valueList.append(VaLuE);
        expect(valueList.includes(VaLuE)).to.equal(true);
        valueList.append(value45);
        expect(valueList.includes(VaLuE)).to.equal(true);
      });
      it('begins containing upper case version of appending value (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(false);
        valueListOnlyUpper.append(VaLuE);
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
      });
      it('begins containing appending value even if it is not string (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(value45)).to.equal(false);
        valueListOnlyUpper.append(value45);
        expect(valueListOnlyUpper.includes(value45)).to.equal(true);
      });
      it('does not begin containing not upper case version of appending value (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(VaLuE)).to.equal(false);
        valueListOnlyUpper.append(VaLuE);
        expect(valueListOnlyUpper.includes(VaLuE)).to.equal(false);
      });
      it('keeps containing values from previous ranges (only upper case list)', () => {
        valueListOnlyUpper.append(VaLuE);
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
        valueListOnlyUpper.append(value45);
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
      });
    });
    describe('#remove(value)', () => {
      let valueList;
      let valueListOnlyUpper;
      beforeEach(() => {
        valueList = new selectors.ValueList([VaLuE, value45, value45]);
        valueListOnlyUpper = new selectors.ValueList([VaLuE, value45, value45, value78], true);
      });
      it('stops containing removing value (case sensitive list)', () => {
        expect(valueList.includes(VaLuE)).to.equal(true);
        valueList.remove(VaLuE);
        expect(valueList.includes(VaLuE)).to.equal(false);
      });
      it('keeps containing remaining values (case sensitive list)', () => {
        expect(valueList.includes(value45)).to.equal(true);
        valueList.remove(VaLuE);
        expect(valueList.includes(value45)).to.equal(true);
      });
      it('keeps containing one of two equal values after deleting another (case sensitive list)', () => {
        expect(valueList.includes(value45)).to.equal(true);
        valueList.remove(value45);
        expect(valueList.includes(value45)).to.equal(true);
        valueList.remove(value45);
        expect(valueList.includes(value45)).to.equal(false);
      });
      it('keeps containing all values when removed value was not existing in it (case sensitive list)', () => {
        expect(valueList.includes(VaLuE)).to.equal(true);
        valueList.remove(anotherValue);
        expect(valueList.includes(VaLuE)).to.equal(true);
      });
      it('keeps containing all values when removed value was not existing in list in such case (case sensitive list)', () => {
        expect(valueList.includes(VaLuE)).to.equal(true);
        valueList.remove(vALue);
        expect(valueList.includes(VaLuE)).to.equal(true);
      });
      it('stops containing removing value (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
        valueListOnlyUpper.remove(VaLuE.toUpperCase());
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(false);
      });
      it('stops containing removing value even if it is not string (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(value78)).to.equal(true);
        valueListOnlyUpper.remove(value78);
        expect(valueListOnlyUpper.includes(value78)).to.equal(false);
      });
      it('stops containing removing value even if it was sent not in upper case (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
        valueListOnlyUpper.remove(vALue);
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(false);
      });
      it('keeps containing remaining values', () => {
        expect(valueListOnlyUpper.includes(value45)).to.equal(true);
        valueListOnlyUpper.remove(VaLuE);
        expect(valueListOnlyUpper.includes(value45)).to.equal(true);
      });
      it('keeps containing one of two equal values after deleting another (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(value45)).to.equal(true);
        valueListOnlyUpper.remove(value45);
        expect(valueListOnlyUpper.includes(value45)).to.equal(true);
        valueListOnlyUpper.remove(value45);
        expect(valueListOnlyUpper.includes(value45)).to.equal(false);
      });
      it('keeps containing all values when removed value was not existing in it (only upper case list)', () => {
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
        valueListOnlyUpper.remove(anotherValue);
        expect(valueListOnlyUpper.includes(VaLuE.toUpperCase())).to.equal(true);
      });
    });
  });

  describe('Selector', () => {
    let defaultSelector = new selectors.Selector();
    let defaultSelectorAsString = 'error';
    let defaultSelectorAsJSON = ['Error'];

    let newSelector = new selectors.Selector();
    let newSelectorAsString = newSelector.keyword;
    let newSelectorAsJSON = [newSelector.name];

    before(() => {
      defaultSelector = new selectors.Selector();
      defaultSelectorAsString = 'error';
      defaultSelectorAsJSON = ['Error'];

      newSelector = new selectors.Selector();
      newSelector.keyword = 'newSelectorKeyword';
      newSelector.name = 'newSelectorName';
      newSelectorAsString = newSelector.keyword;
      newSelectorAsJSON = [newSelector.name];
    });

    describe('#toString()', () => {
      it('constructs string for default selector', () => {
        expect(defaultSelector.toString()).to.equal(defaultSelectorAsString);
      });
      it('constructs string for selector with modified keyword', () => {
        expect(newSelector.toString()).to.equal(newSelectorAsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON for default selector', () => {
        expect(defaultSelector.toJSON()).to.deep.equal(defaultSelectorAsJSON);
      });
      it('constructs JSON for selector with modified name', () => {
        expect(newSelector.toJSON()).to.deep.equal(newSelectorAsJSON);
      });
    });
  });

  describe('RangeListSelector', () => {
    describe('#toString()', () => {
      it('constructs string', () => {
        expect(rListSelector.toString()).to.equal(rListSelectorAsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON', () => {
        expect(rListSelector.toJSON()).to.deep.equal(rListSelectorAsJSON);
      });
    });
  });

  describe('ValueListSelector', () => {
    describe('#toString()', () => {
      it('constructs string for case insensitive selector', () => {
        expect(vListSelector.toString()).to.equal(vListSelectorAsString);
      });
      it('constructs string for case sensitive selector', () => {
        expect(vListSelectorSense.toString()).to.equal(vListSelectorSenseAsString);
      });
    });
    describe('#toJSON()', () => {
      it('constructs JSON for case insensitive selector', () => {
        expect(vListSelector.toJSON()).to.deep.equal(vListSelectorAsJSON);
      });
      it('constructs JSON for case sensitive selector', () => {
        expect(vListSelectorSense.toJSON()).to.deep.equal(vListSelectorSenseAsJSON);
      });
    });
  });

  describe('PrefixOperator', () => {
    const noneSelector = selectors.none();
    const noArgumentedPO = new selectors.PrefixOperator();
    const noArgumentedPOAsString = [noArgumentedPO.keyword, noneSelector.toString()].join(' ');
    const noArgumentedPOAsJSON = [noArgumentedPO.name, noneSelector.toJSON()];

    const selector = selectors.all();
    selector.keyword = 'selector';
    const simplePO = new selectors.PrefixOperator(selector);
    const simplePOAsString = [simplePO.keyword, selector.toString()].join(' ');
    const simplePOAsJSON = [simplePO.name, selector.toJSON()];

    const middlePriorityPO = new selectors.PrefixOperator(selector);
    middlePriorityPO.keyword = 'middlePO';

    describe('#toString()', () => {
      it('construct string for prefix operator created with no arguments', () => {
        expect(noArgumentedPO.toString()).to.equal(noArgumentedPOAsString);
      });
      it('construct string for simple prefix operator', () => {
        expect(simplePO.toString()).to.equal(simplePOAsString);
      });
      it('construct string for higher priority prefix operator from lower priority...', () => {
        const highPriorityPO = new selectors.PrefixOperator(middlePriorityPO);
        highPriorityPO.priority = selectors.PrefixOperator.prototype.priority - 1;
        highPriorityPO.keyword = 'highestPO';
        expect(highPriorityPO.toString()).to.equal('highestPO (middlePO selector)');
      });
      it('construct string for lower priority prefix operator from higher priority...', () => {
        const lowPriorityPO = new selectors.PrefixOperator(middlePriorityPO);
        lowPriorityPO.priority = selectors.PrefixOperator.prototype.priority + 1;
        lowPriorityPO.keyword = 'lowestPO';
        expect(lowPriorityPO.toString()).to.equal('lowestPO middlePO selector');
      });
    });
    describe('#toJSON()', () => {
      it('construct JSON for prefix operator created with no arguments', () => {
        expect(noArgumentedPO.toJSON()).to.deep.equal(noArgumentedPOAsJSON);
      });
      it('construct JSON for simple prefix operator', () => {
        expect(simplePO.toJSON()).to.deep.equal(simplePOAsJSON);
      });
    });
  });

  describe('InfixOperator', () => {
    const noneSelector = selectors.none();
    const letfSelector = selectors.all();
    letfSelector.keyword = 'lSelector';
    const rightSelector = selectors.all();
    rightSelector.keyword = 'rSelector';

    const noneSelectorIO = new selectors.InfixOperator();
    const noneSelectorIOAsString = [noneSelector.toString(), noneSelectorIO.keyword, noneSelector.toString()].join(' ');
    const noneSelectorIOAsJSON = [noneSelectorIO.name, noneSelector.toJSON(), noneSelector.toJSON()];

    const halfSelectorIO = new selectors.InfixOperator(letfSelector);
    const halfSelectorIOAsString = [letfSelector.toString(), halfSelectorIO.keyword, noneSelector.toString()].join(' ');
    const halfSelectorIOAsJSON = [halfSelectorIO.name, letfSelector.toJSON(), noneSelector.toJSON()];

    const selectorIO = new selectors.InfixOperator(letfSelector, rightSelector);
    const selectorIOAsString = [letfSelector.toString(), selectorIO.keyword, rightSelector.toString()].join(' ');
    const selectorIOAsJSON = [selectorIO.name, letfSelector.toJSON(), rightSelector.toJSON()];

    const highPriorityIO = new selectors.InfixOperator(letfSelector, rightSelector);
    highPriorityIO.priority = selectors.InfixOperator.prototype.priority - 2;
    highPriorityIO.keyword = '^';
    const lowPriorityIO = new selectors.InfixOperator(letfSelector, rightSelector);
    lowPriorityIO.priority = selectors.InfixOperator.prototype.priority + 2;
    lowPriorityIO.keyword = '+';

    describe('#toString()', () => {
      it('construct string for infix operator with no arguments', () => {
        expect(noneSelectorIO.toString()).to.equal(noneSelectorIOAsString);
      });
      it('construct string for infix operator with one argument', () => {
        expect(halfSelectorIO.toString()).to.equal(halfSelectorIOAsString);
      });
      it('construct string for simple infix operator', () => {
        expect(selectorIO.toString()).to.equal(selectorIOAsString);
      });
      it('construct string for complex infix operator with follow preorities: middle(high, low)', () => {
        const complexPO = new selectors.InfixOperator(highPriorityIO, lowPriorityIO);
        complexPO.keyword = '*';
        expect(complexPO.toString()).to.equal('lSelector ^ rSelector * (lSelector + rSelector)');
      });
      it('construct string for complex infix operator with follow preorities: middle(low, high)', () => {
        const complexPO = new selectors.InfixOperator(lowPriorityIO, highPriorityIO);
        complexPO.keyword = '*';
        expect(complexPO.toString()).to.equal('(lSelector + rSelector) * lSelector ^ rSelector');
      });
      it('construct string for complex infix operator with follow preorities: middle(low, low)', () => {
        const complexPO = new selectors.InfixOperator(lowPriorityIO, lowPriorityIO);
        complexPO.keyword = '*';
        expect(complexPO.toString()).to.equal('(lSelector + rSelector) * (lSelector + rSelector)');
      });
      it('construct string for complex infix operator with follow preorities: middle(high, high)', () => {
        const complexPO = new selectors.InfixOperator(highPriorityIO, highPriorityIO);
        complexPO.keyword = '*';
        expect(complexPO.toString()).to.equal('lSelector ^ rSelector * lSelector ^ rSelector');
      });
    });
    describe('#toJSON()', () => {
      it('construct JSON for infix operator with no arguments', () => {
        expect(noneSelectorIO.toJSON()).to.deep.equal(noneSelectorIOAsJSON);
      });
      it('construct JSON for infix operator with one argument', () => {
        expect(halfSelectorIO.toJSON()).to.deep.equal(halfSelectorIOAsJSON);
      });
      it('construct JSON for simple infix operator', () => {
        expect(selectorIO.toJSON()).to.deep.equal(selectorIOAsJSON);
      });
    });
  });

  describe('#GetSelector(key)', () => {
    selectors.Context.all = selectors.all();
    selectors.Context.noSelector = undefined;
    selectors.Context.none = selectors.none();
    it('throw exception for invalid keys', () => {
      expect(() => selectors.GetSelector('strangeKey')).to.throw();
    });
    it('Does not throw exception for valid keys', () => {
      expect(() => selectors.GetSelector('all')).to.not.throw();
    });
    it('return selector which corresponds to sent key', () => {
      expect(selectors.GetSelector('all')).to.deep.equal(selectors.all());
    });
    it('return Noneselector if key corresponds to undefined or empty value', () => {
      expect(selectors.GetSelector('noSelector')).to.deep.equal(selectors.none());
    });
  });

  describe('#ClearContext()', () => {
    selectors.Context.all = selectors.all();
    selectors.Context.noSelector = undefined;
    selectors.Context.none = selectors.none();
    it('make context to stop containing key which was in it before', () => {
      expect(selectors.GetSelector('all')).to.deep.equal(selectors.all());
      selectors.ClearContext();
      expect(() => selectors.GetSelector('all')).to.throw();
    });
  });

  describe('#keyword(key)', () => {
    selectors.Context.all = selectors.all();
    selectors.Context.noSelector = undefined;
    selectors.Context.none = selectors.none();
    it('return function for creating selector which corresponds to sent key', () => {
      expect(selectors.keyword('all')).to.deep.equal(selectors.all);
    });
    it('return function for creating Noneselector if key corresponds to undefined or empty value', () => {
      expect(selectors.keyword('strangeKey')).to.deep.equal(selectors.none);
    });
    it('return function for creating selector which corresponds to sent key in different case', () => {
      expect(selectors.keyword('aLl')).to.deep.equal(selectors.all);
    });
  });

  describe('#parse(str)', () => {
    const correctSelector = selectors.serial(new selectors.Range(1, 10));
    const errorMessage = 'errorMessage';
    const parser = {
      parse: (str) => {
        if (str === 'correctSelString') {
          return correctSelector;
        }
        const exc = { message: errorMessage };
        throw exc;
      },
    };
    const modifiedSelector = proxyquire('./selectors', { '../utils/SelectionParser': { parser } });

    it('returns object with correct selector in selector field if input string is correct selection string', () => {
      expect(modifiedSelector.default.parse('correctSelString').selector).to.deep.equal(correctSelector);
    });
    it('returns object with noneSelector in selector field if input string is incorrect selection string', () => {
      expect(modifiedSelector.default.parse('incorrectSelString').selector).to.deep.equal(selectors.none());
    });
    it('for selector string', () => {
      expect(modifiedSelector.default.parse('incorrectSelString').error).to.deep.equal(errorMessage);
    });
  });

  class AtomName {
    constructor(name) {
      this._name = name || null;
    }

    getString() {
      return this._name || 'unknown';
    }
  }

  const atom = {
    _serial: 5,
    _name: new AtomName('CA'),
    _location: 32,
    element: { name: 'N' },
    _residue: {
      _type: { _name: 'ALA', flags: 0x0000 },
      _sequence: 4,
      _icode: 'A',
      _index: 2,
      _chain: { _name: 'A' },
    },
    _het: false,
  };

  describe('SerialSelector', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including atom', () => {
        expect(selectors.serial(rFrom1To14).includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.serial(rFrom18To20).includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('NameSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._name._name = 'CA';
      it('check on correct including atom', () => {
        expect(selectors.name('CA').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.name('N').includesAtom(atom)).to.equal(false);
      });
      it('check on not being case sensitive', () => {
        expect(selectors.name('cA').includesAtom(atom)).to.equal(true);
      });
    });
  });

  describe('AltLocSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._location = 32;
      it('check on correct including atom', () => {
        expect(selectors.altloc(' ').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.altloc('A').includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('ElemSelector', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including atom', () => {
        expect(selectors.elem('N').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.elem('C').includesAtom(atom)).to.equal(false);
      });
      it('check on not being case sensitive', () => {
        expect(selectors.elem('n').includesAtom(atom)).to.equal(true);
      });
    });
  });

  describe('ResidueSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._type._name = 'ALA';
      it('check on correct including atom', () => {
        expect(selectors.residue('ALA').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.residue('CYS').includesAtom(atom)).to.equal(false);
      });
      it('check on not being case sensitive', () => {
        expect(selectors.residue('AlA').includesAtom(atom)).to.equal(true);
      });
    });
  });

  describe('SequenceSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._sequence = 4;
      it('check on correct including atom', () => {
        expect(selectors.sequence(rFrom1To14).includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.sequence(rFrom18To20).includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('ICodeSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._icode = 'A';
      it('check on correct including atom', () => {
        expect(selectors.icode('A').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.icode('F').includesAtom(atom)).to.equal(false);
      });
      it('check on being case sensitive', () => {
        expect(selectors.icode('a').includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('ResIdxSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._index = 2;
      it('check on correct including atom', () => {
        expect(selectors.residx(rFrom1To14).includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.residx(rFrom18To20).includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('ChainSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._chain._name = 'B';
      it('check on correct including atom', () => {
        expect(selectors.chain('B').includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        expect(selectors.chain('F').includesAtom(atom)).to.equal(false);
      });
      it('check on being case sensitive', () => {
        expect(selectors.chain('b').includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('HetatmSelector', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including hetatoms', () => {
        atom._het = true;
        expect(selectors.hetatm().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding hetatoms', () => {
        atom._het = false;
        expect(selectors.hetatm().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('PolarHSelector', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including atom', () => {
        atom.flags = Atom.Flags.HYDROGEN;
        expect(selectors.polarh().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        atom.flags = Atom.Flags.NONPOLARH;
        expect(selectors.polarh().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('NonPolarHSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._index = 2;
      it('check on correct including atom', () => {
        atom.flags = Atom.Flags.NONPOLARH;
        expect(selectors.nonpolarh().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding atom', () => {
        atom.flags = Atom.Flags.HYDROGEN;
        expect(selectors.nonpolarh().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('AllSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._index = 2;
      it('check on correct including atom', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
      });
    });
  });

  describe('NoneSelector', () => {
    describe('#includesAtom(atom)', () => {
      atom._residue._index = 2;
      it('check on correct excluding atom', () => {
        expect(selectors.none().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Protein', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including protein atom', () => {
        atom._residue._type.flags = ResidueType.Flags.PROTEIN;
        expect(selectors.protein().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not protein atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.protein().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Basic', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including basic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.BASIC;
        expect(selectors.basic().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not basic atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.basic().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Acidic', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including acidic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.ACIDIC;
        expect(selectors.acidic().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not acidic atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.acidic().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Charged', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including acidic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.ACIDIC;
        expect(selectors.charged().includesAtom(atom)).to.equal(true);
      });
      it('check on correct including basic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.BASIC;
        expect(selectors.charged().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not acidic or basic atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.charged().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Polar', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including polar atom', () => {
        atom._residue._type.flags = ResidueType.Flags.POLAR;
        expect(selectors.polar().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not polar atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.polar().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('NonPolar', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including nonPolar atom', () => {
        atom._residue._type.flags = ResidueType.Flags.NONPOLAR;
        expect(selectors.nonpolar().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not nonPolar atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.nonpolar().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Aromatic', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including aromatic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.AROMATIC;
        expect(selectors.aromatic().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not aromatic atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.aromatic().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Nucleic', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including nucleic atom', () => {
        atom._residue._type.flags = ResidueType.Flags.NUCLEIC;
        expect(selectors.nucleic().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not nucleic atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.nucleic().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Purine', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including purine atom', () => {
        atom._residue._type.flags = ResidueType.Flags.PURINE;
        expect(selectors.purine().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not purine atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.purine().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Pyrimidine', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including pyrimidine atom', () => {
        atom._residue._type.flags = ResidueType.Flags.PYRIMIDINE;
        expect(selectors.pyrimidine().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not pyrimidine atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.pyrimidine().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('Water', () => {
    describe('#includesAtom(atom)', () => {
      it('check on correct including water atom', () => {
        atom._residue._type.flags = ResidueType.Flags.WATER;
        expect(selectors.water().includesAtom(atom)).to.equal(true);
      });
      it('check on correct excluding not water atom', () => {
        atom._residue._type.flags = 0x0000;
        expect(selectors.water().includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('NotSelector', () => {
    describe('#includesAtom(atom)', () => {
      it('check on invert selector result from false to true', () => {
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.not(selectors.none()).includesAtom(atom)).to.equal(true);
      });
      it('check on invert selector result from false to true', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.not(selectors.all()).includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('AndOperator', () => {
    describe('#includesAtom(atom)', () => {
      it('check on conjunction true and true selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.and(selectors.all(), selectors.all()).includesAtom(atom)).to.equal(true);
      });
      it('check on conjunction true and false selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.and(selectors.all(), selectors.none()).includesAtom(atom)).to.equal(false);
      });
      it('check on conjunction false and true selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.and(selectors.none(), selectors.all()).includesAtom(atom)).to.equal(false);
      });
      it('check on conjunction false and false selector results', () => {
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.and(selectors.none(), selectors.none()).includesAtom(atom)).to.equal(false);
      });
    });
  });

  describe('OrOperator', () => {
    describe('#includesAtom(atom)', () => {
      it('check on disjunction true and true selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.or(selectors.all(), selectors.not(selectors.none())).includesAtom(atom)).to.equal(true);
      });
      it('check on disjunction true and false selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.or(selectors.all(), selectors.none()).includesAtom(atom)).to.equal(true);
      });
      it('check on disjunction false and true selector results', () => {
        expect(selectors.all().includesAtom(atom)).to.equal(true);
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.or(selectors.none(), selectors.all()).includesAtom(atom)).to.equal(true);
      });
      it('check on disjunction false and false selector results', () => {
        expect(selectors.none().includesAtom(atom)).to.equal(false);
        expect(selectors.or(selectors.not(selectors.all()), selectors.none()).includesAtom(atom)).to.equal(false);
      });
    });
  });
});