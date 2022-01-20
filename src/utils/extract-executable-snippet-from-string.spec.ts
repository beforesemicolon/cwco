import {extractExecutableSnippetFromString} from './extract-executable-snippet-from-string';

describe('extractExecutableSnippetFromString', () => {
  
  it('should extract pair curly braces content with default start and end symbol', () => {
    [
      ['{item}', 'item'],
      ['{{item}', 'item'],
      ['}{item}', 'item'],
      ['{item}}', 'item'],
      ['{item}{', 'item'],
      ['{{sample: 12}}', '{sample: 12}'],
      ['{{sample: 12, x: {text: "super"}}}', '{sample: 12, x: {text: "super"}}'],
      ['{{sample: 12, x: {text: "super"}}} {sample}', '{sample: 12, x: {text: "super"}}', 'sample'],
      ['{sample} {test}', 'sample', 'test'],
      ['{list.push({name: "sample"})} {{sample: 12}} {test}', 'list.push({name: "sample"})', '{sample: 12}', 'test'],
      ['{sample - test} {}', 'sample - test'],
      ['({my {work}})', 'my {work}'],
    ].forEach(([str, ...execs]) => {
      extractExecutableSnippetFromString(str).forEach((res, i) => {
        const executable = execs[i];
        expect(res.executable).toEqual(executable);
        expect(res.match).toEqual(`{${executable}}`);
      })
    })
  });

  it('should extract pair curly braces content with provided start and end symbol', () => {
    [
      ['[item]', 'item'],
      ['[[item]', 'item'],
      ['][item]', 'item'],
      ['[item]]', 'item'],
      ['[item][', 'item'],
      ['[[sample: 12]]', '[sample: 12]'],
      ['[[sample: 12, x: [text: "super"]]]', '[sample: 12, x: [text: "super"]]'],
      ['[[sample: 12, x: [text: "super"]]] [sample]', '[sample: 12, x: [text: "super"]]', 'sample'],
      ['[sample] [test]', 'sample', 'test'],
      ['[list.push([name: "sample"])] [[sample: 12]] [test]', 'list.push([name: "sample"])', '[sample: 12]', 'test'],
      ['[sample - test] []', 'sample - test'],
      ['([my [work]])', 'my [work]'],
      ['[theme.color["100"]]', 'theme.color["100"]'],
    ].forEach(([str, ...execs]) => {
      extractExecutableSnippetFromString(str, ['[', ']']).forEach((res, i) => {
        const executable = execs[i];
        expect(res.executable).toEqual(executable);
        expect(res.match).toEqual(`[${executable}]`);
      })
    })
  });
});
