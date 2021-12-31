import {turnCamelToKebabCasing} from './turn-camel-to-kebab-casing';

describe('turnCamelToKebabCasing', () => {
  it('should turn camel case to kebab', () => {
    expect(turnCamelToKebabCasing('some')).toEqual('some')
    expect(turnCamelToKebabCasing('someName')).toEqual('some-name')
    expect(turnCamelToKebabCasing('someNameTest')).toEqual('some-name-test')
  });
  
  it('should turn pascal case to kebab', () => {
    expect(turnCamelToKebabCasing('Some')).toEqual('some')
    expect(turnCamelToKebabCasing('SomeName')).toEqual('some-name')
    expect(turnCamelToKebabCasing('SomeNameTest')).toEqual('some-name-test')
    expect(turnCamelToKebabCasing('SomeNameTestDST')).toEqual('some-name-test-dst')
    expect(turnCamelToKebabCasing('SomeNameDSTTest')).toEqual('some-name-dst-test')
    expect(turnCamelToKebabCasing('DSTTag')).toEqual('dst-tag')
  });
});