const fs = require('fs').promises
const path = require('path')
const uniqid = require('uniqid')

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
    constructor( directory, patternFile ) {
        this.Directory = directory
        this.Patterns = patternFile
        this.OperationId = uniqid('scan-')
        this.ReceivesDirectory = path.resolve('receives')
    }

    /**
     * @method PatternToSearch
     * @returns { Array }
     */
    PatternToSearch = async () => {
        try {
            // Leer archivo de patrones
            let patt = await fs.readFile( this.Patterns, {"encoding": "utf-8"})
            // Quitar saltos de linea
            let patterns = (patt.toString()).split(`\r\n`)
            // Regresar Array de elementos unicos
            return patterns

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

    ComparePattern = async () => {
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
}

module.exports = PatternPackager