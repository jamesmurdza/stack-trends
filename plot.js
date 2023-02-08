const fs = require('fs');
const { plot } = require('nodeplotlib');
const numeric = require('numeric');

const { functionToFit } = require("./regression");

(async () => {

    const myArgs = process.argv.slice(2);
    let plots = [];

    for (const tool of myArgs) {
        let rawdata = fs.readFileSync(`tools/${tool}.json`);
        let timeline = JSON.parse(rawdata);
        const sortDate = (a, b) => b < a ? -1 : (a > b ? 1 : 0);
        const parseCount = count => parseFloat(count) * (count.includes("K") ? 1000 : 1) + (count.includes("K") ? 500 : 0);
        timeline.sort((a, b) => sortDate(a.time, b.time));
        let times = timeline.map(({ time }) => time);
        let stacks = timeline.map(({ stacks }) => parseCount(stacks));

        let ms = times.map(time => (new Date(time)).getTime());
        const bestFitFunction = functionToFit(ms, stacks, 1);
        const projection = x => Math.max(bestFitFunction(x), 0);

        const trendline = ms.map(projection);
        plots.push({ x: times, y: stacks, type: 'scatter', mode: 'markers', name: tool });
        plots.push({ x: times, y: trendline, type: 'line', mode:'lines', name: tool });

        const years = [2020, 2021, 2022, 2023];
        const yearsMs = years.map(year => (new Date(year, 1, 1)).getTime());
        const yearProjections = yearsMs.map(year => Math.round(projection(year)/100)*100);
        plots.push({ x: years, y: yearProjections, type: 'bar', name: tool });
    }

    plot(plots);

})();

