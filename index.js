const path = require('path')
const PatternPackager = require('./classes/PatternPackager')

const pathToExplorer = path.resolve(`X:/Resguardos/BackUps/Resguardos/RESGUARDOS 2021`)
const pathToPattern = path.resolve('data', 'pattern.csv')

const PatternPckg = new PatternPackager(pathToExplorer, pathToPattern)
PatternPckg.ComparePattern()