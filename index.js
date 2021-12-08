const path = require('path')
const PatternPackager = require('./classes/PatternPackager')

const pathToExplorer = path.resolve(`X:/Resguardos/BackUps/Resguardos/RESGUARDOS 2021`)
const pathToPattern = path.resolve('data', 'resguardos_2021-12-08_1108.csv')

const PatternPckg = new PatternPackager(pathToExplorer, pathToPattern, 'CHECK')
PatternPckg.Execute()