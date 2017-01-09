"use strict";

const BLOCKS_COUNT = 40;

var co = require('co');

module.exports = ($scope, $state, $timeout, Webmin, UIUtils, Graph) => {

  let data = {};

  $scope.loading = true;
  $scope.blocksCount = $scope.blocksCount || BLOCKS_COUNT;

  $scope.$watch('withTime', (newValue) => {
    if (newValue) {
      timeGraph();
    }
  });

  $scope.$watch('withSpeed', (newValue) => {
    if (newValue) {
      speedGraph();
    }
  });

  $scope.$watch('withDifficulty', (newValue) => {
    if (newValue) {
      diffGraph();
    }
  });

  $scope.updateGraphs = () => {
    return co(function *() {
      let summary = yield Webmin.summary();
      let parameters = yield Webmin.currency.parameters();
      let blocks = yield Webmin.blockchain.blocks({
        count: $scope.blocksCount,
        from: Math.max(0, summary.current.number - $scope.blocksCount)
      });
      let speeds = [], accelerations = [], medianTimeIncrements = [], actualDurations = [];
      let BY_HOUR = 3600;
      for (let i = 0, len = blocks.length; i < len; i++) {
        let block = blocks[i];
        let acc = 0;
        let previousPos = Math.max(0, i - parameters.dtDiffEval);
        for (let j = previousPos; j < i; j++) {
          acc += (blocks[j+1].medianTime - blocks[j].medianTime);
        }
        let availPreviousBlocks = i - 1 - previousPos;
        let localAvgSpeed = acc / (availPreviousBlocks || 1);
        let realDuration = !isNaN(localAvgSpeed) && localAvgSpeed != 0 ? localAvgSpeed : parameters.avgGenTime;
        actualDurations.push(parseFloat((realDuration).toFixed(2)));
        speeds.push(parseFloat((BY_HOUR/realDuration).toFixed(2)));
        accelerations.push(block.time - block.medianTime);
        medianTimeIncrements.push(block.medianTime - (i ? blocks[i-1].medianTime : block.medianTime));
      }
      data.summary = summary;
      data.speeds = speeds;
      data.accelerations = accelerations;
      data.medianTimeIncrements = medianTimeIncrements;
      data.actualDurations = actualDurations;
      data.minSpeeds = speeds.map(() => parseFloat((BY_HOUR/Math.ceil(parameters.avgGenTime * Math.sqrt(1.066))).toFixed(2)));
      data.maxSpeeds = speeds.map(() => parseFloat((BY_HOUR/Math.floor(parameters.avgGenTime / Math.sqrt(1.066))).toFixed(2)));
      data.minDurations = speeds.map(() => parseFloat(((parameters.avgGenTime / 1.066)).toFixed(2)));
      data.maxDurations = speeds.map(() => parseFloat(((parameters.avgGenTime * 1.066)).toFixed(2)));
      data.difficulties = blocks.map((b) => b.powMin);

      let graphs = [];
      if ($scope.withTime) graphs.push(timeGraph);
      if ($scope.withSpeed) graphs.push(speedGraph);
      if ($scope.withDifficulty) graphs.push(diffGraph);
      for (let i = 0, len = graphs.length; i < len; i++) {
        graphs[i]();
      }
      $scope.loading = false;
    });
  };

  function timeGraph() {
    if ($scope.withTime) {
      Graph.timeGraphs('#timeGraph', Math.max(0, data.summary.current.number - $scope.blocksCount + 1), data.accelerations, data.medianTimeIncrements, data.actualDurations, data.minDurations, data.maxDurations);
    }
  }

  function speedGraph() {
    if ($scope.withSpeed) {
      Graph.speedGraph('#speedGraph', Math.max(0, data.summary.current.number - $scope.blocksCount), data.speeds, data.minSpeeds, data.maxSpeeds, (series) => {
        $scope.series = series;
      });
    }
  }

  function diffGraph() {
    if ($scope.withDifficulty) {
      Graph.difficultyGraph('#difficultyGraph', Math.max(0, data.summary.current.number - $scope.blocksCount), data.difficulties);
    }
  }

  return co(function *() {
    yield $scope.updateGraphs();
    $scope.withTime = true;
    $scope.withDifficulty = true;
    $scope.$apply();
  });
};
