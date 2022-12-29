const fs = require('fs');
const { plot } = require('nodeplotlib');

(async () => {

    const myArgs = process.argv.slice(2);
    let plots = [];

    for (const tool of myArgs) {
        let rawdata = fs.readFileSync(`tools/${tool}.json`);
        let timeline = JSON.parse(rawdata);
        const sortDate = (a, b) => b < a ? -1 : (a > b ? 1 : 0);
        const parseCount = count => parseFloat(count) * (count.includes("K") ? 1000 : 1);
        timeline.sort((a, b) => sortDate(a.time, b.time));
        let times = timeline.map(({ time }) => time);
        let stacks = timeline.map(({ stacks }) => parseCount(stacks));

        plots.push({ x: times, y: stacks, type: 'scatter', name: tool });
    }

    plot(plots);

})();

