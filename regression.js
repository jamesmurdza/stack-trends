// https://gist.github.com/jgphilpott/d38279e8fac9af31054e10b7363bf17e
function polyfit(xArray, yArray, order) {
  if (xArray.length <= order) console.warn("Warning: Polyfit may be poorly conditioned.")
  let xMatrix = []
  let yMatrix = numeric.transpose([yArray])

  for (let i = 0; i < xArray.length; i++) {
    let temp = []
    for (let j = 0; j <= order; j++) {
      temp.push(Math.pow(xArray[i], j))
    }
    xMatrix.push(temp)
  }

  let xMatrixT = numeric.transpose(xMatrix)
  let dot1 = numeric.dot(xMatrixT, xMatrix)
  let dot2 = numeric.dot(xMatrixT, yMatrix)
  let dotInv = numeric.inv(dot1)
  let coefficients = numeric.dot(dotInv, dot2)
  return numeric.transpose(coefficients)[0]
}

function functionWithCoefficients(coefficients) {
    return function (x) {
        const parts = coefficients.map((next, index) => next * (x ** index));
        return parts.reduce((a, b) => a + b, 0);
    }
}

function functionToFit(xArray, yArray, order) {
      return functionWithCoefficients(polyfit(xArray, yArray, order))
}

module.exports = { polyfit, functionWithCoefficients, functionToFit };
