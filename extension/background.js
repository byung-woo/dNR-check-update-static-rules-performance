function getAverageAfterRemovingOutliers(arr) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  let avg = average(arr);
  let std = Math.sqrt(
    arr.map((v) => Math.pow(v - avg, 2)).reduce((p, c) => p + c, 0) /
      (arr.length - 1)
  );
  let max_limit = avg + 2 * std;
  let min_limit = avg - 2 * std;
  return average(arr.filter((v) => v <= max_limit && v >= min_limit));
}

function checkDisableStaticRulesPerformanceAndTestAgainAfterEnableAllRules(resolve) {
    let disabled_rules_count = test_context.disabled_rules_count_list[test_context.index];
    let option = {
      rulesetId: 'ruleset',
      disableRuleIds: [],
      enableRuleIds: []
    };

    option.disableRuleIds = Array.from({length: disabled_rules_count}, (_, i) => i + 10001);

    var start = performance.now();
    chrome.declarativeNetRequest.updateStaticRules(
        option,
        (result) => {
      let perf = performance.now() - start;
      let disabled_rules_count = test_context.disabled_rules_count_list[test_context.index];
      test_context.results[test_context.index].push(perf);

      chrome.declarativeNetRequest.updateStaticRules(
          { rulesetId: 'ruleset', disableRuleIds: [], enableRuleIds: [10001] },
          (resolve) => {
        if (test_context.iteration >= 101) {
          test_context.index += 1;
          new Promise(startTest);
        } else {
          test_context.iteration += 1;
          new Promise(checkDisableStaticRulesPerformanceAndTestAgainAfterEnableAllRules);
        }
      });
    });
}

function startTest(resolve) {
  if (test_context.index >= test_context.disabled_rules_count_list.length) {
    console.error('Test finished');
    for (const [i, perfs] of Object.entries(test_context.results)) {
      console.error(test_context.disabled_rules_count_list[i] + ": " +
                    getAverageAfterRemovingOutliers(perfs));
    }
  } else {
    test_context.results[test_context.index] = [];
    test_context.iteration = 0;
    let disabled_rules_count = test_context.disabled_rules_count_list[test_context.index];
    console.error('check with ' + disabled_rules_count + ' disabled rules: ');

    new Promise(checkDisableStaticRulesPerformanceAndTestAgainAfterEnableAllRules);
  }
}

var test_context = {
  index: 0,
  iteration: 0,
  disabled_rules_count_list: Array.from({length: 21}, (_, i) => i * 250),
  results: {},
};

console.error('Start test');

new Promise(startTest);
