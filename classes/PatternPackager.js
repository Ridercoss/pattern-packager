const fs = require('fs').promises
const path = require('path')
const CsvToJson = require('convert-csv-to-json')
const uniqid = require('uniqid')
const moment = require('moment')

/**
 * @class PatternPackager
 * @description Busca, y crea paquetes de resguardos para presentar evidencias de auditorias, basadas en un archivo digital
 */
class PatternPackager {

    /**
     * @constructor
     * @param { String } directory 
     * @param { String } patternFile 
     */
    constructor( directory, patternFile, mode ) {
        this.Directory = directory
        this.Patterns = patternFile
        this.OperationId = null
        this.ReceivesDirectory = path.resolve('receives')
        this.Mode == null

        if ( mode == 'CHECK' || mode == 'PACK' ) {
            this.Mode = mode
            this.OperationId = (mode == 'PACK') ? uniqid.time(`pack-${ moment().format('YYYYMMDD') }-`) : uniqid.time(`check-${ moment().format('YYYYMMDD') }-`)
        } else {
            throw 'ERROR: <mode> requiere valores especificos para identificar la operación a realizar CHECK | PACK'
        }
    }

    /**
     * @method PatternToSearch
     * @returns { Array }
     */
    PatternToSearch = async () => {
        try {
            if ( this.Mode != null ) {

                console.log ( this.Mode )
                if ( this.Mode == 'PACK' ) {
                    
                    // Leer archivo de patrones
                    let patt = await fs.readFile( this.Patterns, {"encoding": "utf-8"})
                    // Quitar saltos de linea
                    let patterns = (patt.toString()).split(`\r\n`)

                    
                    console.log( 'Patterns TO PACK' )
                    console.log( patterns.length )

                    // Regresar Array de elementos unicos
                    return patterns

                } else if ( this.Mode == 'CHECK' ) {

                    // Inicializar Modulo de conversión a JSON
                    let jsonPatterns = CsvToJson.fieldDelimiter(',').getJsonFromCsv( this.Patterns )

                    console.log( 'Patterns TO CHECK' )
                    console.log( jsonPatterns.length )

                    // Regresar JSON
                    return jsonPatterns

                }

            } else {
                throw 'ERROR: El modeo es NULO'
            }

        } catch (error) {
            return error
        }
    }

    FilesInDirectory = async () => {
        try {
            // Cargar Resguardos en directorio
            let files = await fs.readdir(this.Directory)
            return files
        } catch (error) {
            return error
        }
    }

    MakeDirOperation = async () => {
        try {
            // Establecer un directorio de recepción
            let dir = path.resolve(this.ReceivesDirectory, `${ this.OperationId }`)
            // Crear directorio de recepción
            await fs.mkdir( dir )

        } catch (error) {
            return error
        }
    }

    ComparePattern_PACK = async () => {
        try {
            // Crear directorio de operación
            this.MakeDirOperation()
            // Cargar archivos en directorio
            let files = await this.FilesInDirectory()
            // Cargar patrones a buscar (Resguardos requeridos)
            let patterns = await this.PatternToSearch()
            // Transformar en formato de nomenclatura de archivo
            patterns = (patterns.map((v) => (v.split('-')).join('-')))
            // Reservar espacio para indice de coincidencias
            let filex = []
            
            for ( let i = 0; i < files.length; i++ ) {
                for ( let j = 0; j < patterns.length; j++ ) {

                    console.log( 'Archivo en proceso: ' )
                    console.log( files[i].substr(0, 11) )
                    console.log( 'Patron de comparación: ' )
                    console.log( patterns[j] )

                    // Comparar archivos con patrones de resguardo
                    if ( files[i].substr(0, 11) == patterns[j] ) {
                        // Agregar archivos al listado de coincidencias
                        filex.push( path.resolve(this.Directory, files[i]) )
                        // Copiar el archivo al directorio de recepción
                        await fs.copyFile( path.resolve(this.Directory, files[i]), path.resolve(this.ReceivesDirectory, this.OperationId, files[i]) )

                    }

                }
            }

            // Crear Archivo de paquete
            let doc = await fs.writeFile(path.resolve('results', `${this.OperationId}.txt`), filex.join(`\r\n`))

        } catch (error) {
            return error
        }
    }

    ComparePattern_CHECK = async () => {
        try {
            
            // Crear directorio de operación
            this.MakeDirOperation()
            // Cargar archivos en directorio
            let files = await this.FilesInDirectory()
            // Cargar patrones a buscar (Resguardos requeridos)
            let patterns = await this.PatternToSearch()
            let patterns_folios = patterns.map((v) => v.resguardo )
            console.log( patterns_folios )

            console.log( 'Inicializando Modulo para archivo EXCEL' )
            let Excel = require('exceljs')		
            let workbook = new Excel.Workbook()
            let sheetLocalizados = workbook.addWorksheet('LOCALIZADOS')
            let sheetSinPatrones = workbook.addWorksheet('SIN_PATRON')

            console.log( 'Generando Columnas para LOCALIZADOS' )
            sheetLocalizados.columns = [
                { header: 'Resguardo', key: 'folio', width: 10 },
                { header: 'Fecha', key: 'fecha', width: 32 },
                { header: 'Resguardante', key: 'resguardante', width: 10 },
                { header: 'Depto Id', key: 'depto_id', width: 10 },
                { header: 'Depto', key: 'depto', width: 10 },
                { header: 'Zona', key: 'zona', width: 10 },
                { header: 'Digital', key: 'digital', width: 10 }
            ]

            console.log( 'Generando Columnas para SIN_PATRON' )
            sheetSinPatrones.columns = [
                { header: 'folio', key: 'folio', width: 10 }
            ]

            // Reservar espacio para indice de coincidencias
            //let file_ok = []
            //let file_not = []
            
            console.log( 'Inicializando Loop <Por Archivos en Directorio>' )
            for ( let i = 0; i < files.length; i++ ) {
                console.log(`BUSCANDO: <${ files[i].substr(0, 11) }>`)
                let idxPattern = patterns_folios.indexOf(files[i].substr(0, 11))
                console.log(`ESTADO: ${ (idxPattern > -1 ) ? 'LOCALIZADO' : 'SIN PATRON' }`)
                if ( idxPattern != -1 ) {
                    
                    sheetLocalizados.addRow({
                        "folio": patterns[ idxPattern ].resguardo,
                        "fecha": patterns[ idxPattern ].fecha,
                        "resguardante": patterns[ idxPattern ].resguardante,
                        "depto_id": patterns[ idxPattern ].depto_id,
                        "depto": patterns[ idxPattern ].departamento,
                        "zona": patterns[ idxPattern ].zona,
                        "digital": 'SI'
                    })

                    patterns_folios.splice( idxPattern, 1 )
                    patterns.splice( idxPattern, 1 )

                } else {
                    sheetSinPatrones.addRow({
                        "folio": files[i].substr(0, 11)
                    })
                }

            }

            console.log('Tamaño de lista de patrones actual: ', patterns.length)
            console.log('<< Iniciando recorrido de faltantes >>')
            for ( let i = 0; i < patterns.length; i++ ) {
                
                sheetLocalizados.addRow({
                    "folio": patterns[ i ].resguardo,
                    "fecha": patterns[ i ].fecha,
                    "resguardante": patterns[ i ].resguardante,
                    "depto_id": patterns[ i ].depto_id,
                    "depto": patterns[ i ].departamento,
                    "zona": patterns[ i ].zona,
                    "digital": 'NO'
                })

            }

            await workbook.xlsx.writeFile( path.resolve(`${ this.ReceivesDirectory }`, `${ this.OperationId }`, `Revision.xlsx`) )

            // Crear Archivo de paquete
            let doc = await fs.writeFile(path.resolve('results', `${this.OperationId}.txt`), filex.join(`\r\n`))


        } catch (error) {
            return error
        }
    }

    Execute = async () => {
        try {
            
            if ( this.Mode == 'PACK' ) {

                await this.ComparePattern_PACK()

            } else if ( this.Mode == 'CHECK' ) {

                await this.ComparePattern_CHECK()

            }

        } catch (error) {
            throw error
        }
    }
}

module.exports = PatternPackager