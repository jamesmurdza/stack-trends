import { globby } from 'globby';
import fs from 'fs';
import { plot } from 'nodeplotlib';
import { promisify } from 'util';

import { functionToFit } from './regression.js';

let tools = process.argv.slice(2);
if (tools.length == 0) {
    tools = await globby("tools/*.json");
    tools = tools.map(path => path.match("\/(.*)\.json")[1]);
}

let results = [];

for (const tool of tools) {
    let path = `tools/${tool}.json`;
    let rawdata = fs.readFileSync(path);
    let timeline = JSON.parse(rawdata);
    const sortDate = (a, b) => b < a ? -1 : (a > b ? 1 : 0);
    const parseCount = count => parseFloat(count) * ((count || "").includes("K") ? 1000 : 1);
    timeline.sort((a, b) => sortDate(b.time, a.time));
    let times = timeline.map(({ time }) => (new Date(time)).getTime());
    let stacks = timeline.map(({ stacks }) => parseCount(stacks));

    let dateB = (new Date("1 Jan 2023")).getTime();
    let dateA = (new Date("1 Jan 2022")).getTime();

    let ms = times.map(time => (new Date(time)).getTime());

    let bestFitFunction;
    try {
        bestFitFunction = functionToFit(ms, stacks, 2);
    } catch (error) {
        bestFitFunction = x => null;
    }
    const projection = x => Math.max(bestFitFunction(x), 0);

    let increase = projection(dateB) / projection(dateA);
    let last = timeline[timeline.length-1];
    if (stacks[stacks.length - 1] > 200)
        results.push({
            'id': tool,
            'name': last.name,
            'image': last.image,
            'description': last.description,
            'growth': Math.round(increase * 100 - 100) || 0,
            'year1': Math.round(projection(dateA)),
            'year2': Math.round(projection(dateB)),
        });
}

const sortResult = (a, b) => b < a ? -1 : (a > b ? 1 : 0);
results.sort((a, b) => sortResult(a.growth, b.growth));

const writeFileAsync = promisify(fs.writeFile)
const res = await writeFileAsync("./compare/compare.json", JSON.stringify(results));

for (let result of results) {
    console.log(`${result.growth}%\t${result.year1}\t${result.year2}\t${result.name} (${result.id})`)
}

