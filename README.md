JavascriptAnnotations
======

AnnotationsParser is a standalone annotations parser for javascript built to parse JSON objects, classes or object instances.
It supports a special types of annotation built to set multiple metadata without annotation definition and external libraries.

### How it works:

Each function can have annotations. The annotations must be in a doc comment into the function body. (Normally this is inserted before the function. To allow the engine to work without javascript engine modifications and remaining compatible with previous versions of javascript you had to resort to this trick).

Example:
```javascript
MyClass.method = function() {
  /**
   * @annotation value
   * */
   
   someCode();
  } ;
```

To create annotations on the class you must create a special magic function named "\_". The annotations of this function will be added to the class directly. The AnnotationsParser will call the function "\_" during the parsing to create the ClassAnnotationContext (see folloing).

When AnnotationsParser parse a class it create a ClassAnnotations object and ClassAnnotationContext object.

### Example:
```javascript
var classAnnotations = AnnotationsParser.parseClass('MyClass');
```
Now the AnnotationsParser try to call (if exists) the magic function "\_":
```javascript
classAnnotationContext.data = MyClass._(classAnnotationContext, classAnnotations);
```
Then put all annotations of the function "\_" into as class annotations. In this way the magic function can read the annotations and other class data to create a user-defined classAnnotationContext data (class metadata).

### The ClassAnnotationsContext object:

The ClassAnnotationContext is an object that capture the data from the magic function "\_" and from some special annotations, il also get a list of method with particular annotations.
This object can used to extend more the reflection potentialities. For example you can get the list of methods that have the "@?Example" annotation automatically from the ClassAnnotationContext. It sounds like a query into the class/object.

### The ClassAnnotations object:

This is the main object to read informations about the class and methods annotations:

#### Get the ClassAnnotationsContext object:
```javascript
  classAnnotations.getContext()
```
#### Get the annotation's value of a method:
```javascript
  classAnnotations.getAnnotation("method","annotation") 
```
#### Get full annotation's metadata of a method:
```javascript
  classAnnotations.getAnnotationData("method","annotation") 
```
#### Get the annotation's value of the class:
```javascript
  classAnnotations.getClassAnnotation("annotation") 
```
#### Get full annotation's metadata of the class:
```javascript
  classAnnotations.getClassAnnotationData("annotation") 
```
#### Get all annotations of all methods:
```javascript
  classAnnotations.getAllAnnotations() 
```
Return an object that the properties are the class methods and the values are objects filled by name and values of annotations.
#### Get all annotations of a method:
```javascript
  classAnnotations.getAllMethodAnnotations("method") 
```
Return an object filled by annotations names and values.
#### Get all annotations of the class:
```javascript
  classAnnotations.getAllClassAnnotations() 
```
Return an object filled by annotations names and values.

### Extended annotations types:

All annotations can be simple, array, object and added to ClassAnnotationsContext or not.

All annotations name stats with the character "@".

If the character "@" is followed by the character "?" the annotation is added to the relative section of ClassAnnotationsContext automatically.

To insert a method into a ClassAnnotationsContext's methods list, add to the method an annotation starting with: "@?"

If the annotation name ends with "\[\]" the annotation type is Array.

If the annotation name ends with "\[someString\]" the annotation type is Object.


### Base annotations types:
<pre>Boolean:
/**
 * @annotation
 * */
 
String: 
/**
 * @annotation String value
 * */
 
List: 
 /**
  * @annotation: item1, item2, item3
  * */
  
Multiline (String) : 
 /**
  * @annotation {
  * line1
  * line2
  * line3
  * }
  * */
  
Multiline (String) : 
 /**
  * @annotation (
  * line1
  * line2
  * line3
  * )
  * */  
</pre>

### Example of mixed annotation types:
<pre>

@stringArray[] value0
@stringArray[] value1

@stringObject[a] value of "a"
@stringObject[b] value of "b"

@list: item0, item1, item2, item3

@listArray[]: item00, item01, item02
@listArray[]: item10, item11, item12

@boolean

@?booleanInContext
@?stringInContext String value

@?stringArrayInContext[] velue0
@?stringArrayInContext[] velue1
</pre>
