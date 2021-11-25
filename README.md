# Pattern Packager

Aplicación de NODE JS, que recorre un listado de patrones para buscar dentro de un direcotorio de archivos, copia las coincidencias a un directorio interno.

La idea General es poder extraer grupos de archivos grandes, con un patron coincidente, de tal manera en la que se pueda crear un nuevo archivo digital, o paquete de archivos para diferentes fines.

La aplicación ha sido subida sin directorios requeridos, ya que son donde ocurren las operaciones. Dichos directorios son los siguientes:

- data
  - Guarda listado de patrones en formato "csv"
- receives
  - Genera directorios de operaciones, con los archivos que hayan coincidido con los patrones proporcionados
- results
  - Aquí se generan listados de direcciones de los archivos coincidentes correspondientes a los ID's de Operacion en almacenados en la carpeta "receives"

## Forma de uso

Se crea una instancia de la clase que se encarga de realizar las operaciones, de la siguiente manera:

~~~
new PatternPackager(pathToExplorer, pathToPattern)
~~~

Donde _pathToExplorer_ es el directorio que se pretende escanear por archivos.
_pathToPattern_ es la dirección donde se encuentran los patrones buscados.

Posterior a crear la instancia es necesario llamar el método _ComparePattern_

~~~
PatternPackager.ComparePattern()
~~~

## WIP

- Los siguientes objetivos, serán hacer más flexible la clase
  - Se requiere poder delimitar con más presición los patrones que se pretenden buscar
- Generar Indices dentro de los directorios para agilizar las busquedas
- Crear una interfaz de usuario para la fácil operación